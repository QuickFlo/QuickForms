<script setup lang="ts">
import { QInput, QPopupProxy, QTime, QIcon, QTooltip } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";

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
  fieldGap,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'datetime',
});

// Initialize undefined to null for Quasar compatibility
if (value.value === undefined) {
  value.value = null;
}
</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <QInput
      :id="fieldId"
      v-model="value"
      :label="label"
      :hint="hint"
      :error="!!errorMessage"
      :error-message="errorMessage || undefined"
      :disable="disabled"
      :readonly="readonly"
      :required="schema.required"
      v-bind="quasarProps"
    >
      <template #prepend>
        <QIcon v-if="tooltipPlacement === 'prepend' && tooltip" name="info" size="xs" color="grey-6" class="cursor-help q-mr-xs">
          <QTooltip><span v-html="tooltip"></span></QTooltip>
        </QIcon>
        <q-icon name="access_time" class="cursor-pointer">
          <QPopupProxy cover transition-show="scale" transition-hide="scale">
            <QTime v-model="value" mask="HH:mm:ss">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </QTime>
          </QPopupProxy>
        </q-icon>
      </template>
      <template v-if="schema.required" #label>
        {{ label }} <span style="color: red">*</span>
      </template>
      <template v-if="tooltipPlacement === 'append' && tooltip" #append>
        <QIcon name="info" size="xs" color="grey-6" class="cursor-help">
          <QTooltip><span v-html="tooltip"></span></QTooltip>
        </QIcon>
      </template>
    </QInput>
  </div>
</template>
