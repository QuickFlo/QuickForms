<script setup lang="ts">
import {
  computed,
  watch,
  reactive,
  markRaw,
  toRaw,
  ref,
  nextTick,
  onMounted,
} from "vue";
import { useForm } from "vee-validate";
import type { JSONSchema } from "@quickflo/quickforms";
import { provideFormContext } from "../composables/useFormContext.js";
import type { FormOptions } from "../types/index.js";
import { createDefaultRegistry } from "../registry.js";
import FieldRenderer from "./FieldRenderer.vue";
import { schemaUtils } from "../schema-utils-singleton.js";

interface Props {
  schema: JSONSchema;
  options?: FormOptions<any>;
  showLoadingOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({}),
  showLoadingOverlay: true,
});

const model = defineModel<Record<string, any>>({ default: () => ({}) });

const emit = defineEmits<{
  submit: [value: Record<string, any>];
  validation: [
    result: { valid: boolean; errors: Record<string, string | undefined> }
  ];
  ready: [];
}>();

// Use provided registry or create default
const registry = props.options.registry || createDefaultRegistry();

// Single-field support: use a synthetic root path to avoid empty field names
const SINGLE_FIELD_PATH = "__root__";

// Determine if this schema represents a single logical field
// This is true when:
// 1. Schema is an object type without properties (freeform JSON)
// 2. Schema has x-render defined (custom component should handle the entire object)
// 3. Schema has oneOf/anyOf at root level (discriminated union)
const isSingleField = computed(() => {
  const schema = props.schema as any;
  // If x-render is specified on the root, treat entire object as single field
  // so the custom component can handle all properties itself
  if (schema['x-render']) {
    return true;
  }
  // Root-level oneOf/anyOf (e.g., from Zod discriminatedUnion) should be treated as single field
  // so the OneOfField component can handle the entire schema
  if (schema.oneOf || schema.anyOf) {
    return true;
  }
  return props.schema.type === "object" && !props.schema.properties;
});

// Compute initial values for the form
const initialValues = isSingleField.value
  ? {
      [SINGLE_FIELD_PATH]:
        model.value &&
        typeof model.value === "object" &&
        Object.keys(model.value).length > 0
          ? model.value
          : props.options.useDefaults !== false
          ? schemaUtils.getDefaultValue(props.schema)
          : {},
    }
  : props.options.useDefaults !== false
  ? { ...schemaUtils.getDefaultValue(props.schema), ...model.value }
  : { ...model.value };

// Initialize form with VeeValidate
const { handleSubmit, values, setValues, setFieldValue, errors, meta } =
  useForm({
    initialValues,
    validateOnMount: props.options.validateOnMount ?? false,
  });

// Default labels for i18n
const defaultLabels = {
  selectPlaceholder: "Select an option...",
  addItem: "Add item",
  removeItem: "Remove",
  submit: "Submit",
  showPassword: "Show password",
  hidePassword: "Hide password",
};

// Default component configurations
const defaultComponentDefaults = {
  layout: {
    fieldGap: '1rem',
  },
  select: {
    autocomplete: true, // Enable autocomplete by default (Quasar uses this)
    autocompleteThreshold: 5,
  },
  array: {
    collapsible: false,
    defaultCollapsed: false,
  },
  number: {},
  hints: {
    showMode: "always" as const,
  },
};

// Provide form context to children
// Use reactive to ensure updates propagate
const formContext = reactive({
  readonly: computed(() => props.options.readonly || false),
  disabled: computed(() => props.options.disabled || false),
  schema: props.schema, // Schema usually doesn't change, but if it does, we might need computed
  rootPath: "",
  registry: markRaw(registry), // markRaw prevents Vue from making components reactive
  context: computed(() => props.options.context || {}),
  validationMode: props.options.validationMode || "ValidateAndShow",
  errorMessages: props.options.errorMessages,
  validators: props.options.validators,
  validatorDebounce: props.options.validatorDebounce,
  formValues: () => {
    if (isSingleField.value) {
      return toRaw(values[SINGLE_FIELD_PATH] as Record<string, any>);
    }

    return toRaw(values);
  },
  labels: { ...defaultLabels, ...props.options.labels },
  componentDefaults: {
    // Start with all custom component defaults from options
    ...props.options.componentDefaults,
    // Then merge in the built-in defaults
    layout: {
      ...defaultComponentDefaults.layout,
      ...props.options.componentDefaults?.layout,
    },
    select: {
      ...defaultComponentDefaults.select,
      ...props.options.componentDefaults?.select,
    },
    array: {
      ...defaultComponentDefaults.array,
      ...props.options.componentDefaults?.array,
    },
    number: {
      ...defaultComponentDefaults.number,
      ...props.options.componentDefaults?.number,
    },
    hints: {
      ...defaultComponentDefaults.hints,
      ...props.options.componentDefaults?.hints,
    },
  },
  quickformsDefaults: (props.options as any).quickformsDefaults || {},
  hintRenderer: props.options.hintRenderer,
});

provideFormContext(formContext as any);

// Track form ready state for loading overlay
const isReady = ref(false);

// Emit ready event after initial render
onMounted(() => {
  nextTick(() => {
    isReady.value = true;
    emit("ready");
  });
});

// Flag to prevent circular updates
let isUpdatingFromModel = false;
let isUpdatingModel = false;

