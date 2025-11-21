<script setup lang="ts">
import { computed } from "vue";
import { useFormField } from "../composables/useFormField.js";
import { generateFieldId } from "../composables/utils.js";
import { SchemaUtils } from "@quickforms/core";
import FieldRenderer from "./FieldRenderer.vue";
import type { FieldProps } from "../types/index.js";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

// Use any[] type for value to allow array operations
const { value, errorMessage, label, hint } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);
const fieldId = generateFieldId(props.path);
const schemaUtils = new SchemaUtils();

// Ensure value is an array
const arrayValue = computed({
  get: () => (Array.isArray(value.value) ? value.value : []),
  set: (val) => (value.value = val),
});

const itemsSchema = computed(() => {
  if (Array.isArray(props.schema.items)) {
    // Tuple validation not fully supported in this simple view yet
    return props.schema.items[0];
  }
  return props.schema.items;
});

const addItem = () => {
  if (!itemsSchema.value) return;

  const defaultValue = schemaUtils.getDefaultValue(itemsSchema.value);
  value.value = [...arrayValue.value, defaultValue];
};

const removeItem = (index: number) => {
  const newValue = [...arrayValue.value];
  newValue.splice(index, 1);
  value.value = newValue;
};

const moveItem = (index: number, direction: "up" | "down") => {
  if (direction === "up" && index === 0) return;
  if (direction === "down" && index === arrayValue.value.length - 1) return;

  const newValue = [...arrayValue.value];
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const temp = newValue[index];
  newValue[index] = newValue[targetIndex];
  newValue[targetIndex] = temp;
  value.value = newValue;
};

const canAdd = computed(() => {
  if (props.disabled || props.readonly) return false;
  if (props.schema.maxItems && arrayValue.value.length >= props.schema.maxItems)
    return false;
  return true;
});

const canRemove = computed(() => {
  if (props.disabled || props.readonly) return false;
  if (props.schema.minItems && arrayValue.value.length <= props.schema.minItems)
    return false;
  return true;
});
const getItemLabel = (index: number) => {
  const itemLabelPattern = (props.schema as any)["x-item-label"];

  // Explicitly disabled label
  if (itemLabelPattern === "none" || itemLabelPattern === false) {
    return "";
  }

  // Content-based dynamic label (simple handlebar-style replacement)
  if (typeof itemLabelPattern === "string" && itemLabelPattern.includes("{{")) {
    const itemValue = arrayValue.value[index];
    if (typeof itemValue === "object" && itemValue !== null) {
      let label = itemLabelPattern;
      let hasReplacement = false;

      // Replace {{key}} with value
      label = label.replace(/\{\{([^}]+)\}\}/g, (_: string, key: string) => {
        const val = itemValue[key.trim()];
        if (val !== undefined && val !== null && val !== "") {
          hasReplacement = true;
          return String(val);
        }
        return ""; // Empty string if value missing
      });

      // Clean up potential empty separators (e.g. " - ")
      label = label.replace(/^\s*-\s*/, "").replace(/\s*-\s*$/, "");

      if (hasReplacement && label.trim()) {
        return label.trim();
      }
    }
  }

  // Default fallback: Title #Index
  const title = itemsSchema.value?.title || "Item";
  return `${title} #${index + 1}`;
};
</script>

