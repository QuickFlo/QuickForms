<script setup lang="ts">
import { computed, ref, watch, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { linter, lintGutter } from '@codemirror/lint';
import { keymap, lineNumbers, EditorView as CMEditorView } from '@codemirror/view';
import { useFormField } from '../composables/useFormField.js';
import { useFormContext } from '../composables/useFormContext.js';
import { generateFieldId } from '../composables/utils.js';
import type { FieldProps } from '../types/index.js';
import type { ViewUpdate, EditorView } from '@codemirror/view';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { value, setValue, label, hint, errorMessage, required } = useFormField(
  props.path, 
  props.schema,
  { label: props.label }
);

const formContext = useFormContext();
const fieldId = generateFieldId(props.path);

// CodeMirror text content
const code = ref('');
const parseError = ref<string | null>(null);
const isInitializing = ref(true);

// Initialize code from value
watch(
  () => value.value,
  (newValue) => {
    // Only update code if we're initializing or if value changed externally
    if (isInitializing.value) {
      try {
        code.value = JSON.stringify(newValue || {}, null, 2);
        parseError.value = null;
      } catch (err) {
        code.value = '{}';
      }
      isInitializing.value = false;
    }
  },
  { immediate: true }
);

// Get editor height from schema or default
const editorHeight = computed(() => {
  const xHeight = (props.schema as any)['x-json-height'];
  return xHeight || '300px';
});

// Dark theme support
const useDarkTheme = computed(() => {
  const xDarkTheme = (props.schema as any)['x-json-dark-theme'];
  return xDarkTheme === true;
});

// Format JSON command
function formatJSON(view: EditorView) {
  const text = view.state.doc.toString();
  const cursorPos = view.state.selection.main.head;
  
  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);
    
    // Calculate relative cursor position as a ratio
    const relativePos = text.length > 0 ? cursorPos / text.length : 0;
    const newCursorPos = Math.min(
      Math.round(relativePos * formatted.length),
      formatted.length
    );
    
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted },
      selection: { anchor: newCursorPos }
    });
    parseError.value = null;
    return true;
  } catch (err: any) {
    // Can't format invalid JSON
    return false;
  }
}

// Get CodeMirror configuration options
const showLineNumbers = computed(() => {
  const xLineNumbers = (props.schema as any)['x-json-line-numbers'];
  return xLineNumbers ?? true;
});

const showLintGutter = computed(() => {
  const xLintGutter = (props.schema as any)['x-json-lint-gutter'];
  return xLintGutter ?? true;
});

const tabSize = computed(() => {
  const xTabSize = (props.schema as any)['x-json-tab-size'];
  return xTabSize ?? 2;
});

const indentWithTab = computed(() => {
  const xIndentWithTab = (props.schema as any)['x-json-indent-with-tab'];
  return xIndentWithTab ?? true;
});

const formatKey = computed(() => {
  const xFormatKey = (props.schema as any)['x-json-format-key'];
  if (xFormatKey !== undefined) return xFormatKey;
  return formContext?.componentDefaults?.jsonEditor?.formatKey ?? 'Ctrl-.';
});

// CodeMirror extensions
const extensions = computed(() => {
  const exts = [
    json(),
    // Add keyboard shortcut for formatting
    keymap.of([{
      key: formatKey.value,
      run: formatJSON
    }])
  ];
  
  // Add line numbers if enabled, or explicitly hide gutters if disabled
  if (showLineNumbers.value) {
    exts.push(lineNumbers());
  } else {
    // Explicitly hide ALL gutters including basicSetup's default line numbers
    exts.push(CMEditorView.theme({
      ".cm-gutters": {
        display: "none !important"
      }
    }));
  }
  
  // Add linting if enabled
  if (showLintGutter.value) {
    exts.push(linter(jsonParseLinter()));
    exts.push(lintGutter());
  }
  
  // Add dark theme if enabled
  if (useDarkTheme.value) {
    exts.push(oneDark);
  }
  
  return exts;
});

const displayError = computed(() => parseError.value || errorMessage.value);

// Create a key that changes when extensions configuration changes
// This forces CodeMirror to remount with new extensions
const editorKey = computed(() => 
  `${showLineNumbers.value}-${showLintGutter.value}-${useDarkTheme.value}-${formatKey.value}`
);

