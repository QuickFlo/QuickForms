<script setup lang="ts">
import { computed, ref } from 'vue';
import { QInput, QIcon, QTooltip } from 'quasar';
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
  tooltip,
  tooltipPlacement,
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

      <!-- Prepend slot: custom icon and/or tooltip -->
      <template v-if="showPrependIcon || (tooltipPlacement === 'prepend' && tooltip)" #prepend>
        <QIcon v-if="tooltipPlacement === 'prepend' && tooltip" name="info" size="xs" color="grey-6" class="cursor-help q-mr-xs">
          <QTooltip><span v-html="tooltip"></span></QTooltip>
        </QIcon>
        <QIcon
          v-if="showPrependIcon"
          :name="quickformsFeatures.prependIcon!"
          :color="iconConfig.color"
          :size="iconConfig.size"
        />
      </template>

      <!-- Append slot: password toggle, custom icons, and/or tooltip -->
      <template v-if="isPasswordField || showAppendIcon || (tooltipPlacement === 'append' && tooltip)" #append>
        <QIcon
          v-if="isPasswordField"
          :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPasswordVisible = !isPasswordVisible"
        />
        <QIcon
          v-else-if="showAppendIcon"
          :name="quickformsFeatures.appendIcon!"
          :color="iconConfig.color"
          :size="iconConfig.size"
        />
        <QIcon v-if="tooltipPlacement === 'append' && tooltip" name="info" size="xs" color="grey-6" class="cursor-help">
          <QTooltip><span v-html="tooltip"></span></QTooltip>
        </QIcon>
      </template>
    </QInput>
  </div>
</template>
