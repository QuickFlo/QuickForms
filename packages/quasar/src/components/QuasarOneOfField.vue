<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { QCard, QCardSection, QSelect, QTabs, QTab, QTabPanels, QTabPanel } from 'quasar';
import { useFormField, useFormContext } from '@quickflo/quickforms-vue';
import { generateFieldId } from '@quickflo/quickforms-vue';
import { FieldRenderer } from '@quickflo/quickforms-vue';
import type { FieldProps } from '@quickflo/quickforms-vue';
import { schemaUtils } from '../schema-utils-singleton';
import { getFieldGapStyle } from '../utils';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, label, hint, errorMessage } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const fieldId = generateFieldId(props.path);
const formContext = useFormContext();

const quasarProps = computed(() => {
  const xQuasarProps = (props.schema as any)['x-quasar-props'] || {};
  const xComponentProps = (props.schema as any)['x-component-props'] || {};
  return { ...xComponentProps, ...xQuasarProps };
});

// Get the sub-schemas
const options = computed(() => props.schema.oneOf || props.schema.anyOf || []);

// Selected option index
const selectedIndex = ref(0);

// Try to determine initial selection based on data
onMounted(() => {
  if (value.value) {
    const index = options.value.findIndex((optionSchema) => {
      const result = schemaUtils.validate(optionSchema, value.value);
      return result.valid;
    });

    if (index !== -1) {
      selectedIndex.value = index;
    }
  }
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
  return schema && schema.properties && !schema.oneOf && !schema.anyOf && !schema.allOf;
});

// Get display style: 'tabs' | 'dropdown' (default based on option count)
const displayStyle = computed(() => {
  const xOneofStyle = (props.schema as any)['x-oneof-style'];
  if (xOneofStyle) {
    return xOneofStyle;
  }
  // Default: tabs for 2-4 options, dropdown for more
  return options.value.length <= 4 ? 'tabs' : 'dropdown';
});

// Get custom labels from x-oneof-labels or fall back to option titles
const getOptionLabel = (option: any, index: number): string => {
  const xOneofLabels = (props.schema as any)['x-oneof-labels'] as string[] | undefined;
  if (xOneofLabels && xOneofLabels[index]) {
    return xOneofLabels[index];
  }
  return option.title || `Option ${index + 1}`;
};

// Compute display labels for the dropdown/tabs
const allSelectOptions = computed(() => {
  return options.value.map((option, index) => ({
    label: getOptionLabel(option, index),
    value: index,
  }));
});

// Filtered options for autocomplete
const filteredOptions = ref(allSelectOptions.value);

// Update filtered options when allSelectOptions changes
watch(allSelectOptions, (newOptions) => {
  filteredOptions.value = newOptions;
}, { immediate: true });

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
      filteredOptions.value = allSelectOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredOptions.value = allSelectOptions.value.filter(
        (option) => option.label.toLowerCase().includes(needle)
      );
    }
  });
};

// Handle manual switch
const handleOptionChange = (newIndex: number) => {
  selectedIndex.value = newIndex;
  // Keep existing value to allow common fields to persist
};

const fieldGap = computed(() => getFieldGapStyle(formContext?.componentDefaults));
</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <QCard flat bordered>
    <QCardSection>
      <div v-if="label" style="font-weight: 500; margin-bottom: 0.5rem">
        {{ label }}
        <span v-if="schema.required" style="color: red; margin-left: 0.125rem">*</span>
      </div>

      <div v-if="hint" style="font-size: 0.875rem; color: #666; margin-bottom: 0.75rem">
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

        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee">
          <!-- Render object properties directly to avoid nested expansion panel -->
          <template v-if="shouldRenderPropertiesInline">
            <FieldRenderer
              v-for="prop in activeProperties"
              :key="prop.key"
              :schema="prop.schema"
              :path="prop.path"
              :disabled="disabled"
              :readonly="readonly"
            />
          </template>
          <!-- Fallback for non-object schemas -->
          <FieldRenderer
            v-else-if="activeSchema"
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
          label="Select Option"
          :disable="disabled || readonly"
          :use-input="useFilter"
          :input-debounce="0"
          :fill-input="useFilter"
          :hide-selected="useFilter"
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="handleOptionChange"
          @filter="filterFn"
          v-bind="quasarProps"
        />

        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #ddd">
          <!-- Render object properties directly to avoid nested expansion panel -->
          <template v-if="shouldRenderPropertiesInline">
            <FieldRenderer
              v-for="prop in activeProperties"
              :key="prop.key"
              :schema="prop.schema"
              :path="prop.path"
              :disabled="disabled"
              :readonly="readonly"
            />
          </template>
          <!-- Fallback for non-object schemas -->
          <FieldRenderer
            v-else-if="activeSchema"
            :schema="activeSchema"
            :path="path"
            :disabled="disabled"
            :readonly="readonly"
          />
        </div>
      </template>

      <div v-if="errorMessage" style="color: red; font-size: 0.875rem; margin-top: 0.5rem">
        {{ errorMessage }}
        </div>
      </QCardSection>
    </QCard>
  </div>
</template>
