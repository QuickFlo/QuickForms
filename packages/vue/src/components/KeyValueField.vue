<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import type { FieldProps } from '../types/index.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { value, setValue, label, hint, errorMessage, required } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const fieldId = generateFieldId(props.path);

// Convert object to array of key-value pairs for editing
interface KeyValuePair {
  key: string;
  value: string;
  id: number;
}

let nextId = 0;
const pairs = ref<KeyValuePair[]>([]);
const isInternalUpdate = ref(false);

// Initialize from value
watch(
  () => value.value,
  (newValue) => {
    if (isInternalUpdate.value) {
      isInternalUpdate.value = false;
      return;
    }
    
    if (newValue && typeof newValue === 'object' && !Array.isArray(newValue)) {
      pairs.value = Object.entries(newValue).map(([key, val]) => ({
        key,
        value: String(val),
        id: nextId++
      }));
    } else if (!pairs.value.length) {
      pairs.value = [];
    }
  },
  { immediate: true }
);

// Update value when pairs change
watch(
  pairs,
  (newPairs) => {
    const obj: Record<string, string> = {};
    newPairs.forEach(pair => {
      if (pair.key.trim()) {
        obj[pair.key] = pair.value;
      }
    });
    isInternalUpdate.value = true;
    setValue(obj);
  },
  { deep: true }
);

function addPair() {
  pairs.value.push({ key: '', value: '', id: nextId++ });
}

function removePair(id: number) {
  pairs.value = pairs.value.filter(p => p.id !== id);
}
</script>

<template>
  <div class="quickform-field quickform-keyvalue-field">
    <label v-if="label" :for="fieldId" class="quickform-label">
      {{ label }}
      <span v-if="required" class="quickform-required">*</span>
    </label>

    <div v-if="hint" :id="`${fieldId}-hint`" class="quickform-hint">
      <span v-html="hint"></span>
    </div>

    <div class="quickform-keyvalue-container">
      <div v-if="pairs.length" class="quickform-keyvalue-header">
        <span class="quickform-keyvalue-header-cell">Key</span>
        <span class="quickform-keyvalue-header-cell">Value</span>
        <span class="quickform-keyvalue-header-cell"></span>
      </div>

      <div
        v-for="pair in pairs"
        :key="pair.id"
        class="quickform-keyvalue-row"
      >
        <input
          v-model="pair.key"
          type="text"
          placeholder="key"
          class="quickform-input quickform-keyvalue-key"
          :disabled="disabled"
          :readonly="readonly"
        />
        <input
          v-model="pair.value"
          type="text"
          placeholder="value"
          class="quickform-input quickform-keyvalue-value"
          :disabled="disabled"
          :readonly="readonly"
        />
        <button
          type="button"
          class="quickform-button quickform-keyvalue-remove"
          :disabled="disabled || readonly"
          @click="removePair(pair.id)"
        >
          ×
        </button>
      </div>

      <button
        type="button"
        class="quickform-button quickform-keyvalue-add"
        :disabled="disabled || readonly"
        @click="addPair"
      >
        + Add Parameter
      </button>
    </div>

    <div v-if="errorMessage" class="quickform-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.quickform-field {
  margin-bottom: var(--quickform-spacing-md, 1rem);
}

.quickform-label {
  display: block;
  font-weight: var(--quickform-label-font-weight, 500);
  font-size: var(--quickform-label-font-size, 0.875rem);
  color: var(--quickform-label-color, #374151);
  margin-bottom: var(--quickform-spacing-xs, 0.5rem);
}

.quickform-required {
  color: var(--quickform-required-color, #ef4444);
  margin-left: var(--quickform-required-margin-left, 0.25rem);
}

.quickform-hint {
  font-size: var(--quickform-hint-font-size, 0.875rem);
  color: var(--quickform-hint-color, #6b7280);
  margin-bottom: var(--quickform-spacing-xs, 0.5rem);
}

.quickform-keyvalue-container {
  border: 1px solid var(--quickform-color-border, #d1d5db);
  border-radius: var(--quickform-radius-md, 0.375rem);
  padding: var(--quickform-spacing-md, 1rem);
  background-color: var(--quickform-input-bg, #ffffff);
}

.quickform-keyvalue-header {
  display: grid;
  grid-template-columns: 1fr 1fr 40px;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.813rem;
  color: var(--quickform-label-color, #374151);
}

.quickform-keyvalue-row {
  display: grid;
  grid-template-columns: 1fr 1fr 40px;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.quickform-input {
  padding: var(--quickform-input-padding, 0.5rem 0.75rem);
  border: 1px solid var(--quickform-color-border, #d1d5db);
  border-radius: var(--quickform-radius-sm, 0.25rem);
  font-size: var(--quickform-input-font-size, 0.875rem);
  color: var(--quickform-input-color, #1f2937);
  background-color: var(--quickform-input-bg, #ffffff);
  transition: border-color 0.2s;
}

.quickform-input:focus {
  outline: none;
  border-color: var(--quickform-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px var(--quickform-color-primary-alpha, rgba(59, 130, 246, 0.1));
}

.quickform-input:disabled {
  background-color: var(--quickform-input-disabled-bg, #f3f4f6);
  cursor: not-allowed;
}

.quickform-button {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--quickform-color-border, #d1d5db);
  border-radius: var(--quickform-radius-sm, 0.25rem);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--quickform-input-bg, #ffffff);
}

.quickform-keyvalue-remove {
  color: var(--quickform-error-color, #ef4444);
  font-size: 1.5rem;
  font-weight: 400;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quickform-keyvalue-remove:hover:not(:disabled) {
  background-color: var(--quickform-error-color, #ef4444);
  color: white;
  border-color: var(--quickform-error-color, #ef4444);
}

.quickform-keyvalue-add {
  color: var(--quickform-color-primary, #3b82f6);
  border-color: var(--quickform-color-primary, #3b82f6);
  width: 100%;
  margin-top: 0.5rem;
}

.quickform-keyvalue-add:hover:not(:disabled) {
  background-color: var(--quickform-color-primary, #3b82f6);
  color: white;
}

.quickform-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quickform-error {
  margin-top: var(--quickform-spacing-xs, 0.5rem);
  font-size: var(--quickform-error-font-size, 0.875rem);
  color: var(--quickform-error-color, #ef4444);
}
</style>
