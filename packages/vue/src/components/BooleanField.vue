<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import type { FieldProps } from '../types/index.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { value, errorMessage, label, hint, hintMode, tooltip } = useFormField(props.path, props.schema, { label: props.label });
const fieldId = generateFieldId(props.path);
const isFocused = ref(false);
const isHovered = ref(false);

const showHint = computed(() => {
  if (!hint.value || errorMessage.value) return false;
  if (hintMode.value === 'always') return true;
  if (hintMode.value === 'focus') return isFocused.value;
  if (hintMode.value === 'hover') return isHovered.value;
  return true;
});
</script>

<template>
  <div class="quickform-field quickform-boolean-field">
    <label 
      :for="fieldId" 
      class="quickform-checkbox-label"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <input
        :id="fieldId"
        v-model="value"
        type="checkbox"
        class="quickform-checkbox"
        :disabled="disabled"
        :readonly="readonly"
        :aria-describedby="hint ? `${fieldId}-hint` : undefined"
        :aria-invalid="!!errorMessage"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <span class="quickform-checkbox-text">
        {{ label }}
        <span v-if="props.schema.required" class="quickform-required">*</span>
        <span v-if="tooltip" class="quickform-tooltip-wrapper">
          <svg class="quickform-tooltip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
          </svg>
          <span class="quickform-tooltip-content" v-html="tooltip"></span>
        </span>
      </span>
    </label>

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
  margin-bottom: var(--quickform-field-margin-bottom, 1rem);
}

.quickform-checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
}

.quickform-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  margin-top: 0.125rem;
  cursor: pointer;
  flex-shrink: 0;
}

.quickform-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.quickform-checkbox-text {
  font-weight: 500;
}

.quickform-required {
  color: #dc2626;
  margin-left: 0.125rem;
}

.quickform-tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 0.25rem;
  vertical-align: middle;
}

.quickform-tooltip-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
  cursor: help;
  flex-shrink: 0;
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.quickform-tooltip-wrapper:hover .quickform-tooltip-icon {
  color: #3b82f6;
}

.quickform-tooltip-content {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 400;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  max-width: 300px;
  width: max-content;
  z-index: 1000;
  line-height: 1.4;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.quickform-tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1f2937;
}

.quickform-tooltip-wrapper:hover .quickform-tooltip-content {
  display: block;
}

.quickform-hint {
  margin-top: 0.25rem;
  margin-left: 1.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.quickform-error {
  margin-top: 0.25rem;
  margin-left: 1.75rem;
  font-size: 0.875rem;
  color: #dc2626;
}
</style>
