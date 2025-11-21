<script setup lang="ts">
import { computed } from "vue";
import { QCheckbox } from "quasar";
import { useFormField, useFormContext } from "@quickflo/quickforms-vue";
import { generateFieldId } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { mergeQuasarProps } from "../utils";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, errorMessage, label } = useFormField(props.path, props.schema, {
  label: props.label,
});

// Default to false if undefined (prevents indeterminate state)
if (value.value === undefined || value.value === null) {
  value.value = false;
}

const formContext = useFormContext();
const fieldId = generateFieldId(props.path);

const quasarProps = computed(() => {
  return mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults as any,
    "checkbox"
  );
});
</script>
<template>
  <div>
    <QCheckbox
      :id="fieldId"
      v-model="value"
      :label="label"
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
      v-if="errorMessage"
      style="color: red; font-size: 0.875rem; margin-top: 0.25rem"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
