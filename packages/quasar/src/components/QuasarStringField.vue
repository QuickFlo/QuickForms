<script setup lang="ts">
import { computed } from 'vue';
import { QInput } from 'quasar';
import { useFormField, useFormContext } from '@quickflo/quickforms-vue';
import { generateFieldId } from '@quickflo/quickforms-vue';
import type { FieldProps } from '@quickflo/quickforms-vue';
import { mergeQuasarProps } from '../utils';

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

// Merge global defaults, component defaults, and schema-level props
const quasarProps = computed(() => {
  return mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults as any,
    'input'
  );
});

const inputType = computed(() => {
  if (props.schema.format === 'email') return 'email';
  if (props.schema.format === 'url' || props.schema.format === 'uri') return 'url';
  if (props.schema.format === 'password') return 'password';
  if (props.schema.format === 'textarea') return 'textarea';
  return 'text';
});

const isTextarea = computed(() => {
  return (
    props.schema.format === 'textarea' ||
    (props.schema.maxLength && props.schema.maxLength > 200)
  );
});

const rules = computed(() => {
  const rulesList: any[] = [];
  if (props.schema.required) {
    rulesList.push((val: string) => (val && val.length > 0) || 'This field is required');
  }
  if (props.schema.minLength) {
    rulesList.push(
      (val: string) => 
        !val || val.length >= (props.schema.minLength || 0) || 
        `Minimum length is ${props.schema.minLength}`
    );
  }
  if (props.schema.maxLength) {
    rulesList.push(
      (val: string) => 
        !val || val.length <= (props.schema.maxLength || Infinity) || 
        `Maximum length is ${props.schema.maxLength}`
    );
  }
  if (props.schema.pattern) {
    const regex = new RegExp(props.schema.pattern);
    rulesList.push(
      (val: string) => !val || regex.test(val) || 'Invalid format'
    );
  }
  return rulesList;
});
</script>

<template>
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
    :rules="rules"
    :required="schema.required"
    v-bind="quasarProps"
  >
    <template v-if="schema.required" #label>
      {{ label }} <span style="color: red">*</span>
    </template>
  </QInput>
</template>
