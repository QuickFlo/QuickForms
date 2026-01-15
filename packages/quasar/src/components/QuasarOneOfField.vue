<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  QCard,
  QCardSection,
  QSelect,
  QTabs,
  QTab,
  QTabPanels,
  QTabPanel,
} from "quasar";
import { FieldRenderer } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";
import { schemaUtils } from "../schema-utils-singleton";
import { mergeQuasarProps } from "../utils";

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
  fieldId,
  fieldGap,
  formContext,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'card',
});

// Use mergeQuasarProps to get defaults from componentDefaults (including dense)
const quasarProps = computed(() => {
  const merged = mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults,
    "select"
  );
  // Remove props we control internally
  const {
    autocomplete,
    useInput,
    fillInput,
    hideSelected,
    ...quasarOnly
  } = merged;
  return quasarOnly;
});

// Get the sub-schemas
const options = computed(() => props.schema.oneOf || props.schema.anyOf || []);

// Selected option index
const selectedIndex = ref(0);

// Track if initial mount has completed (to avoid watcher overwriting existing data)
const isInitialized = ref(false);

// Extract const values from a schema's properties
const extractConstValues = (schema: any): Record<string, any> => {
  const constValues: Record<string, any> = {};
  if (!schema?.properties) return constValues;

  for (const [key, propSchema] of Object.entries(schema.properties)) {
    if ((propSchema as any).const !== undefined) {
      constValues[key] = (propSchema as any).const;
    }
  }
  return constValues;
};

// Find option index by matching discriminator const value against data
const findMatchingOptionIndex = (data: any): number => {
  if (!data || typeof data !== 'object') {
    return 0;
  }
  
  // Check each option for a const property that matches the data
  for (let i = 0; i < options.value.length; i++) {
    const optionSchema = options.value[i];
    if (!optionSchema?.properties) {
      continue;
    }
    
    // Look for const fields and check if data matches
    for (const [key, propSchema] of Object.entries(optionSchema.properties)) {
      const constValue = (propSchema as any).const;
      if (constValue !== undefined && data[key] === constValue) {
        return i;
      }
    }
  }
  
  // Fallback to schema validation if no const match found
  const index = options.value.findIndex((optionSchema) => {
    const result = schemaUtils.validate(optionSchema, data);
    return result.valid;
  });
  
  return index !== -1 ? index : 0;
};

// Try to determine initial selection based on data and initialize defaults
onMounted(() => {
  const initialIndex = findMatchingOptionIndex(value.value);
  
  selectedIndex.value = initialIndex;
  
  // Initialize default values for the selected schema
  // This ensures fields exist even if the form starts empty
  const initialSchema = options.value[initialIndex];
  if (initialSchema && initialSchema.properties) {
    const currentValue = (value.value && typeof value.value === 'object') ? value.value : {};
    const defaults = schemaUtils.getDefaultValue(initialSchema) || {};
    
    // Extract const values (discriminator fields) - these MUST be set
    const constValues = extractConstValues(initialSchema);
    
    // Merge: const values take priority, then current values, then defaults
    const merged = { ...defaults, ...currentValue, ...constValues };
    
    // Check if we need to update:
    // - Any new fields that don't exist in current value
    // - Any const values that are missing or different
    const hasNewFields = Object.keys(merged).some(key => !(key in currentValue));
    const hasMissingConst = Object.entries(constValues).some(
      ([key, val]) => currentValue[key] !== val
    );
    
    if ((hasNewFields || hasMissingConst) && setValue) {
      // Pass false to skip validation during initialization
      setValue(merged, false);
    }
  }
  
  // Mark initialization complete after mount logic runs
  isInitialized.value = true;
});

const activeSchema = computed(() => options.value[selectedIndex.value]);

// Get properties from active schema for direct rendering (avoids nested expansion panel)
const activeProperties = computed(() => {
  const schema = activeSchema.value;
  if (!schema || !schema.properties) {
    return [];
  }
  return Object.entries(schema.properties).map(([key, propSchema]) => ({
    key,
    schema: propSchema,
    path: props.path ? `${props.path}.${key}` : key,
  }));
});

// Check if active schema is a simple object with properties (render inline)
// vs something more complex that needs its own renderer
const shouldRenderPropertiesInline = computed(() => {
  const schema = activeSchema.value;
  return (
    schema &&
    schema.properties &&
    !schema.oneOf &&
    !schema.anyOf &&
    !schema.allOf
  );
});