// Sync model changes to form values
watch(model, (newValue) => {
  if (isUpdatingModel) return;

  isUpdatingFromModel = true;

  if (isSingleField.value) {
    const targetValue =
      newValue &&
      typeof newValue === "object" &&
      Object.keys(newValue as Record<string, any>).length > 0
        ? (newValue as Record<string, any>)
        : props.options.useDefaults !== false
        ? (schemaUtils.getDefaultValue(props.schema) as Record<string, any>)
        : ({} as Record<string, any>);

    setFieldValue(SINGLE_FIELD_PATH, targetValue);
  } else {
    if (newValue) {
      setValues(newValue as Record<string, any>);
    }
  }

  nextTick(() => {
    isUpdatingFromModel = false;
  });
});

// Sync form value changes back to model
// Using immediate: true ensures default values from schema are synced to model on init
if (isSingleField.value) {
  watch(
    () => values[SINGLE_FIELD_PATH],
    (newValue) => {
      if (isUpdatingFromModel) return;

      isUpdatingModel = true;
      model.value = newValue as Record<string, any>;
      nextTick(() => {
        isUpdatingModel = false;
      });
    },
    { deep: true, immediate: true }
  );
} else {
  watch(
    values,
    (newValues) => {
      if (isUpdatingFromModel) return;

      isUpdatingModel = true;
      model.value = newValues as Record<string, any>;
      nextTick(() => {
        isUpdatingModel = false;
      });
    },
    { deep: true, immediate: true }
  );
}

// Emit validation state changes
watch(
  [errors, meta],
  ([currentErrors, currentMeta]) => {
    emit("validation", {
      valid: currentMeta.valid,
      errors: currentErrors as Record<string, string | undefined>,
    });
  },
  { immediate: true }
);

// Handle form submission
const onSubmit = handleSubmit((submittedValues) => {
  const logicalValues = isSingleField.value
    ? (submittedValues[SINGLE_FIELD_PATH] as Record<string, any>)
    : (submittedValues as Record<string, any>);

  // Validate against JSON Schema
  const validation = schemaUtils.validate(props.schema, logicalValues);

  if (validation.valid) {
    emit("submit", logicalValues);
  } else {
    console.error("Form validation failed:", validation.errors);
  }
});

/**
 * Get all top-level properties from schema, respecting x-field-order:
 * - If x-field-order is an array at schema root level, use that explicit order
 * - If x-field-order is a number on individual field schemas, sort numerically
 * - Fall back to alphabetical order by key
 */
const properties = computed(() => {
  if (props.schema.type !== "object" || !props.schema.properties) {
    return [];
  }

  // Check for explicit field order array at schema root level
  const fieldOrderArray = (props.schema as any)['x-field-order'] as string[] | undefined;
  if (fieldOrderArray && Array.isArray(fieldOrderArray) && fieldOrderArray.length > 0) {
    // Use explicit ordering from root-level x-field-order array
    return fieldOrderArray
      .filter(key => key in props.schema.properties!)
      .map((key) => ({
        key,
        schema: props.schema.properties![key],
        path: key,
      }));
  }

  // Otherwise, sort by numeric x-field-order on individual field schemas
  const entries = Object.entries(props.schema.properties);
  entries.sort(([keyA, schemaA], [keyB, schemaB]) => {
    const orderA = (schemaA as any)?.['x-field-order'] ?? 999;
    const orderB = (schemaB as any)?.['x-field-order'] ?? 999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Fall back to alphabetical by key
    return keyA.localeCompare(keyB);
  });

  return entries.map(([key, schema]) => ({
    key,
    schema,
    path: key,
  }));
});

// Compute field gap - convert Quasar sizes to CSS values
const fieldGapStyle = computed(() => {
  const gap = props.options.componentDefaults?.layout?.fieldGap ?? '1rem';
  
  // Map Quasar size names to CSS values
  const sizeMap: Record<string, string> = {
    'xs': '4px',
    'sm': '8px',
    'md': '16px',
    'lg': '24px',
    'xl': '32px',
  };
  
  return sizeMap[gap] ?? gap;
});
</script>

<template>
  <form class="quickform" :style="{ '--quickform-field-margin-bottom': fieldGapStyle }" @submit="onSubmit">
    <!-- Loading overlay (shown until form is ready) -->
    <div
      v-if="showLoadingOverlay && !isReady"
      class="quickform-loading-overlay"
    >
      <slot name="loading">
        <div class="quickform-loading-default">
          <div class="quickform-spinner"></div>
        </div>
      </slot>
    </div>

    <!-- Form content (always rendered, but hidden until ready if overlay is enabled) -->
    <div
      class="quickform-content"
      :class="{ 'quickform-content-hidden': showLoadingOverlay && !isReady }"
    >
      <!-- Single field schema (e.g., JSON editor, single object field) -->
      <FieldRenderer
        v-if="isSingleField"
        :schema="schema"
        :path="SINGLE_FIELD_PATH"
        :disabled="options.disabled"
        :readonly="options.readonly"
      />
      <!-- Multiple fields (normal form) -->
      <FieldRenderer
        v-else
        v-for="field in properties"
        :key="field.key"
        :schema="field.schema"
        :path="field.path"
        :disabled="options.disabled"
        :readonly="options.readonly"
      />
    </div>
  </form>
</template>

<style scoped>
@import "../styles/variables.css";

.quickform {
  max-width: 100%;
  position: relative;
}

.quickform-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--quickform-input-bg, #ffffff);
  z-index: 10;
  transition: opacity 0.15s ease;
}

.quickform-loading-default {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.quickform-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--quickform-color-border, #e5e7eb);
  border-top-color: var(--quickform-color-primary, #3b82f6);
  border-radius: 50%;
  animation: quickform-spin 0.8s linear infinite;
}

@keyframes quickform-spin {
  to {
    transform: rotate(360deg);
  }
}

.quickform-content {
  transition: opacity 0.2s ease;
}

.quickform-content-hidden {
  opacity: 0;
  pointer-events: none;
}
</style>
