<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { QSelect } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";
import { mergeQuasarProps } from "../utils";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const {
  value,
  label,
  hint,
  errorMessage,
  fieldId,
  fieldGap,
  formContext,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'select',
});

// Custom quasarProps handling for select - need to strip some props we control
const quasarProps = computed(() => {
  const merged = mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults,
    "select"
  );
  // Remove QuickForms-specific properties and props we control internally
  const {
    autocomplete,
    autocompleteThreshold,
    useInput, // We control this via useFilter
    fillInput, // We control this via useFilter
    hideSelected, // We control this via useFilter
    ...quasarOnly
  } = merged;
  return quasarOnly;
});

const allOptions = computed(() => {
  if (!props.schema.enum) return [];

  // Support x-enum-labels for custom display text
  const enumLabels = (props.schema as any)["x-enum-labels"] as
    | Record<string, string>
    | undefined;

  // Support x-enum-descriptions for option descriptions
  const enumDescriptions = (props.schema as any)["x-enum-descriptions"] as
    | Record<string, string>
    | undefined;

  return props.schema.enum.map((enumValue) => {
    let displayLabel = String(enumValue);

    // Use custom label if provided
    if (enumLabels && enumValue in enumLabels) {
      displayLabel = enumLabels[enumValue];
    }

    // Get description if provided
    const description = enumDescriptions?.[enumValue] ?? undefined;

    return {
      label: displayLabel,
      value: enumValue,
      description,
    };
  });
});

// Check if any options have descriptions
const hasDescriptions = computed(() =>
  allOptions.value.some((opt) => opt.description)
);

// Filtered options for autocomplete
const filteredOptions = ref<Array<{ label: string; value: any; description?: string }>>([]);

// Initialize and update filteredOptions when allOptions changes
watch(
  allOptions,
  (newOptions) => {
    filteredOptions.value = newOptions;
  },
  { immediate: true }
);

// Check if autocomplete should be enabled
// Enabled by default, can be disabled via x-component-props or componentDefaults
const useFilter = computed(() => {
  // Check for explicit configuration in x-component-props (framework-agnostic)
  const xComponentProps = (props.schema as any)["x-component-props"];
  if (xComponentProps?.autocomplete !== undefined) {
    return xComponentProps.autocomplete;
  }

  // Check quickformsDefaults for autocomplete
  if (formContext?.quickformsDefaults?.select?.autocomplete !== undefined) {
    return (formContext as any).quickformsDefaults.select.autocomplete;
  }

  // Default: enabled for all selects
  const result = true;

  return result;
});

// Filter function for autocomplete
const filterFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === "") {
      filteredOptions.value = allOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredOptions.value = allOptions.value.filter((option) =>
        option.label.toLowerCase().includes(needle)
      );
    }
  });
};

</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
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
      :required="schema.required"
      :use-input="useFilter"
      :input-debounce="0"
      :fill-input="useFilter"
      :hide-selected="useFilter"
      clearable
      emit-value
      map-options
      v-bind="quasarProps"
      @filter="filterFn"
    >
      <template v-if="schema.required" #label>
        {{ label }} <span style="color: red">*</span>
      </template>
      <template v-if="hasDescriptions" #option="{ itemProps, opt }">
        <q-item v-bind="itemProps">
          <q-item-section>
            <q-item-label>{{ opt.label }}</q-item-label>
            <q-item-label v-if="opt.description" caption class="text-grey-7">
              {{ opt.description }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </QSelect>
  </div>
</template>