// Get display style: 'tabs' | 'dropdown' (default based on option count)
const displayStyle = computed(() => {
  const xOneofStyle = (props.schema as any)["x-oneof-style"];
  if (xOneofStyle) {
    return xOneofStyle;
  }
  // Check componentDefaults
  const defaultStyle = formContext?.componentDefaults?.oneOf?.displayStyle;
  if (defaultStyle) {
    return defaultStyle;
  }
  // Default: tabs for 2-4 options, dropdown for more
  return options.value.length <= 4 ? "tabs" : "dropdown";
});

// Detect discriminator field from the first option's const properties
const discriminatorField = computed(() => {
  const firstOption = options.value[0];
  if (!firstOption?.properties) return null;

  // Find property with a const value (discriminator)
  for (const [key, propSchema] of Object.entries(firstOption.properties)) {
    if ((propSchema as any).const !== undefined) {
      return key;
    }
  }
  return null;
});

// Get discriminator value for a given option schema
const getDiscriminatorValue = (option: any): string | null => {
  const field = discriminatorField.value;
  if (!field || !option?.properties?.[field]) return null;
  return (option.properties[field] as any).const ?? null;
};

// Get custom labels from x-oneof-labels or fall back to option titles
// Supports both array format and object format keyed by discriminator value
const getOptionLabel = (option: any, index: number): string => {
  const xOneofLabels = (props.schema as any)["x-oneof-labels"];

  if (xOneofLabels) {
    // Array format: ["Label 1", "Label 2", ...]
    if (Array.isArray(xOneofLabels) && xOneofLabels[index]) {
      return xOneofLabels[index];
    }

    // Object format keyed by discriminator value: { "value1": "Label 1", "value2": "Label 2" }
    if (typeof xOneofLabels === 'object') {
      const discValue = getDiscriminatorValue(option);
      if (discValue && xOneofLabels[discValue]) {
        return xOneofLabels[discValue];
      }
    }
  }

  return option.title || `Option ${index + 1}`;
};

// Get description for the currently selected option
const activeOptionDescription = computed((): string | null => {
  const xOneofDescriptions = (props.schema as any)["x-oneof-descriptions"];
  if (!xOneofDescriptions) return null;

  const option = activeSchema.value;
  if (!option) return null;

  // Array format
  if (Array.isArray(xOneofDescriptions) && xOneofDescriptions[selectedIndex.value]) {
    return xOneofDescriptions[selectedIndex.value];
  }

  // Object format keyed by discriminator value
  if (typeof xOneofDescriptions === 'object') {
    const discValue = getDiscriminatorValue(option);
    if (discValue && xOneofDescriptions[discValue]) {
      return xOneofDescriptions[discValue];
    }
  }

  return null;
});

// Compute display labels for the dropdown/tabs
const allSelectOptions = computed(() => {
  return options.value.map((option, index) => ({
    label: getOptionLabel(option, index),
    value: index,
  }));
});

// Get select label from x-oneof-select-label or componentDefaults
const selectLabel = computed(() => {
  const xOneofSelectLabel = (props.schema as any)["x-oneof-select-label"] as
    | string
    | undefined;
  if (xOneofSelectLabel) {
    return xOneofSelectLabel;
  }
  return formContext?.componentDefaults?.oneOf?.selectLabel || "Select Option";
});

// Filtered options for autocomplete
const filteredOptions = ref(allSelectOptions.value);

// Update filtered options when allSelectOptions changes
watch(
  allSelectOptions,
  (newOptions) => {
    filteredOptions.value = newOptions;
  },
  { immediate: true }
);

// Check if autocomplete should be enabled (default: true)
const useFilter = computed(() => {
  // Check x-component-props
  const xComponentProps = (props.schema as any)["x-component-props"];
  if (xComponentProps?.autocomplete !== undefined) {
    return xComponentProps.autocomplete;
  }

  // Check quickformsDefaults for autocomplete
  if (formContext?.quickformsDefaults?.select?.autocomplete !== undefined) {
    return (formContext as any).quickformsDefaults.select.autocomplete;
  }

  // Default: enabled
  return true;
});

// Filter function for autocomplete
const filterFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === "") {
      filteredOptions.value = allSelectOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredOptions.value = allSelectOptions.value.filter((option) =>
        option.label.toLowerCase().includes(needle)
      );
    }
  });
};

