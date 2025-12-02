<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { useQuasar } from "quasar";
import { Codemirror } from "vue-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { linter, lintGutter } from "@codemirror/lint";
import {
  keymap,
  lineNumbers,
  EditorView as CMEditorView,
} from "@codemirror/view";
import type { FieldProps } from "@quickflo/quickforms-vue";
import type { ViewUpdate, EditorView } from "@codemirror/view";
import { useQuasarFormField } from "../composables/useQuasarFormField";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const {
  value,
  setValue,
  label,
  hint,
  errorMessage,
  required,
  fieldId,
  fieldGap,
  formContext,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: "jsoneditor",
});

const $q = useQuasar();

// CodeMirror text content
const code = ref("");
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
        code.value = "{}";
      }
      isInitializing.value = false;
    }
  },
  { immediate: true }
);

// Get editor height from schema, componentDefaults, or default
const editorHeight = computed(() => {
  // 1. Check schema x-json-height
  const xHeight = (props.schema as any)["x-json-height"];
  if (xHeight) {
    return xHeight;
  }

  // 2. Check quickformsDefaults
  const quickformsHeight = formContext?.quickformsDefaults?.jsoneditor?.height;
  if (quickformsHeight) {
    return quickformsHeight;
  }

  return "300px";
});

// Dark theme support - auto-detect from Quasar or override with schema/defaults
const useDarkTheme = computed(() => {
  // 1. Check schema x-json-dark-theme
  const xDarkTheme = (props.schema as any)["x-json-dark-theme"];
  if (xDarkTheme !== undefined) {
    console.log("[JSON Editor] Using darkTheme from schema:", xDarkTheme);
    return xDarkTheme === true;
  }

  // 2. Check quickformsDefaults
  const quickformsDarkTheme =
    formContext?.quickformsDefaults?.jsoneditor?.darkTheme;
  if (quickformsDarkTheme !== undefined) {
    console.log(
      "[JSON Editor] Using darkTheme from quickformsDefaults:",
      quickformsDarkTheme
    );
    return quickformsDarkTheme === true;
  }

  // 3. Auto-detect from Quasar's dark mode (if Dark plugin is installed)
  if ($q.dark) {
    const isActive = $q.dark.isActive;
    console.log("[JSON Editor] Auto-detected darkTheme from Quasar:", isActive);
    return isActive;
  }

  console.log("[JSON Editor] Using default darkTheme: false");
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
      selection: { anchor: newCursorPos },
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
  const xLineNumbers = (props.schema as any)["x-json-line-numbers"];
  if (xLineNumbers !== undefined) return xLineNumbers;

  return formContext?.quickformsDefaults?.jsoneditor?.lineNumbers ?? false;
});

const showLintGutter = computed(() => {
  const xLintGutter = (props.schema as any)["x-json-lint-gutter"];
  if (xLintGutter !== undefined) return xLintGutter;
  return formContext?.quickformsDefaults?.jsoneditor?.lintGutter ?? false;
});

const tabSize = computed(() => {
  const xTabSize = (props.schema as any)["x-json-tab-size"];
  if (xTabSize !== undefined) return xTabSize;
  return formContext?.quickformsDefaults?.jsoneditor?.tabSize ?? 2;
});

const indentWithTab = computed(() => {
  const xIndentWithTab = (props.schema as any)["x-json-indent-with-tab"];
  if (xIndentWithTab !== undefined) return xIndentWithTab;
  return formContext?.quickformsDefaults?.jsoneditor?.indentWithTab ?? true;
});

const formatKey = computed(() => {
  const xFormatKey = (props.schema as any)["x-json-format-key"];
  if (xFormatKey !== undefined) return xFormatKey;
  return formContext?.quickformsDefaults?.jsoneditor?.formatKey ?? "Ctrl-.";
});

// CodeMirror extensions
const extensions = computed(() => {
  console.log("[JSON Editor] Building extensions:", {
    showLineNumbers: showLineNumbers.value,
    showLintGutter: showLintGutter.value,
    useDarkTheme: useDarkTheme.value,
  });

  const exts = [
    json(),
    // Add keyboard shortcut for formatting
    keymap.of([
      {
        key: formatKey.value,
        run: formatJSON,
      },
    ]),
  ];

  // Add line numbers if enabled, or explicitly hide gutters if disabled
  if (showLineNumbers.value) {
    console.log("[JSON Editor] Adding lineNumbers extension");
    exts.push(lineNumbers());
  } else {
    console.log("[JSON Editor] Hiding gutters and line numbers");
    // Explicitly hide ALL gutters including basicSetup's default line numbers
    exts.push(
      CMEditorView.theme({
        ".cm-gutters": {
          display: "none !important",
        },
      })
    );
  }

  // Add linting if enabled
  if (showLintGutter.value) {
    exts.push(linter(jsonParseLinter()));
    exts.push(lintGutter());
  }

  // Add dark theme if enabled
  if (useDarkTheme.value) {
    console.log("[JSON Editor] Adding oneDark theme");
    exts.push(oneDark);
  } else {
    console.log("[JSON Editor] NOT adding oneDark theme");
  }

  console.log("[JSON Editor] Final extensions count:", exts.length);
  return exts;
});

const displayError = computed(() => parseError.value || errorMessage.value);

// Create a key that changes when extensions configuration changes
// This forces CodeMirror to remount with new extensions
const editorKey = computed(
  () =>
    `${showLineNumbers.value}-${showLintGutter.value}-${useDarkTheme.value}-${formatKey.value}`
);

// Watch for key changes and force re-initialization
watch(editorKey, () => {
  console.log("[JSON Editor] editorKey changed, forcing remount");
  // Trigger re-initialization by briefly clearing then restoring code
  const currentCode = code.value;
  code.value = "";
  nextTick(() => {
    code.value = currentCode;
  });
});

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
      Press <kbd>{{ formatKey }}</kbd> to format
    </div>

    <div
      class="quickform-json-editor-container"
      :class="{ 'quickform-json-editor-dark': useDarkTheme }"
    >
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

<style>
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
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
    monospace;
  font-size: 0.875rem;
}

.quickform-error {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #c10015;
}

/* CodeMirror customization for Quasar theme */
.quickform-json-editor-container :deep(.cm-scroller) {
  overflow: auto;
}

/* Light theme styles - only apply when NOT in dark mode */
.quickform-json-editor-container:not(.quickform-json-editor-dark)
  :deep(.cm-editor) {
  background-color: #ffffff;
}

.quickform-json-editor-container:not(.quickform-json-editor-dark)
  :deep(.cm-gutters) {
  background-color: #f5f5f5;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.quickform-json-editor-container:not(.quickform-json-editor-dark)
  :deep(.cm-activeLineGutter) {
  background-color: rgba(25, 118, 210, 0.08);
}

/* Dark theme - let oneDark extension handle the styling */
.quickform-json-editor-dark :deep(.cm-editor) {
  /* oneDark extension provides the dark background */
}

.quickform-json-editor-dark :deep(.cm-gutters) {
  /* oneDark extension provides the dark gutter styling */
}

.quickform-json-editor-dark :deep(.cm-scroller) {
  /* oneDark extension provides the dark scroller styling */
}
</style>
