<script setup lang="ts">
import { computed } from "vue";
import { QCard, QCardSection, QBtn } from "quasar";
import { FieldRenderer } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";
import { schemaUtils } from "../schema-utils-singleton.js";

interface Props extends FieldProps {
  /** Hide the label (used when parent component already shows it) */
  hideLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  hideLabel: false,
});

const {
  value,
  label,
  hint,
  errorMessage,
  fieldId,
  quasarProps,
  fieldGap,
  formContext,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'card',
});

// Section border style - matches QuasarObjectField pattern
const sectionStyle = computed(() => {
  // Schema-level override first
  const xSectionStyle = (props.schema as any)["x-section-style"];
  if (xSectionStyle) {
    return xSectionStyle;
  }
  // Then check quickformsDefaults.array, then fall back to object defaults for consistency
  const arrayDefaults = formContext?.quickformsDefaults?.array;
  const objectDefaults = formContext?.quickformsDefaults?.object;
  return arrayDefaults?.sectionStyle ?? objectDefaults?.sectionStyle ?? 'card';
});

const sectionStyleClass = computed(() => {
  return `quickform-section-${sectionStyle.value}`;
});

// Merge QuickForms convenience features for button customization
// Respects quickformsDefaults.array from form options
const quickformsFeatures = computed(() => {
  const globalDefaults = formContext?.quickformsDefaults?.array || {};
  const schemaFeatures = (props.schema as any)["x-quickforms-quasar"] || {};

  // Position is custom (not a QBtn prop)
  const addButtonPosition =
    schemaFeatures.addButtonPosition ??
    globalDefaults.addButtonPosition ??
    "bottom-left";

  // Merge QBtn props: defaults -> global -> schema (schema has highest priority)
  const addButtonDefaults = {
    outline: true,
    color: "primary",
    icon: "add",
    label: formContext?.labels?.addItem || "Add item",
  };

  const removeButtonDefaults = {
    flat: true,
    round: true,
    dense: true,
    size: "sm",
    icon: "close",
    color: "negative",
  };

  const addButton = {
    ...addButtonDefaults,
    ...(globalDefaults.addButton || {}),
    ...(schemaFeatures.addButton || {}),
  };

  const removeButton = {
    ...removeButtonDefaults,
    ...(globalDefaults.removeButton || {}),
    ...(schemaFeatures.removeButton || {}),
  };

  return {
    addButtonPosition,
    addButton,
    removeButton,
  };
});

// Determine button positioning
const isTopPosition = computed(() => {
  const position = quickformsFeatures.value.addButtonPosition;
  return position === "top-left" || position === "top-right";
});

const isRightPosition = computed(() => {
  const position = quickformsFeatures.value.addButtonPosition;
  return position === "top-right" || position === "bottom-right";
});

// Ensure value is an array
const arrayValue = computed({
  get: () => (Array.isArray(value.value) ? value.value : []),
  set: (val) => (value.value = val),
});

