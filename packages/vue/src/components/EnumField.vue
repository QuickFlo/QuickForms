<script setup lang="ts">
import { computed } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import type { FieldProps } from '../types/index.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { value, errorMessage, label, hint } = useFormField(props.path, props.schema, { label: props.label });
const fieldId = generateFieldId(props.path);

const options = computed(() => {
  if (!props.schema.enum) return [];
  
  return props.schema.enum.map(enumValue => ({
    value: enumValue,
    label: String(enumValue)
  }));
});
</script>

<template>
  <div class="quickform-field quickform-enum-field">
    <label :for="fieldId" class="quickform-label">
      {{ label }}
      <span v-if="props.schema.required" class="quickform-required">*</span>
    </label>

    <select
      :id="fieldId"
      v-model="value"
      class="quickform-select"
      :disabled="disabled"
      :aria-describedby="hint ? `${fieldId}-hint` : undefined"
      :aria-invalid="!!errorMessage"
    >
      <option value="">Select an option...</option>
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <div v-if="hint && !errorMessage" :id="`${fieldId}-hint`" class="quickform-hint">
      {{ hint }}
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

.quickform-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.quickform-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quickform-select[aria-invalid="true"] {
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

.quickform-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