// Apply schema defaults and const values for a given option index
const applySchemaDefaults = (index: number) => {
  const newSchema = options.value[index];
  if (newSchema && newSchema.properties) {
    const currentValue = (value.value && typeof value.value === 'object') ? value.value : {};
    const defaults = schemaUtils.getDefaultValue(newSchema) || {};

    // Extract const values (discriminator fields) - these MUST be set
    const constValues = extractConstValues(newSchema);

    // Merge: const values take priority, then current values, then defaults
    const merged = { ...defaults, ...currentValue, ...constValues };

    // Update form value - skip validation during option switch
    if (setValue) {
      setValue(merged, false);
    }
  }
};

// Watch for tab changes (tabs mode uses v-model directly)
// Skip during initialization to avoid overwriting existing data
watch(selectedIndex, (newIndex, oldIndex) => {
  if (isInitialized.value && newIndex !== oldIndex) {
    applySchemaDefaults(newIndex);
  }
});

// Handle manual switch (for dropdown mode)
const handleOptionChange = (newIndex: number) => {
  selectedIndex.value = newIndex;
  // Note: the watcher will handle applying defaults
};

</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <QCard flat bordered>
      <QCardSection>
        <div v-if="label" style="font-weight: 500; margin-bottom: 0.5rem">
          {{ label }}
          <span v-if="schema.required" style="color: red; margin-left: 0.125rem"
            >*</span
          >
        </div>

        <div
          v-if="hint"
          style="font-size: 0.875rem; color: #666; margin-bottom: 0.75rem"
        >
          {{ hint }}
        </div>

        <!-- Tabs display mode -->
        <template v-if="displayStyle === 'tabs'">
          <QTabs
            v-model="selectedIndex"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
          >
            <QTab
              v-for="option in allSelectOptions"
              :key="option.value"
              :name="option.value"
              :label="option.label"
              :disable="disabled || readonly"
            />
          </QTabs>

          <!-- Option description hint -->
          <div
            v-if="activeOptionDescription"
            style="font-size: 0.875rem; color: #666; margin-top: 0.5rem"
          >
            {{ activeOptionDescription }}
          </div>

          <div
            style="
              margin-top: 1rem;
              padding-top: 1rem;
              border-top: 1px solid #eee;
            "
          >
            <!-- Render object properties directly to avoid nested expansion panel -->
            <template v-if="shouldRenderPropertiesInline">
              <FieldRenderer
                v-for="prop in activeProperties"
                :key="`${selectedIndex}-${prop.key}`"
                :schema="prop.schema"
                :path="prop.path"
                :disabled="disabled"
                :readonly="readonly"
              />
            </template>
            <!-- Fallback for non-object schemas -->
            <FieldRenderer
              v-else-if="activeSchema"
              :key="`${selectedIndex}-fallback`"
              :schema="activeSchema"
              :path="path"
              :disabled="disabled"
              :readonly="readonly"
            />
          </div>
        </template>

        <!-- Dropdown display mode -->
        <template v-else>
          <QSelect
            v-model="selectedIndex"
            :options="filteredOptions"
            :label="selectLabel"
            :disable="disabled || readonly"
            :use-input="useFilter"
            :input-debounce="0"
            :fill-input="useFilter"
            :hide-selected="useFilter"
            clearable
            emit-value
            map-options
            @update:model-value="handleOptionChange"
            @filter="filterFn"
            v-bind="quasarProps"
          />

          <!-- Option description hint -->
          <div
            v-if="activeOptionDescription"
            style="font-size: 0.875rem; color: #666; margin-top: 0.75rem"
          >
            {{ activeOptionDescription }}
          </div>

          <div
            style="
              margin-top: 1rem;
              padding-top: 1rem;
              border-top: 1px dashed #ddd;
            "
          >
            <!-- Render object properties directly to avoid nested expansion panel -->
            <template v-if="shouldRenderPropertiesInline">
              <FieldRenderer
                v-for="prop in activeProperties"
                :key="`${selectedIndex}-${prop.key}`"
                :schema="prop.schema"
                :path="prop.path"
                :disabled="disabled"
                :readonly="readonly"
              />
            </template>
            <!-- Fallback for non-object schemas -->
            <FieldRenderer
              v-else-if="activeSchema"
              :key="`${selectedIndex}-fallback`"
              :schema="activeSchema"
              :path="path"
              :disabled="disabled"
              :readonly="readonly"
            />
          </div>
        </template>

        <div
          v-if="errorMessage"
          style="color: red; font-size: 0.875rem; margin-top: 0.5rem"
        >
          {{ errorMessage }}
        </div>
      </QCardSection>
    </QCard>
  </div>
</template>
