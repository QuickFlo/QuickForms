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

// Initialize form with VeeValidate
const { handleSubmit, values, setValues, errors, meta } = useForm({
  initialValues:
    props.options.useDefaults !== false
      ? { ...schemaUtils.getDefaultValue(props.schema), ...props.modelValue }
      : { ...props.modelValue },
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
  formValues: () => toRaw(values),
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

// Watch for external model value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && JSON.stringify(newValue) !== JSON.stringify(values)) {
      setValues(newValue);
    }
  },
  { deep: true }
);

// Watch for internal form changes
watch(
  values,
  (newValues) => {
    emit("update:modelValue", newValues);
  },
  { deep: true }
);

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
  // Validate against JSON Schema
  const validation = schemaUtils.validate(props.schema, submittedValues);

  if (validation.valid) {
    emit("submit", submittedValues);
  } else {
    console.error("Form validation failed:", validation.errors);
  }
});

// Check if schema is a single field (not a form with multiple properties)
const isSingleField = computed(() => {
  return props.schema.type === "object" && !props.schema.properties;
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
      path=""
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
