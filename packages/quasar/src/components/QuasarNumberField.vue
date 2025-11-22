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
    :required="schema.required"
    :step="step"
    v-bind="quasarProps"
  >
    <template v-if="schema.required" #label>
      {{ label }} <span style="color: red">*</span>
    </template>
  </QInput>
</template>
