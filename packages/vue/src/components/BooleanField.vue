<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import type { FieldProps } from '../types/index.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { value, errorMessage, label, hint, hintMode } = useFormField(props.path, props.schema, { label: props.label });
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
