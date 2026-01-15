<script setup lang="ts">
import { QCheckbox } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const {
  value,
  label,
  errorMessage,
  fieldId,
  quasarProps,
  fieldGap,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'checkbox',
});

// Default to schema default if defined, otherwise false (prevents indeterminate state)
if (value.value === undefined || value.value === null) {
  value.value = props.schema.default ?? false;
}
</script>
<template>
  <div :style="{ marginBottom: fieldGap }">
    <QCheckbox
      :id="fieldId"
      v-model="value"
      :disable="disabled"
      :readonly="readonly"
      :toggle-indeterminate="false"
      v-bind="quasarProps"
    >
      <template #default>
        {{ label }}
        <span v-if="schema.required" style="color: red; margin-left: 0.125rem"
          >*</span
        >
      </template>
    </QCheckbox>
    <div
      v-if="schema.description"
      style="
        font-size: 0.875rem;
        color: #666;
        margin-left: 2rem;
        margin-top: 0.25rem;
      "
    >
      {{ schema.description }}
    </div>
    <div
      v-if="errorMessage"
      style="color: red; font-size: 0.875rem; margin-top: 0.25rem"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
