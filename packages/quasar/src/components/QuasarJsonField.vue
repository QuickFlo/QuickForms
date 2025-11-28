<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Codemirror } from 'vue-codemirror';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { linter, lintGutter } from '@codemirror/lint';
import { keymap } from '@codemirror/view';
import {
  useFormField,
  generateFieldId,
  useFormContext,
} from "@quickflo/quickforms-vue";
import { getFieldGapStyle } from "../utils";
import type { FieldProps } from "@quickflo/quickforms-vue";
import type { QuasarFormOptions } from "../types";
import type { ViewUpdate, EditorView } from '@codemirror/view';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, setValue, label, hint, errorMessage, required } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const formContext = useFormContext<QuasarFormOptions>();

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

// Get editor height from schema, componentDefaults, or default
const editorHeight = computed(() => {
  // 1. Check schema x-json-height
  const xHeight = (props.schema as any)['x-json-height'];
  if (xHeight) {
    return xHeight;
  }
  
  // 2. Check quickformsDefaults
  const quickformsHeight = formContext?.quickformsDefaults?.jsoneditor?.height;
  if (quickformsHeight) {
    return quickformsHeight;
  }
  
  return '300px';
});

// Dark theme support - auto-detect from Quasar or override with schema/defaults
const useDarkTheme = computed(() => {
  // 1. Check schema x-json-dark-theme
  const xDarkTheme = (props.schema as any)['x-json-dark-theme'];
  if (xDarkTheme !== undefined) {
    return xDarkTheme === true;
  }
  
  // 2. Check quickformsDefaults
  const quickformsDarkTheme = formContext?.quickformsDefaults?.jsoneditor?.darkTheme;
  if (quickformsDarkTheme !== undefined) {
    return quickformsDarkTheme === true;
  }
  
  // 4. Auto-detect from Quasar's dark mode (if Dark plugin is installed)
  if (typeof window !== 'undefined' && (window as any).$q?.dark) {
    return (window as any).$q.dark.isActive;
  }
  
  return false;
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

// CodeMirror extensions
const extensions = computed(() => {
  const exts = [
    json(),
    linter(jsonParseLinter()),
    lintGutter(),
    // Add keyboard shortcut for formatting: Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows/Linux)
    keymap.of([{
      key: 'Mod-Shift-f',
      run: formatJSON
    }])
  ];
  
  if (useDarkTheme.value) {
    exts.push(oneDark);
  }
  
  return exts;
});

const displayError = computed(() => parseError.value || errorMessage.value);

const fieldGap = computed(() => getFieldGapStyle(formContext?.componentDefaults));

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
  <div class="quickform-json-field-wrapper" :style="{ marginBottom: fieldGap }">
    <div v-if="label" class="quickform-label-header">
      <span class="quickform-label-text">
        {{ label }}
        <span v-if="required" style="color: red; margin-left: 0.25rem">*</span>
      </span>
    </div>

    <div v-if="hint" class="quickform-hint">
      <span v-html="hint"></span>
    </div>
    
    <div class="quickform-json-format-hint">
      Press <kbd>Cmd+Shift+F</kbd> (Mac) or <kbd>Ctrl+Shift+F</kbd> to format
    </div>

    <div class="quickform-json-editor-container">
      <Codemirror
        :id="fieldId"
        v-model="code"
        :style="{ height: editorHeight }"
        :extensions="extensions"
        :disabled="disabled || readonly"
        :indent-with-tab="true"
        :tab-size="2"
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
.quickform-json-field-wrapper {
  width: 100%;
}

.quickform-label-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.quickform-label-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.quickform-hint {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.25rem;
}

.quickform-json-format-hint {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 0.5rem;
  font-style: italic;
}

.quickform-json-format-hint kbd {
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 3px;
  padding: 0.125rem 0.375rem;
  font-family: monospace;
  font-size: 0.75rem;
  font-style: normal;
}

.quickform-json-editor-container {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 0.875rem;
}

.quickform-error {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #c10015;
}

/* CodeMirror customization for Quasar theme */
.quickform-json-editor-container :deep(.cm-editor) {
  background-color: #ffffff;
}

.quickform-json-editor-container :deep(.cm-gutters) {
  background-color: #f5f5f5;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.quickform-json-editor-container :deep(.cm-activeLineGutter) {
  background-color: rgba(25, 118, 210, 0.08);
}

.quickform-json-editor-container :deep(.cm-scroller) {
  overflow: auto;
}
</style>
