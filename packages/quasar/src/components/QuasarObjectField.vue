<script setup lang="ts">
import { computed } from "vue";
import { QExpansionItem } from "quasar";
import { FieldRenderer } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";

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
  label,
  hint,
  errorMessage,
  required,
  fieldId,
  fieldGap,
  formContext,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'expansion',
});

// Determine default expanded state
const defaultOpened = computed(() => {
  // 1. Check x-default-expanded schema override first
  const xDefaultExpanded = (props.schema as any)["x-default-expanded"];
  if (xDefaultExpanded !== undefined) {
    return xDefaultExpanded;
  }

  // 2. Check quickformsDefaults.object.defaultExpanded
  const objectDefaults = formContext?.quickformsDefaults?.object;
  const defaultExpandedMode =
    objectDefaults?.defaultExpanded ?? "required-only";

  if (defaultExpandedMode === "all") {
    return true;
  }
  if (defaultExpandedMode === "none") {
    return false;
  }
  // 'required-only': expand required fields, collapse optional
  return required.value;
});

// Show "(optional)" indicator
const showOptionalIndicator = computed(() => {
  const objectDefaults = formContext?.quickformsDefaults?.object;
  return objectDefaults?.showOptionalIndicator ?? true;
});

// Section border style
const sectionStyle = computed(() => {
  // Schema-level override first
  const xSectionStyle = (props.schema as any)["x-section-style"];
  if (xSectionStyle) {
    return xSectionStyle;
  }
  const objectDefaults = formContext?.quickformsDefaults?.object;
  return objectDefaults?.sectionStyle ?? 'solid';
});

// Computed class for section style
const sectionStyleClass = computed(() => {
  return `quickform-section-${sectionStyle.value}`;
});

const quasarProps = computed(() => {
  const xQuasarProps = (props.schema as any)["x-quasar-props"] || {};
  const xComponentProps = (props.schema as any)["x-component-props"] || {};
  return { ...xComponentProps, ...xQuasarProps };
});

/**
 * Sort properties by x-field-order:
 * - If x-field-order is an array at schema root level, use that explicit order
 * - If x-field-order is a number on individual field schemas, sort numerically
 * - Fall back to alphabetical order by key
 */
const properties = computed(() => {
  if (!props.schema.properties) return [];

  // Check for explicit field order array at schema root level
  const fieldOrderArray = (props.schema as any)['x-field-order'] as string[] | undefined;
  if (fieldOrderArray && Array.isArray(fieldOrderArray) && fieldOrderArray.length > 0) {
    // Use explicit ordering from root-level x-field-order array
    return fieldOrderArray
      .filter(key => key in props.schema.properties!)
      .map((key) => ({
        key,
        schema: props.schema.properties![key],
        path: props.path ? `${props.path}.${key}` : key,
      }));
  }

  // Otherwise, sort by numeric x-field-order on individual field schemas
  // Preserve original index for stable sorting when x-field-order values are equal
  const entries = Object.entries(props.schema.properties).map(
    ([key, schema], index) => ({ key, schema, originalIndex: index })
  );
  entries.sort((a, b) => {
    const orderA = (a.schema as any)?.['x-field-order'] ?? 999;
    const orderB = (b.schema as any)?.['x-field-order'] ?? 999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Fall back to original declaration order (stable sort)
    return a.originalIndex - b.originalIndex;
  });

  return entries.map(({ key, schema }) => ({
    key,
    schema,
    path: props.path ? `${props.path}.${key}` : key,
  }));
});

</script>

<template>
  <div :style="{ marginBottom: fieldGap }" class="quickform-object-field" :class="sectionStyleClass">
    <QExpansionItem
      :id="fieldId"
      :label="label"
      :caption="hint"
      :default-opened="defaultOpened"
      header-class="quickform-object-header"
      expand-icon-class="text-grey-7"
      v-bind="quasarProps"
    >
      <template #header>
        <div class="quickform-object-header-content">
          <div class="quickform-object-header-label">
            <template v-if="!hideLabel">
              {{ label }}
              <span v-if="required" class="quickform-required-indicator">*</span>
              <span v-if="!required && showOptionalIndicator" class="quickform-optional-indicator">
                (optional)
              </span>
            </template>
          </div>
          <!-- Slot for additional header actions (e.g., template toggle buttons) -->
          <slot name="header-actions"></slot>
        </div>
      </template>

      <div class="quickform-object-content">
        <FieldRenderer
          v-for="prop in properties"
          :key="prop.key"
          :schema="prop.schema"
          :path="prop.path"
          :disabled="disabled"
          :readonly="readonly"
        />

        <div v-if="errorMessage" class="quickform-error-message">
          {{ errorMessage }}
        </div>
      </div>
    </QExpansionItem>
  </div>
</template>

<style scoped>
.quickform-object-field {
  border-radius: 4px;
  overflow: hidden;
}

.quickform-object-field :deep(.quickform-object-header) {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
}

/* Section style: solid (default) */
.quickform-object-field.quickform-section-solid :deep(.q-expansion-item__content) {
  border-left: 3px solid #e0e0e0;
  margin-left: 8px;
}

/* Section style: dashed */
.quickform-object-field.quickform-section-dashed :deep(.q-expansion-item__content) {
  border-left: 2px dashed #ccc;
  margin-left: 8px;
}

/* Section style: none */
.quickform-object-field.quickform-section-none :deep(.q-expansion-item__content) {
  border-left: none;
  margin-left: 0;
}

.quickform-object-header-content {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.quickform-object-header-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.quickform-required-indicator {
  color: #c10015;
  margin-left: 0.25rem;
}

.quickform-optional-indicator {
  color: #888;
  font-size: 0.75rem;
  font-weight: 400;
  margin-left: 0.5rem;
}

.quickform-object-content {
  padding: 1rem;
  padding-left: 1.25rem;
}

.quickform-error-message {
  color: #c10015;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
