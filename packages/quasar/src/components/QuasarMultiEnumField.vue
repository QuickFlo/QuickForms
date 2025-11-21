<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { QSelect } from 'quasar';
import { useFormField, useFormContext } from '@quickflo/quickforms-vue';
import { generateFieldId } from '@quickflo/quickforms-vue';
import type { FieldProps } from '@quickflo/quickforms-vue';
import { mergeQuasarProps } from '../utils';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, errorMessage, label, hint } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const formContext = useFormContext();
const fieldId = generateFieldId(props.path);

// Ensure value is an array
if (!Array.isArray(value.value)) {
  value.value = [];
}

const quasarProps = computed(() => {
  const merged = mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults as any,
    'select'
  );
  // Remove QuickForms-specific properties and props we control internally
  const {
    autocomplete,
    autocompleteThreshold,
    useInput,
    fillInput,
    hideSelected,
    ...quasarOnly
  } = merged;
  return quasarOnly;
});

// Get enum values from items.enum
const allOptions = computed(() => {
  const itemsSchema = props.schema.items;
  if (!itemsSchema || typeof itemsSchema === 'boolean') return [];
  
  const enumValues = Array.isArray(itemsSchema) 
    ? itemsSchema[0]?.enum 
    : itemsSchema.enum;
    
  if (!enumValues) return [];

  // Support x-enum-labels for custom display text
  const enumLabels = (itemsSchema as any)['x-enum-labels'] as
    | Record<string, string>
    | undefined;

  return enumValues.map((enumValue) => {
    let displayLabel = String(enumValue);

    // Use custom label if provided
    if (enumLabels && enumValue in enumLabels) {
      displayLabel = enumLabels[enumValue];
    }

    return {
      label: displayLabel,
      value: enumValue,
    };
  });
});

// Filtered options for autocomplete
const filteredOptions = ref<Array<{ label: string; value: any }>>([]);

// Initialize and update filteredOptions when allOptions changes
watch(
  allOptions,
  (newOptions) => {
    filteredOptions.value = newOptions;
  },
  { immediate: true }
);

const rules = computed(() => {
  const rulesList: any[] = []
  if (props.schema.required) {
    rulesList.push(
      (val: any[]) => (val && val.length > 0) || 'At least one item is required'
    );
  }
  if (props.schema.minItems) {
    rulesList.push(
      (val: any[]) =>
        !val || val.length >= (props.schema.minItems || 0) ||
        `Select at least ${props.schema.minItems} items`
    );
  }
  if (props.schema.maxItems) {
    rulesList.push(
      (val: any[]) =>
        !val || val.length <= (props.schema.maxItems || Infinity) ||
        `Select at most ${props.schema.maxItems} items`
    );
  }
  return rulesList;
});

// Check if autocomplete should be enabled (default: true)
const useFilter = computed(() => {
  // Check x-component-props
  const xComponentProps = (props.schema as any)['x-component-props'];
  if (xComponentProps?.autocomplete !== undefined) {
    return xComponentProps.autocomplete;
  }

  // Check componentDefaults
  if (formContext?.componentDefaults?.select?.autocomplete !== undefined) {
    return formContext.componentDefaults.select.autocomplete;
  }

  // Default: enabled
  return true;
});

// Filter function for autocomplete
const filterFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      filteredOptions.value = allOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredOptions.value = allOptions.value.filter(
        (option) => option.label.toLowerCase().includes(needle)
      );
    }
  });
};
</script>

<template>
  <QSelect
    :id="fieldId"
    v-model="value"
    :label="label"
    :hint="hint"
    :options="filteredOptions"
    :error="!!errorMessage"
    :error-message="errorMessage || undefined"
    :disable="disabled"
    :readonly="readonly"
    :rules="rules"
    :required="schema.required"
    :use-input="useFilter"
    :input-debounce="0"
    multiple
    use-chips
    clearable
    emit-value
    map-options
    v-bind="quasarProps"
    @filter="filterFn"
  >
    <template v-if="schema.required" #label>
      {{ label }} <span style="color: red">*</span>
    </template>
  </QSelect>
</template>
