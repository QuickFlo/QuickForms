<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { QInput, QIcon } from 'quasar';
import { useFormField, generateFieldId, useFormContext } from '@quickflo/quickforms-vue';
import type { FieldProps } from '@quickflo/quickforms-vue';
import type { QuasarFormOptions } from '../types';

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
function handleInput(val: string) {
  jsonText.value = val;

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

// Get Quasar-specific props with defaults
const quasarProps = computed(() => {
  const globalDefaults = formContext?.componentDefaults?.global || {};
  const jsonEditorDefaults = formContext?.componentDefaults?.jsoneditor || {};
  const xQuasarProps = (props.schema as any)['x-quasar-props'] || {};
  const xComponentProps = (props.schema as any)['x-component-props'] || {};
  
  // Merge in order: global defaults < jsoneditor defaults < schema-specific props
  return { ...globalDefaults, ...jsonEditorDefaults, ...xComponentProps, ...xQuasarProps };
});

// Get QuickForms-specific features (icons, etc.)
const quickformsFeatures = computed(() => {
  const globalFeatures = formContext?.quickformsDefaults?.global || {};
  const jsonEditorFeatures = formContext?.quickformsDefaults?.jsoneditor || {};
  const xQuickformsQuasar = (props.schema as any)['x-quickforms-quasar'] || {};
  
  // Merge in order: global < jsoneditor < schema-specific
  return { ...globalFeatures, ...jsonEditorFeatures, ...xQuickformsQuasar };
});

// Whether to show the format hint icon (default: true)
const showFormatHint = computed(() => {
  return quickformsFeatures.value.showFormatHint !== false;
});

// Get rows from schema or default
const rows = computed(() => {
  const xRows = (props.schema as any)['x-rows'];
  return xRows !== undefined ? xRows : 8;
});

</script>

<template>
  <div class="quickform-json-field-wrapper">
    <div v-if="label" class="quickform-label-header">
      <span class="quickform-label-text">
        {{ label }}
        <span v-if="required" style="color: red; margin-left: 0.25rem">*</span>
      </span>
      <span v-if="showFormatHint" class="quickform-info-icon" title="Press Ctrl+Space to format JSON">ⓘ</span>
    </div>
    <QInput
      :id="fieldId"
      :model-value="jsonText"
      :hint="hint"
      :error="!!displayError"
      :error-message="displayError || undefined"
      :disable="disabled"
      :readonly="readonly"
      :rules="[() => !displayError || displayError]"
      type="textarea"
      :rows="rows"
      outlined
      dense
      class="quickform-json-field"
      input-class="quickform-json-editor"
      input-style="font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace; font-size: 0.813rem; line-height: 1.5;"
      placeholder="{}"
      v-bind="quasarProps"
      @update:model-value="handleInput"
      @keydown="handleKeyDown"
    >
      <template v-if="quickformsFeatures.prependIcon" #prepend>
        <QIcon
          :name="quickformsFeatures.prependIcon"
          :color="quickformsFeatures.iconColor || 'grey-7'"
          :size="quickformsFeatures.iconSize || 'sm'"
        />
      </template>
      <template v-if="quickformsFeatures.appendIcon" #append>
        <QIcon
          :name="quickformsFeatures.appendIcon"
          :color="quickformsFeatures.iconColor || 'grey-7'"
          :size="quickformsFeatures.iconSize || 'sm'"
        />
      </template>
    </QInput>
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

.quickform-info-icon {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.54);
  cursor: help;
  opacity: 0.7;
  transition: opacity 0.2s;
  line-height: 1;
  display: flex;
  align-items: center;
}

.quickform-info-icon:hover {
  opacity: 1;
}

.quickform-json-field-wrapper :deep(.quickform-json-editor) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 0.813rem;
  line-height: 1.5;
}
</style>
