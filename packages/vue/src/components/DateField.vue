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

const inputType = computed(() => {
  if (props.schema.format === 'time') return 'time';
  if (props.schema.format === 'date-time') return 'datetime-local';
  return 'date';
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
  <div class="quickform-field quickform-date-field">
    <label :for="fieldId" class="quickform-label">
      {{ label }}
      <span v-if="props.schema.required" class="quickform-required">*</span>
      <span v-if="tooltip" class="quickform-tooltip-wrapper">
        <svg class="quickform-tooltip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
        </svg>
        <span class="quickform-tooltip-content" v-html="tooltip"></span>
      </span>
    </label>

    <input
      :id="fieldId"
      v-model="value"
      :type="inputType"
      class="quickform-input"
      :disabled="disabled"
      :readonly="readonly"
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

.quickform-tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: var(--quickform-spacing-sm);
  vertical-align: middle;
}

.quickform-tooltip-icon {
  width: var(--quickform-tooltip-icon-size);
  height: var(--quickform-tooltip-icon-size);
  color: var(--quickform-tooltip-icon-color);
  cursor: help;
  flex-shrink: 0;
  transition: color var(--quickform-transition-fast) var(--quickform-transition-timing);
}

.quickform-tooltip-wrapper:hover .quickform-tooltip-icon {
  color: var(--quickform-tooltip-icon-hover-color);
}

.quickform-tooltip-content {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--quickform-tooltip-bg);
  color: var(--quickform-tooltip-color);
  font-size: var(--quickform-tooltip-font-size);
  font-weight: var(--quickform-font-weight-normal);
  padding: var(--quickform-tooltip-padding);
  border-radius: var(--quickform-tooltip-radius);
  max-width: var(--quickform-tooltip-max-width);
  width: max-content;
  z-index: 1000;
  line-height: 1.4;
  box-shadow: var(--quickform-shadow-md);
  pointer-events: none;
}

.quickform-tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--quickform-tooltip-bg);
}

.quickform-tooltip-wrapper:hover .quickform-tooltip-content {
  display: block;
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
