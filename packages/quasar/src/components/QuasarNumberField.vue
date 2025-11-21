<script setup lang="ts">
import { computed } from "vue";
import { QInput } from "quasar";
import { useFormField, useFormContext } from "@quickflo/quickforms-vue";
import { generateFieldId } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { mergeQuasarProps } from "../utils";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, errorMessage, label, hint } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const formContext = useFormContext();
const fieldId = generateFieldId(props.path);

const quasarProps = computed(() => {
  return mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults as any,
    "input"
  );
});

const step = computed(() => {
  if (props.schema.multipleOf) return props.schema.multipleOf;
  return props.schema.type === "integer" ? 1 : undefined;
});

const rules = computed(() => {
  const rulesList: any[] = [];
  if (props.schema.required) {
    rulesList.push(
      (val: number) =>
        (val !== null && val !== undefined) || "This field is required"
    );
  }
  if (props.schema.minimum !== undefined) {
    rulesList.push(
      (val: number) =>
        val === null ||
        val === undefined ||
        val >= (props.schema.minimum || -Infinity) ||
        `Minimum value is ${props.schema.minimum}`
    );
  }
  if (props.schema.maximum !== undefined) {
    rulesList.push(
      (val: number) =>
        val === null ||
        val === undefined ||
        val <= (props.schema.maximum || Infinity) ||
        `Maximum value is ${props.schema.maximum}`
    );
  }
  if (props.schema.exclusiveMinimum !== undefined) {
    rulesList.push(
      (val: number) =>
        val === null ||
        val === undefined ||
        val > (props.schema.exclusiveMinimum || -Infinity) ||
        `Must be greater than ${props.schema.exclusiveMinimum}`
    );
  }
  if (props.schema.exclusiveMaximum !== undefined) {
    rulesList.push(
      (val: number) =>
        val === null ||
        val === undefined ||
        val < (props.schema.exclusiveMaximum || Infinity) ||
        `Must be less than ${props.schema.exclusiveMaximum}`
    );
  }
  if (props.schema.multipleOf) {
    rulesList.push(
      (val: number) =>
        val === null ||
        val === undefined ||
        val % (props.schema.multipleOf || 1) === 0 ||
        `Must be a multiple of ${props.schema.multipleOf}`
    );
  }
  return rulesList;
});
</script>

<template>
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
    :rules="rules"
    :required="schema.required"
    :step="step"
    v-bind="quasarProps"
  >
    <template v-if="schema.required" #label>
      {{ label }} <span style="color: red">*</span>
    </template>
  </QInput>
</template>
