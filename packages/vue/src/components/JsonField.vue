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

// Local text state for JSON editing
const jsonText = ref('');
const parseError = ref<string | null>(null);
const isInitialized = ref(false);

// Initialize jsonText from value (only once)
watch(
  () => value.value,
  (newValue) => {
    // Only auto-format on initial load, not during user editing
    if (!isInitialized.value) {
      try {
        jsonText.value = JSON.stringify(newValue || {}, null, 2);
        parseError.value = null;
      } catch (err) {
        jsonText.value = '{}';
      }
      isInitialized.value = true;
    }
  },
  { immediate: true }
);

// Parse and update value on text change
function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  jsonText.value = target.value;
  
  try {
    const parsed = JSON.parse(jsonText.value);
    setValue(parsed);
    parseError.value = null;
  } catch (err: any) {
    parseError.value = err.message;
  }
}

// Format JSON with Cmd+Shift+F (Mac) or Ctrl+Shift+F (others)
function formatJson() {
  try {
    const parsed = JSON.parse(jsonText.value);
    jsonText.value = JSON.stringify(parsed, null, 2);
    parseError.value = null;
  } catch (err: any) {
    // Don't format if invalid JSON
  }
}

// Handle keyboard events for better editor UX
function handleKeyDown(event: KeyboardEvent) {
  const target = event.target as HTMLTextAreaElement;
  
  // Format JSON: Ctrl + Space
  if (event.ctrlKey && (event.key === ' ' || event.code === 'Space')) {
    event.preventDefault();
    event.stopPropagation();
    formatJson();
    return;
  }
  
  // Tab key - insert 2 spaces
  if (event.key === 'Tab') {
    event.preventDefault();
    event.stopPropagation();
    
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const spaces = '  '; // 2 spaces
    
    // Insert spaces at cursor position
    jsonText.value = jsonText.value.substring(0, start) + spaces + jsonText.value.substring(end);
    
    // Move cursor after inserted spaces
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = start + spaces.length;
    }, 0);
    return;
  }
  
  // Enter, Space - stop propagation to prevent form submission
  if (event.key === 'Enter' || event.key === ' ') {
    event.stopPropagation();
  }
}

const displayError = computed(() => parseError.value || errorMessage.value);

// Get rows from schema or default
const rows = computed(() => {
  const xRows = (props.schema as any)['x-rows'];
  return xRows !== undefined ? xRows : 8;
});

// Enhanced hint with format shortcut info
const enhancedHint = computed(() => {
  const formatHint = 'Press Ctrl+Space to format';
  return hint.value ? `${hint.value} • ${formatHint}` : formatHint;
});
</script>

<template>
  <div class="quickform-field quickform-json-field">
    <label 
      v-if="label" 
      :for="fieldId" 
      class="quickform-label"
    >
      {{ label }}
      <span v-if="required" class="quickform-required">*</span>
    </label>

    <div :id="`${fieldId}-hint`" class="quickform-hint">
      <span v-html="enhancedHint"></span>
    </div>

    <textarea
      :id="fieldId"
      v-model="jsonText"
      class="quickform-textarea quickform-json-editor"
      :class="{ 'quickform-error-border': displayError }"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :aria-describedby="hint ? `${fieldId}-hint` : undefined"
      :aria-invalid="!!displayError"
      placeholder="{}"
      spellcheck="false"
      @input="handleInput"
      @keydown="handleKeyDown"
    />

    <div v-if="displayError" class="quickform-error">
      {{ displayError }}
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

.quickform-textarea {
  width: 100%;
  padding: var(--quickform-input-padding, 0.5rem 0.75rem);
  border: 1px solid var(--quickform-color-border, #d1d5db);
  border-radius: var(--quickform-radius-md, 0.375rem);
  font-size: var(--quickform-input-font-size, 0.875rem);
  color: var(--quickform-input-color, #1f2937);
  background-color: var(--quickform-input-bg, #ffffff);
  transition: border-color 0.2s;
  resize: vertical;
}

.quickform-json-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 0.813rem;
  line-height: 1.5;
}

.quickform-textarea:focus {
  outline: none;
  border-color: var(--quickform-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px var(--quickform-color-primary-alpha, rgba(59, 130, 246, 0.1));
}

.quickform-textarea:disabled {
  background-color: var(--quickform-input-disabled-bg, #f3f4f6);
  cursor: not-allowed;
}

.quickform-textarea:read-only {
  background-color: var(--quickform-input-readonly-bg, #f9fafb);
}

.quickform-error-border {
  border-color: var(--quickform-color-error, #ef4444);
}

.quickform-error {
  margin-top: var(--quickform-spacing-xs, 0.5rem);
  font-size: var(--quickform-error-font-size, 0.875rem);
  color: var(--quickform-error-color, #ef4444);
}
</style>