const itemsSchema = computed(() => {
  if (Array.isArray(props.schema.items)) {
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

  if (itemLabelPattern === "none" || itemLabelPattern === false) {
    return "";
  }

  if (typeof itemLabelPattern === "string" && itemLabelPattern.includes("{{")) {
    const itemValue = arrayValue.value[index];
    if (typeof itemValue === "object" && itemValue !== null) {
      let label = itemLabelPattern;
      let hasReplacement = false;

      label = label.replace(/\{\{([^}]+)\}\}/g, (_: string, key: string) => {
        const val = itemValue[key.trim()];
        if (val !== undefined && val !== null && val !== "") {
          hasReplacement = true;
          return String(val);
        }
        return "";
      });

      label = label.replace(/^\s*-\s*/, "").replace(/\s*-\s*$/, "");

      if (hasReplacement && label.trim()) {
        return label.trim();
      }
    }
  }

  const title = itemsSchema.value?.title || "Item";
  return `${title} ${index + 1}`;
};

</script>

<template>
  <div :id="fieldId" :style="{ marginBottom: fieldGap }" class="quickform-array-field" :class="sectionStyleClass">
    <!-- Array header -->
    <div class="quickform-array-header">
      <div
        v-if="label && !hideLabel"
        class="quickform-array-label-row"
      >
        <div class="quickform-array-label">
          {{ label }}
          <span v-if="schema.required" class="quickform-required-indicator">*</span>
        </div>
        <div class="quickform-array-header-actions">
          <!-- Slot for additional header actions (e.g., template toggle buttons) -->
          <slot name="header-actions"></slot>
          <!-- Add button on same line only for top-right -->
          <QBtn
            v-if="isTopPosition && isRightPosition"
            v-bind="quickformsFeatures.addButton"
            :disable="!canAdd"
            @click="addItem"
          />
        </div>
      </div>

      <!-- Add button below label for top-left -->
      <div
        v-if="isTopPosition && !isRightPosition"
        style="text-align: left; margin-top: 0.5rem"
      >
        <QBtn
          v-bind="quickformsFeatures.addButton"
          :disable="!canAdd"
          @click="addItem"
        />
      </div>

      <div v-if="hint" class="quickform-array-hint" v-html="hint"></div>
    </div>

    <!-- Array content area -->
    <div class="quickform-array-content">
      <div class="quickform-array-items">
        <QCard
          v-for="(item, index) in arrayValue"
          :key="index"
          flat
          bordered
          v-bind="quasarProps"
        >
          <QCardSection class="row items-start">
            <div class="col">
              <FieldRenderer
                :schema="itemsSchema!"
                :path="`${path}[${index}]`"
                :label="getItemLabel(index)"
                :disabled="disabled"
                :readonly="readonly"
              />
            </div>
            <div class="col-auto q-ml-sm row q-gutter-xs items-center">
              <QBtn
                flat
                round
                dense
                size="sm"
                icon="arrow_upward"
                :disable="index === 0 || disabled || readonly"
                @click="moveItem(index, 'up')"
                title="Move Up"
              >
                <q-tooltip>Move Up</q-tooltip>
              </QBtn>
              <QBtn
                flat
                round
                dense
                size="sm"
                icon="arrow_downward"
                :disable="index === arrayValue.length - 1 || disabled || readonly"
                @click="moveItem(index, 'down')"
                title="Move Down"
              >
                <q-tooltip>Move Down</q-tooltip>
              </QBtn>
              <QBtn
                v-bind="quickformsFeatures.removeButton"
                :disable="!canRemove"
                @click="removeItem(index)"
                :title="formContext?.labels?.removeItem || 'Remove'"
              >
                <q-tooltip>{{
                  formContext?.labels?.removeItem || "Remove"
                }}</q-tooltip>
              </QBtn>
            </div>
          </QCardSection>
        </QCard>

        <div
          v-if="arrayValue.length === 0"
          class="quickform-array-empty"
        >
          No items
        </div>

        <!-- Add button (bottom position) -->
        <div
          v-if="!isTopPosition"
          :style="{ textAlign: isRightPosition ? 'right' : 'left' }"
        >
          <QBtn
            v-bind="quickformsFeatures.addButton"
            :disable="!canAdd"
            @click="addItem"
          />
        </div>

        <div v-if="errorMessage" class="quickform-array-error">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quickform-array-field {
  border-radius: 4px;
}

.quickform-array-header {
  margin-bottom: 0.5rem;
}

.quickform-array-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quickform-array-label {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.quickform-array-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quickform-required-indicator {
  color: #c10015;
  margin-left: 0.125rem;
}

.quickform-array-hint {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.quickform-array-content {
  /* Content area that gets the border styling */
}

.quickform-array-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quickform-array-empty {
  color: #999;
  font-style: italic;
}

.quickform-array-error {
  color: #c10015;
  font-size: 0.875rem;
}

/* Section style: solid (default) */
.quickform-array-field.quickform-section-solid .quickform-array-content {
  border-left: 3px solid #e0e0e0;
  padding-left: 1rem;
  margin-left: 0.25rem;
}

/* Section style: dashed */
.quickform-array-field.quickform-section-dashed .quickform-array-content {
  border-left: 2px dashed #ccc;
  padding-left: 1rem;
  margin-left: 0.25rem;
}

/* Section style: none */
.quickform-array-field.quickform-section-none .quickform-array-content {
  border-left: none;
  padding-left: 0;
  margin-left: 0;
}

/* Section style: card - full border around entire array */
.quickform-array-field.quickform-section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fafafa;
}

.quickform-array-field.quickform-section-card .quickform-array-header {
  margin-bottom: 0.75rem;
}

.quickform-array-field.quickform-section-card .quickform-array-content {
  border-left: none;
  padding-left: 0;
  margin-left: 0;
}
</style>
