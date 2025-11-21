<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormField } from "../composables/useFormField.js";
import { useFormContext } from "../composables/useFormContext.js";
import { generateFieldId } from "../composables/utils.js";
import type { FieldProps } from "../types/index.js";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, errorMessage, label, hint, hintMode } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);
const formContext = useFormContext();
const fieldId = generateFieldId(props.path);
const datalistId = `${fieldId}-datalist`;
const isFocused = ref(false);
const isHovered = ref(false);

const options = computed(() => {
  if (!props.schema.enum) return [];

  // Support x-enum-labels for custom display text
  const enumLabels = (props.schema as any)["x-enum-labels"] as
    | Record<string, string>
    | undefined;

  return props.schema.enum.map((enumValue) => {
    let displayLabel = String(enumValue);

    // Use custom label if provided
    if (enumLabels && enumValue in enumLabels) {
      displayLabel = enumLabels[enumValue];
    }

    return {
      value: enumValue,
      label: displayLabel,
    };
  });
});

// Check if autocomplete should be enabled
const useAutocomplete = computed(() => {
  // Schema-level override via x-component-props
  const componentProps = (props.schema as any)["x-component-props"] as
    | Record<string, any>
    | undefined;
  if (componentProps?.autocomplete !== undefined) {
    return componentProps.autocomplete;
  }

  // Global default from componentDefaults
  const shouldEnable =
    formContext?.componentDefaults?.select?.autocomplete || false;
  const threshold =
    formContext?.componentDefaults?.select?.autocompleteThreshold || 5;

  // Enable if explicitly set OR if options exceed threshold
  return shouldEnable || options.value.length >= threshold;
});

// Get placeholder text
const placeholder = computed(() => {
  return formContext?.labels?.selectPlaceholder || "Select an option...";
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
  <div class="quickform-field quickform-enum-field">
    <label :for="fieldId" class="quickform-label">
      {{ label }}
      <span v-if="props.schema.required" class="quickform-required">*</span>
    </label>

    <!-- Use datalist for autocomplete when enabled -->
    <input
      v-if="useAutocomplete"
      :id="fieldId"
      v-model="value"
      :list="datalistId"
      class="quickform-select quickform-autocomplete"
      :disabled="disabled"
      :placeholder="placeholder"
      :aria-describedby="hint ? `${fieldId}-hint` : undefined"
      :aria-invalid="!!errorMessage"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    />
    <datalist :id="datalistId">
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </datalist>

    <!-- Use regular select when autocomplete disabled -->
    <select
      v-if="!useAutocomplete"
      :id="fieldId"
      v-model="value"
      class="quickform-select"
      :disabled="disabled"
      :aria-describedby="hint ? `${fieldId}-hint` : undefined"
      :aria-invalid="!!errorMessage"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <option value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <div
      v-if="showHint"
      :id="`${fieldId}-hint`"
      class="quickform-hint"
    >
      <span v-html="hint"></span>
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
