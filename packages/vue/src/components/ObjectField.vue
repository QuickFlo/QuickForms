<script setup lang="ts">
import { computed } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import FieldRenderer from './FieldRenderer.vue';
import type { FieldProps } from '../types/index.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { label, hint, errorMessage, tooltip } = useFormField(props.path, props.schema, { label: props.label });
const fieldId = generateFieldId(props.path);

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
        path: props.path ? `${props.path}.${key}` : key
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
    path: props.path ? `${props.path}.${key}` : key
  }));
});
</script>

<template>
  <div class="quickform-field quickform-object-field">
    <fieldset :id="fieldId" class="quickform-fieldset" :aria-describedby="hint ? `${fieldId}-hint` : undefined">
      <legend v-if="label" class="quickform-legend">
        {{ label }}
        <span v-if="props.schema.required" class="quickform-required">*</span>
        <span v-if="tooltip" class="quickform-tooltip-wrapper">
          <svg class="quickform-tooltip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
          </svg>
          <span class="quickform-tooltip-content" v-html="tooltip"></span>
        </span>
      </legend>
      
      <div v-if="hint" :id="`${fieldId}-hint`" class="quickform-hint quickform-object-hint">
        <span v-html="hint"></span>
      </div>

      <div class="quickform-object-content">
        <FieldRenderer
          v-for="prop in properties"
          :key="prop.key"
          :schema="prop.schema"
          :path="prop.path"
          :disabled="disabled"
          :readonly="readonly"
        />
        
      </div>

      <div v-if="errorMessage" class="quickform-error">
        {{ errorMessage }}
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.quickform-field {
  margin-bottom: var(--quickform-field-margin-bottom, 1rem);
}

.quickform-fieldset {
  border: 1px solid var(--quickform-color-border);
  border-radius: var(--quickform-radius-md);
  padding: var(--quickform-spacing-lg);
  margin: 0;
  background-color: var(--quickform-object-bg, transparent);
}

.quickform-legend {
  font-weight: var(--quickform-label-font-weight);
  font-size: var(--quickform-label-font-size);
  color: var(--quickform-label-color);
  padding: 0 var(--quickform-spacing-sm);
}

.quickform-object-content {
  display: flex;
  flex-direction: column;
  gap: var(--quickform-spacing-md);
  margin-top: var(--quickform-spacing-md);
}

.quickform-object-hint {
  margin-bottom: var(--quickform-spacing-md);
  margin-top: 0;
}

.quickform-required {
  color: var(--quickform-required-color);
  margin-left: var(--quickform-required-margin-left);
}

.quickform-tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: var(--quickform-spacing-sm);
  vertical-align: middle;
}

.quickform-tooltip-icon {
  width: var(--quickform-tooltip-icon-size, 1rem);
  height: var(--quickform-tooltip-icon-size, 1rem);
  color: var(--quickform-tooltip-icon-color, #6b7280);
  cursor: help;
  flex-shrink: 0;
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.quickform-tooltip-wrapper:hover .quickform-tooltip-icon {
  color: var(--quickform-tooltip-icon-hover-color, #3b82f6);
}

.quickform-tooltip-content {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--quickform-tooltip-bg, #1f2937);
  color: var(--quickform-tooltip-color, #ffffff);
  font-size: var(--quickform-tooltip-font-size, 0.875rem);
  font-weight: var(--quickform-font-weight-normal, 400);
  padding: var(--quickform-tooltip-padding, 0.5rem 0.75rem);
  border-radius: var(--quickform-tooltip-radius, 0.375rem);
  max-width: var(--quickform-tooltip-max-width, 300px);
  width: max-content;
  z-index: 1000;
  line-height: 1.4;
  box-shadow: var(--quickform-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  pointer-events: none;
}

.quickform-tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--quickform-tooltip-bg, #1f2937);
}

.quickform-tooltip-wrapper:hover .quickform-tooltip-content {
  display: block;
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
