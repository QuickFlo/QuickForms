<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import type { FieldProps } from '../types/index.js';
import { useFormContext } from '../composables/useFormContext.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const formContext = useFormContext();
const validationMode = formContext?.validationMode || 'ValidateAndShow';

const { value, errorMessage, label, hint, hintMode } = useFormField(props.path, props.schema, { label: props.label });
const fieldId = generateFieldId(props.path);
const isFocused = ref(false);
const isHovered = ref(false);

const inputType = computed(() => {
  return props.schema.type === 'integer' ? 'number' : 'number';
});

const step = computed(() => {
  if (props.schema.multipleOf) return props.schema.multipleOf;
  return props.schema.type === 'integer' ? 1 : 'any';
});

const showHint = computed(() => {
  if (!hint.value || errorMessage.value) return false;
  if (hintMode.value === 'always') return true;
  if (hintMode.value === 'focus') return isFocused.value;
  if (hintMode.value === 'hover') return isHovered.value;
  return true;
});
</script>

<template>
  <div class="quickform-field quickform-number-field">
    <label :for="fieldId" class="quickform-label">
      {{ label }}
      <span v-if="props.schema.required" class="quickform-required">*</span>
    </label>

    <input
      :id="fieldId"
      v-model.number="value"
      :type="inputType"
      class="quickform-input"
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="hint"
      :min="validationMode !== 'NoValidation' ? (schema.minimum ?? schema.exclusiveMinimum) : undefined"
      :max="validationMode !== 'NoValidation' ? (schema.maximum ?? schema.exclusiveMaximum) : undefined"
      :step="validationMode !== 'NoValidation' ? step : undefined"
      :aria-describedby="hint ? `${fieldId}-hint` : undefined"
      :aria-invalid="!!errorMessage"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    />

    <div v-if="showHint" :id="`${fieldId}-hint`" class="quickform-hint">
      <span v-html="hint"></span>
    </div>

    <div v-if="errorMessage" class="quickform-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
@import "../styles/variables.css";

.quickform-field {
  margin-bottom: var(--quickform-field-margin-bottom);
}

.quickform-label {
  display: block;
  margin-bottom: var(--quickform-label-margin-bottom);
  font-weight: var(--quickform-label-font-weight);
  font-size: var(--quickform-label-font-size);
  color: var(--quickform-label-color);
}

.quickform-required {
  color: var(--quickform-required-color);
  margin-left: var(--quickform-required-margin-left);
}

.quickform-input {
  width: 100%;
  padding: var(--quickform-input-padding-y) var(--quickform-input-padding-x);
  border: var(--quickform-input-border-width) var(--quickform-input-border-style) var(--quickform-color-border);
  border-radius: var(--quickform-radius-md);
  font-size: var(--quickform-input-font-size);
  background-color: var(--quickform-color-bg);
  color: var(--quickform-color-text);
}

.quickform-input:focus {
  outline: none;
  border-color: var(--quickform-color-border-focus);
  box-shadow: var(--quickform-shadow-focus);
}

.quickform-input[aria-invalid="true"] {
  border-color: var(--quickform-color-error);
  background-color: var(--quickform-color-error-bg);
}

.quickform-hint {
  margin-top: var(--quickform-hint-margin-top);
  font-size: var(--quickform-hint-font-size);
  color: var(--quickform-hint-color);
}

.quickform-error {
  margin-top: var(--quickform-error-margin-top);
  font-size: var(--quickform-error-font-size);
  color: var(--quickform-error-color);
}

.quickform-input:disabled {
  background-color: var(--quickform-color-bg-disabled);
  color: var(--quickform-color-text-disabled);
  cursor: not-allowed;
}
</style>
