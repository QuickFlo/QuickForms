<script setup lang="ts">
import { computed, ref } from 'vue';
import { QInput, QIcon } from 'quasar';
import type { FieldProps } from '@quickflo/quickforms-vue';
import { useQuasarFormField } from '../composables/useQuasarFormField';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const {
  value,
  label,
  hint,
  errorMessage,
  fieldId,
  quasarProps,
  quickformsFeatures,
  fieldGap,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'input',
});

// Password visibility toggle
const isPasswordVisible = ref(false);

const inputType = computed(() => {
  if (props.schema.format === 'email') return 'email';
  if (props.schema.format === 'url' || props.schema.format === 'uri') return 'url';
  if (props.schema.format === 'password') {
    return isPasswordVisible.value ? 'text' : 'password';
  }
  if (props.schema.format === 'textarea') return 'textarea';
  return 'text';
});

const isTextarea = computed(() => {
  return (
    props.schema.format === 'textarea' ||
    (props.schema.maxLength && props.schema.maxLength > 200)
  );
});


const isPasswordField = computed(() => props.schema.format === 'password');

// Icon configuration with proper defaults
const iconConfig = computed(() => ({
  color: quickformsFeatures.value.iconColor || 'grey-7',
  size: quickformsFeatures.value.iconSize || 'sm'
}));

// Show prepend icon unless it conflicts with something else
const showPrependIcon = computed(() => !!quickformsFeatures.value.prependIcon);

// Show append icon only if NOT a password field (password toggle takes precedence)
const showAppendIcon = computed(() => 
  !isPasswordField.value && !!quickformsFeatures.value.appendIcon
);
</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <QInput
      :id="fieldId"
      v-model="value"
      :label="label"
      :hint="hint"
      :type="isTextarea ? 'textarea' : inputType"
      :error="!!errorMessage"
      :error-message="errorMessage || undefined"
      :disable="disabled"
      :readonly="readonly"
      :required="schema.required"
      v-bind="quasarProps"
    >
      <template v-if="schema.required" #label>
        {{ label }} <span style="color: red">*</span>
      </template>
      
      <!-- Prepend icon slot -->
      <template v-if="showPrependIcon" #prepend>
        <QIcon
          :name="quickformsFeatures.prependIcon!"
          :color="iconConfig.color"
          :size="iconConfig.size"
        />
      </template>
      
      <!-- Append slot: password toggle takes precedence over custom icons -->
      <template v-if="isPasswordField" #append>
        <QIcon
          :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPasswordVisible = !isPasswordVisible"
        />
      </template>
      <template v-else-if="showAppendIcon" #append>
        <QIcon
          :name="quickformsFeatures.appendIcon!"
          :color="iconConfig.color"
          :size="iconConfig.size"
        />
      </template>
    </QInput>
  </div>
</template>
