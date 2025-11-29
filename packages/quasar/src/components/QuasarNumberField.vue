<script setup lang="ts">
import { computed } from "vue";
import { QInput } from "quasar";
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
  { label: props.label }
);

const formContext = useQuasarFormContext();
const fieldId = generateFieldId(props.path);

const quasarProps = computed(() => {
  return mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults,
    "input"
  );
});

const step = computed(() => {
  if (props.schema.multipleOf) return props.schema.multipleOf;
  return props.schema.type === "integer" ? 1 : undefined;
});

const fieldGap = computed(() =>
  getFieldGapStyle(formContext?.componentDefaults)
);
</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <QInput
      :id="fieldId"
      v-model.number="value"
      :label="label"
      :hint="hint"
      type="number"
      :error="!!errorMessage"
      :error-message="errorMessage || undefined"
      :disable="disabled"
      :readonly="readonly"
      :required="schema.required"
      :step="step"
      v-bind="quasarProps"
    >
      <template v-if="schema.required" #label>
        {{ label }} <span style="color: red">*</span>
      </template>
    </QInput>
  </div>
</template>