// Handle changes from CodeMirror
function handleChange(newCode: string, update: ViewUpdate) {
  // Don't update if this is just an initialization
  if (isInitializing.value) {
    return;
  }
  
  try {
    const parsed = JSON.parse(newCode);
    setValue(parsed);
    parseError.value = null;
  } catch (err: any) {
    // Only update parse error, don't setValue for invalid JSON
    parseError.value = err.message;
  }
}

</script>

<template>
  <div class="quickform-field quickform-json-field">
    <div v-if="label" class="quickform-label-wrapper">
      <label 
        :for="fieldId" 
        class="quickform-label"
      >
        {{ label }}
        <span v-if="required" class="quickform-required">*</span>
      </label>
    </div>

    <div v-if="hint" :id="`${fieldId}-hint`" class="quickform-hint">
      <span v-html="hint"></span>
    </div>
    
    <div class="quickform-json-format-hint">
      Press <kbd>{{ formatKey }}</kbd> to format
    </div>

    <div class="quickform-json-editor-wrapper">
      <Codemirror
        :key="editorKey"
        :id="fieldId"
        v-model="code"
        :style="{ height: editorHeight }"
        :extensions="extensions"
        :disabled="disabled || readonly"
        :indent-with-tab="indentWithTab"
        :tab-size="tabSize"
        placeholder="{}"
        :aria-describedby="hint ? `${fieldId}-hint` : undefined"
        :aria-invalid="!!displayError"
        @change="handleChange"
      />
    </div>

    <div v-if="displayError" class="quickform-error">
      {{ displayError }}
    </div>
  </div>
</template>

<style scoped>
.quickform-field {
  margin-bottom: var(--quickform-spacing-md, 1rem);
}

.quickform-label-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: var(--quickform-spacing-xs, 0.5rem);
}

.quickform-label {
  font-weight: var(--quickform-label-font-weight, 500);
  font-size: var(--quickform-label-font-size, 0.875rem);
  color: var(--quickform-label-color, #374151);
}

.quickform-required {
  color: var(--quickform-required-color, #ef4444);
  margin-left: var(--quickform-required-margin-left, 0.25rem);
}

.quickform-hint {
  font-size: var(--quickform-hint-font-size, 0.875rem);
  color: var(--quickform-hint-color, #6b7280);
  margin-bottom: var(--quickform-spacing-xs, 0.25rem);
}

.quickform-json-format-hint {
  font-size: 0.75rem;
  color: var(--quickform-hint-color, #9ca3af);
  margin-bottom: var(--quickform-spacing-xs, 0.5rem);
  font-style: italic;
}

.quickform-json-format-hint kbd {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  padding: 0.125rem 0.375rem;
  font-family: monospace;
  font-size: 0.75rem;
  font-style: normal;
}

.quickform-json-editor-wrapper {
  border-radius: var(--quickform-radius-md, 0.375rem);
  overflow: hidden;
  border: 1px solid var(--quickform-color-border, #d1d5db);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 0.875rem;
}

.quickform-json-editor-wrapper:focus-within {
  border-color: var(--quickform-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px var(--quickform-color-primary-alpha, rgba(59, 130, 246, 0.1));
}

.quickform-error {
  margin-top: var(--quickform-spacing-xs, 0.5rem);
  font-size: var(--quickform-error-font-size, 0.875rem);
  color: var(--quickform-error-color, #ef4444);
}

/* CodeMirror customization */
.quickform-json-editor-wrapper :deep(.cm-editor) {
  background-color: var(--quickform-input-bg, #ffffff);
}

.quickform-json-editor-wrapper :deep(.cm-gutters) {
  background-color: var(--quickform-input-bg, #f9fafb);
  border-right: 1px solid var(--quickform-color-border, #e5e7eb);
}

.quickform-json-editor-wrapper :deep(.cm-activeLineGutter) {
  background-color: var(--quickform-color-primary-alpha, rgba(59, 130, 246, 0.05));
}

.quickform-json-editor-wrapper :deep(.cm-scroller) {
  overflow: auto;
}
</style>
