<script setup lang="ts">
import { computed, watch, reactive, markRaw, toRaw, ref, nextTick, onMounted } from "vue";
import { useForm } from "vee-validate";
import { SchemaUtils } from "@quickflo/quickforms";
import type { JSONSchema } from "@quickflo/quickforms";
import { provideFormContext } from "../composables/useFormContext.js";
import type { FormOptions } from "../types/index.js";
import { createDefaultRegistry } from "../registry.js";
import FieldRenderer from "./FieldRenderer.vue";

interface Props {
  schema: JSONSchema;
  options?: FormOptions;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({}),
});

const model = defineModel<Record<string, any>>({ default: () => ({}) });

const emit = defineEmits<{
  submit: [value: Record<string, any>];
  validation: [
    result: { valid: boolean; errors: Record<string, string | undefined> }
  ];
  ready: [];
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

// Track form ready state
const isReady = ref(false);
const formContentRef = ref<HTMLDivElement | null>(null);

// Mark form as ready after fields are actually rendered
function checkIfReady() {
  // Use requestAnimationFrame to wait for DOM updates
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Check if form content has children (fields have rendered)
      if (formContentRef.value) {
        const hasFields = formContentRef.value.children.length > 0;
        if (hasFields) {
          isReady.value = true;
          emit("ready");
        } else {
          // Retry if no fields yet
          setTimeout(checkIfReady, 10);
        }
      } else {
        // Form content ref not available yet, retry
        setTimeout(checkIfReady, 10);
      }
    });
  });
}

// Mark form as ready after initial render
onMounted(() => {
  checkIfReady();
});

// Reset ready state when schema changes
watch(
  () => props.schema,
  () => {
    isReady.value = false;
    nextTick(() => {
      checkIfReady();
    });
  }
);

// Flag to prevent circular updates
let isUpdatingFromModel = false;
let isUpdatingModel = false;

// Sync model changes to form values
watch(
  model,
  (newValue) => {
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
  }
);

// Sync form value changes back to model
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
    { deep: true }
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
    <!-- Loading state (shown until form is ready) -->
    <div v-if="!isReady" class="quickform-loading">
      <slot name="loading">
        <div class="quickform-loading-default">
          <div class="quickform-spinner"></div>
        </div>
      </slot>
    </div>

    <!-- Form content (shown when ready) -->
    <div ref="formContentRef" v-show="isReady" class="quickform-content">
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
}

.quickform-loading {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  /* Container for form fields */
}
</style>
