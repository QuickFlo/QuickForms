<script setup lang="ts">
import { computed, watch, reactive, markRaw } from "vue";
import { useForm } from "vee-validate";
import { SchemaUtils } from "@quickforms/core";
import type { JSONSchema } from "@quickforms/core";
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
  validation: [result: { valid: boolean; errors: Record<string, string> }];
}>();

const schemaUtils = new SchemaUtils();

// Use provided registry or create default
const registry = props.options.registry || createDefaultRegistry();

// Initialize form with VeeValidate
const { handleSubmit, values, setValues, errors, meta } = useForm({
  initialValues: props.options.useDefaults !== false
    ? { ...schemaUtils.getDefaultValue(props.schema), ...props.modelValue }
    : props.modelValue,
});

// Provide form context to children
// Use reactive to ensure updates propagate
const formContext = reactive({
  readonly: computed(() => props.options.readonly || false),
  disabled: computed(() => props.options.disabled || false),
  schema: props.schema, // Schema usually doesn't change, but if it does, we might need computed
  rootPath: "",
  registry: markRaw(registry), // markRaw prevents Vue from making components reactive
  context: computed(() => props.options.context || {}),
  validationMode: props.options.validationMode || 'ValidateAndShow',
  errorMessages: props.options.errorMessages
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
      errors: currentErrors
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
    <FieldRenderer
      v-for="field in properties"
      :key="field.key"
      :schema="field.schema"
      :path="field.path"
      :disabled="options.disabled"
      :readonly="options.readonly"
    />

    <div class="quickform-actions">
      <slot name="actions" :is-valid="meta.valid" :errors="errors">
        <button
          type="submit"
          class="quickform-submit"
          :disabled="options.disabled || !meta.valid"
        >
          Submit
        </button>
      </slot>
    </div>
  </form>
</template>

<style scoped>
@import '../styles/variables.css';

.quickform {
  max-width: 100%;
}

.quickform-actions {
  margin-top: var(--quickform-spacing-xl);
  display: flex;
  gap: var(--quickform-spacing-md);
}

.quickform-submit {
  padding: var(--quickform-submit-padding-y) var(--quickform-submit-padding-x);
  background-color: var(--quickform-submit-bg);
  color: var(--quickform-submit-color);
  border: none;
  border-radius: var(--quickform-submit-border-radius);
  font-size: var(--quickform-font-size-base);
  font-weight: var(--quickform-submit-font-weight);
  font-family: var(--quickform-font-family);
  cursor: pointer;
  transition: background-color var(--quickform-transition-base) var(--quickform-transition-timing),
              transform var(--quickform-transition-fast) var(--quickform-transition-timing);
}

.quickform-submit:hover:not(:disabled) {
  background-color: var(--quickform-submit-bg-hover);
}

.quickform-submit:disabled {
  background-color: var(--quickform-color-text-secondary);
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
