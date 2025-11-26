<script setup lang="ts">
import { computed, watch, reactive, markRaw, toRaw } from "vue";
import { useForm } from "vee-validate";
import { SchemaUtils } from "@quickflo/quickforms";
import type { JSONSchema } from "@quickflo/quickforms";
import { provideFormContext } from "../composables/useFormContext.js";
import type { FormOptions } from "../types/index.js";
import { createDefaultRegistry } from "../registry.js";
import FieldRenderer from "./FieldRenderer.vue";

interface Props {
  schema: JSONSchema;
  modelValue?: Record<string, any>;
  options?: FormOptions;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  options: () => ({}),
});

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, any>];
  submit: [value: Record<string, any>];
  validation: [
    result: { valid: boolean; errors: Record<string, string | undefined> }
  ];
}>();

const schemaUtils = new SchemaUtils();

// Use provided registry or create default
const registry = props.options.registry || createDefaultRegistry();

// Single-field support: use a synthetic root path to avoid empty field names
const SINGLE_FIELD_PATH = "__root__";

// Determine if this schema represents a single logical field
const isSingleField = computed(() => {
  return props.schema.type === "object" && !props.schema.properties;
});

// Compute initial values for the form
const initialValues = isSingleField.value
  ? {
      [SINGLE_FIELD_PATH]:
        props.modelValue &&
        typeof props.modelValue === "object" &&
        Object.keys(props.modelValue).length > 0
          ? props.modelValue
          : props.options.useDefaults !== false
          ? schemaUtils.getDefaultValue(props.schema)
          : {},
    }
  : props.options.useDefaults !== false
  ? { ...schemaUtils.getDefaultValue(props.schema), ...props.modelValue }
  : { ...props.modelValue };

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

// Watch for external model value changes (parent updating v-model)
watch(
  () => props.modelValue,
  (newValue) => {
    if (isSingleField.value) {
      const targetValue =
        newValue &&
        typeof newValue === "object" &&
        Object.keys(newValue as Record<string, any>).length > 0
          ? (newValue as Record<string, any>)
          : props.options.useDefaults !== false
            ? (schemaUtils.getDefaultValue(props.schema) as Record<string, any>)
            : ({} as Record<string, any>);

      // Only update if actually different to prevent loops
      const currentValue = values[SINGLE_FIELD_PATH];
      if (JSON.stringify(currentValue) !== JSON.stringify(targetValue)) {
        setFieldValue(SINGLE_FIELD_PATH, targetValue);
      }
    } else {
      if (newValue && JSON.stringify(newValue) !== JSON.stringify(values)) {
        setValues(newValue as Record<string, any>);
      }
    }
  },
  { deep: true }
);

// Watch for internal form value changes (user editing form fields)
if (isSingleField.value) {
  watch(
    () => values[SINGLE_FIELD_PATH],
    (newValue) => {
      // Only emit if different from current modelValue to prevent loops
      if (JSON.stringify(newValue) !== JSON.stringify(props.modelValue)) {
        emit("update:modelValue", newValue as Record<string, any>);
      }
    },
    { deep: true }
  );
} else {
  watch(
    values,
    (newValues) => {
      // Only emit if different from current modelValue to prevent loops
      if (JSON.stringify(newValues) !== JSON.stringify(props.modelValue)) {
        emit("update:modelValue", newValues as Record<string, any>);
      }
    },
    { deep: true }
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
  { deep: true, immediate: true }
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

// Get all top-level properties from schema
const properties = computed(() => {
  if (props.schema.type !== "object" || !props.schema.properties) {
    return [];
  }

  return Object.entries(props.schema.properties).map(([key, fieldSchema]) => ({
    key,
    schema: fieldSchema,
    path: key,
  }));
});
</script>

<template>
  <form class="quickform" @submit="onSubmit">
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
  </form>
</template>

<style scoped>
@import "../styles/variables.css";

.quickform {
  max-width: 100%;
}
</style>
