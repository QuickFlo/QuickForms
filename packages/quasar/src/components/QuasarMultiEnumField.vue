<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { QSelect, QIcon, QTooltip, QItem, QItemSection, QItemLabel, QCheckbox } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";
import { mergeQuasarProps } from "../utils";

interface EnumOption {
  label: string;
  value: string | number;
  description?: string;
}

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const {
  value,
  setValue,
  label,
  hint,
  tooltip,
  tooltipPlacement,
  errorMessage,
  fieldId,
  fieldGap,
  formContext,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'select',
});

// Ensure value is an array (initialize without triggering validation)
if (!Array.isArray(value.value)) {
  // Use setValue with shouldValidate: false to avoid triggering dirty state
  setValue([], false);
}

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
    useInput,
    fillInput,
    hideSelected,
    ...quasarOnly
  } = merged;
  return quasarOnly;
});

// Get enum values from items.enum
const allOptions = computed<EnumOption[]>(() => {
  const itemsSchema = props.schema.items;
  if (!itemsSchema || typeof itemsSchema === "boolean") return [];

  const resolvedItems = Array.isArray(itemsSchema) ? itemsSchema[0] : itemsSchema;
  if (!resolvedItems) return [];

  const enumValues = resolvedItems.enum;
  if (!enumValues) return [];

  // Support x-enum-labels for custom display text
  const enumLabels = (resolvedItems as Record<string, unknown>)["x-enum-labels"] as
    | Record<string, string>
    | undefined;

  // Support x-enum-descriptions for option descriptions
  const enumDescriptions = (resolvedItems as Record<string, unknown>)["x-enum-descriptions"] as
    | Record<string, string>
    | undefined;

  return enumValues.map((enumValue) => {
    let displayLabel = String(enumValue);

    // Use custom label if provided
    if (enumLabels && enumValue in enumLabels) {
      displayLabel = enumLabels[enumValue as string];
    }

    // Get description if provided
    const description = enumDescriptions?.[enumValue as string] ?? undefined;

    return {
      label: displayLabel,
      value: enumValue as string | number,
      description,
    };
  });
});

// Check if any options have descriptions
const hasDescriptions = computed(() =>
  allOptions.value.some((opt) => opt.description)
);

// Filtered options for autocomplete
const filteredOptions = ref<EnumOption[]>([]);

// Initialize and update filteredOptions when allOptions changes
watch(
  allOptions,
  (newOptions) => {
    filteredOptions.value = newOptions;
  },
  { immediate: true }
);

// Check if autocomplete should be enabled (default: true)
const useFilter = computed<boolean>(() => {
  // Check x-component-props
  const xComponentProps = (props.schema as Record<string, unknown>)["x-component-props"] as
    | Record<string, unknown>
    | undefined;
  if (xComponentProps?.autocomplete !== undefined) {
    return !!xComponentProps.autocomplete;
  }

  // Check quickformsDefaults for autocomplete
  if (formContext?.quickformsDefaults?.select?.autocomplete !== undefined) {
    return !!formContext.quickformsDefaults.select.autocomplete;
  }

  // Default: enabled
  return true;
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
      <template v-if="tooltipPlacement === 'prepend' && tooltip" #prepend>
        <QIcon name="info" size="xs" color="grey-6" class="cursor-help">
          <QTooltip><span v-html="tooltip"></span></QTooltip>
        </QIcon>
      </template>
      <template v-if="tooltipPlacement === 'append' && tooltip" #append>
        <QIcon name="info" size="xs" color="grey-6" class="cursor-help">
          <QTooltip><span v-html="tooltip"></span></QTooltip>
        </QIcon>
      </template>
      <template v-if="hasDescriptions" #option="{ itemProps, opt }">
        <QItem v-bind="itemProps" class="q-hoverable">
          <QItemSection side>
            <QCheckbox
              :model-value="Array.isArray(value) && (value as unknown[]).includes(opt.value)"
              dense
              @click.stop.prevent
            />
          </QItemSection>
          <QItemSection>
            <QItemLabel class="text-weight-bold text-primary">{{ opt.label }}</QItemLabel>
            <QItemLabel v-if="opt.description" caption class="text-grey-7">
              {{ opt.description }}
            </QItemLabel>
          </QItemSection>
        </QItem>
      </template>
    </QSelect>
  </div>
</template>