<template>
  <div class="quickform-field quickform-array-field">
    <fieldset
      :id="fieldId"
      class="quickform-fieldset"
      :aria-describedby="hint ? `${fieldId}-hint` : undefined"
    >
      <legend v-if="label" class="quickform-legend">
        {{ label }}
        <span v-if="props.schema.required" class="quickform-required">*</span>
      </legend>

      <div
        v-if="hint"
        :id="`${fieldId}-hint`"
        class="quickform-hint quickform-array-hint"
      >
        {{ hint }}
      </div>

      <div class="quickform-array-items">
        <div
          v-for="(item, index) in arrayValue"
          :key="index"
          class="quickform-array-item"
        >
          <div class="quickform-array-item-content">
            <FieldRenderer
              :schema="itemsSchema!"
              :path="`${path}[${index}]`"
              :label="getItemLabel(index)"
              :disabled="disabled"
              :readonly="readonly"
            />
          </div>

          <div class="quickform-array-item-actions">
            <button
              type="button"
              class="quickform-btn-icon"
              :disabled="index === 0 || disabled || readonly"
              @click="moveItem(index, 'up')"
              title="Move Up"
            >
              ↑
            </button>
            <button
              type="button"
              class="quickform-btn-icon"
              :disabled="
                index === arrayValue.length - 1 || disabled || readonly
              "
              @click="moveItem(index, 'down')"
              title="Move Down"
            >
              ↓
            </button>
            <button
              type="button"
              class="quickform-btn-icon quickform-btn-danger"
              :disabled="!canRemove"
              @click="removeItem(index)"
              title="Remove Item"
            >
              ×
            </button>
          </div>
        </div>

        <div v-if="arrayValue.length === 0" class="quickform-array-empty">
          No items
        </div>
      </div>

      <div class="quickform-array-footer">
        <button
          type="button"
          class="quickform-btn quickform-btn-secondary"
          :disabled="!canAdd"
          @click="addItem"
        >
          + Add Item
        </button>
      </div>

      <div v-if="errorMessage" class="quickform-error">
        {{ errorMessage }}
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.quickform-field {
  margin-bottom: 1rem;
}

.quickform-fieldset {
  border: 1px solid var(--quickform-color-border);
  border-radius: var(--quickform-radius-md);
  padding: var(--quickform-spacing-lg);
  margin: 0;
  background-color: var(--quickform-array-bg, transparent);
}

.quickform-legend {
  font-weight: var(--quickform-label-font-weight);
  font-size: var(--quickform-label-font-size);
  color: var(--quickform-label-color);
  padding: 0 var(--quickform-spacing-sm);
}

.quickform-array-hint {
  margin-bottom: var(--quickform-spacing-md);
  margin-top: 0;
}

.quickform-array-items {
  display: flex;
  flex-direction: column;
  gap: var(--quickform-spacing-md);
}

.quickform-array-item {
  display: flex;
  gap: var(--quickform-spacing-md);
  align-items: flex-start;
  padding: var(--quickform-spacing-md);
  background-color: var(--quickform-array-item-bg, rgba(0, 0, 0, 0.02));
  border: 1px solid var(--quickform-color-border);
  border-radius: var(--quickform-radius-sm);
}

.quickform-array-item-content {
  flex: 1;
}

.quickform-array-item-actions {
  display: flex;
  flex-direction: column;
  gap: var(--quickform-spacing-xs);
}

.quickform-array-empty {
  padding: var(--quickform-spacing-md);
  text-align: center;
  color: var(--quickform-color-text-secondary);
  font-style: italic;
  background-color: var(--quickform-array-item-bg, rgba(0, 0, 0, 0.02));
  border-radius: var(--quickform-radius-sm);
}

.quickform-array-footer {
  margin-top: var(--quickform-spacing-md);
}

.quickform-btn {
  padding: var(--quickform-spacing-sm) var(--quickform-spacing-md);
  border-radius: var(--quickform-radius-sm);
  border: 1px solid var(--quickform-color-border);
  background-color: white;
  cursor: pointer;
  font-size: var(--quickform-font-size-sm);
  transition: all 0.2s;
}

.quickform-btn:hover:not(:disabled) {
  background-color: var(--quickform-color-bg-hover);
  border-color: var(--quickform-color-border-focus);
}

.quickform-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quickform-btn-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--quickform-color-border);
  background-color: white;
  border-radius: var(--quickform-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.quickform-btn-icon:hover:not(:disabled) {
  border-color: var(--quickform-color-border-focus);
  color: var(--quickform-color-primary);
}

.quickform-btn-danger:hover:not(:disabled) {
  border-color: var(--quickform-color-error);
  color: var(--quickform-color-error);
  background-color: var(--quickform-color-error-bg);
}

.quickform-required {
  color: var(--quickform-required-color);
  margin-left: var(--quickform-required-margin-left);
}

.quickform-hint {
  font-size: var(--quickform-hint-font-size);
  color: var(--quickform-hint-color);
}

.quickform-error {
  margin-top: var(--quickform-spacing-sm);
  font-size: var(--quickform-error-font-size);
  color: var(--quickform-error-color);
}
</style>
