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
.quickform-field {
  margin-bottom: 1rem;
}

.quickform-label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.quickform-required {
  color: #dc2626;
  margin-left: 0.125rem;
}

.quickform-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.quickform-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quickform-input[aria-invalid="true"] {
  border-color: #dc2626;
}

.quickform-hint {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.quickform-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.quickform-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
