<script setup lang="ts">
import { computed } from "vue";
import { QCheckbox } from "quasar";
import { useFormField } from "@quickflo/quickforms-vue";
import { generateFieldId } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { mergeQuasarProps, getFieldGapStyle } from "../utils";
import { useQuasarFormContext } from "../composables/useQuasarFormContext";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, errorMessage, label, hint } = useFormField(
  props.path,
  props.schema,
  {
    label: props.label,
  }
);

// Default to false if undefined (prevents indeterminate state)
if (value.value === undefined || value.value === null) {
  value.value = false;
}

const formContext = useQuasarFormContext();
const fieldId = generateFieldId(props.path);

const quasarProps = computed(() => {
  return mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults,
    "checkbox"
  );
});

const fieldGap = computed(() =>
  getFieldGapStyle(formContext?.componentDefaults)
);
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
