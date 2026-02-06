<script setup lang="ts">
import { computed, watch } from 'vue';
import type { JSONSchema, UISchemaElement } from '@quickflo/quickforms';
import { useFormContext } from '../composables/useFormContext.js';

interface Props {
  schema: JSONSchema;
  uischema?: UISchemaElement;
  path: string;
  disabled?: boolean;
  readonly?: boolean;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false
});

// Get registry from context
const context = useFormContext();
if (!context) {
  throw new Error('FieldRenderer must be used within a DynamicForm');
}

// Check if field has a const value or default that must be set even when hidden
// This ensures discriminator fields in oneOf/anyOf schemas get their values set
const hasConstOrDefault = computed(() => {
  return props.schema.const !== undefined || props.schema.default !== undefined;
});

/**
 * x-visible-when / x-readonly-when condition format:
 * {
 *   field: string;         // Path to the field to check (supports dot notation)
 *   operator: string;      // Comparison operator
 *   value: any;            // Value to compare against
 * }
 *
 * x-visible-when: Field is visible when condition is TRUE
 * x-readonly-when: Field is readonly when condition is TRUE
 *
 * Supported operators:
 * - 'eq' / '==' / '===' : equals
 * - 'neq' / '!=' / '!==' : not equals
 * - 'in' : value is in array
 * - 'notIn' / '!in' : value is not in array
 * - 'gt' / '>' : greater than
 * - 'gte' / '>=' : greater than or equal
 * - 'lt' / '<' : less than
 * - 'lte' / '<=' : less than or equal
 * - 'truthy' : value is truthy (no value needed)
 * - 'falsy' : value is falsy (no value needed)
 * - 'like' : case-sensitive pattern match (supports % wildcards)
 * - 'ilike' : case-insensitive pattern match (supports % wildcards)
 */
interface VisibleWhenCondition {
  field: string;
  operator: 'eq' | '==' | '===' | 'neq' | '!=' | '!==' | 'in' | 'notIn' | '!in' |
            'gt' | '>' | 'gte' | '>=' | 'lt' | '<' | 'lte' | '<=' | 'truthy' | 'falsy' |
            'like' | 'ilike';
  value?: any;
}

function evaluateCondition(condition: VisibleWhenCondition, fieldValue: any): boolean {
  const { operator, value } = condition;

  switch (operator) {
    case 'eq':
    case '==':
    case '===':
      return fieldValue === value;

    case 'neq':
    case '!=':
    case '!==':
      return fieldValue !== value;

    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);

    case 'notIn':
    case '!in':
      return Array.isArray(value) && !value.includes(fieldValue);

    case 'gt':
    case '>':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value;

    case 'gte':
    case '>=':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue >= value;

    case 'lt':
    case '<':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value;

    case 'lte':
    case '<=':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue <= value;

    case 'truthy':
      return !!fieldValue;

    case 'falsy':
      return !fieldValue;

    case 'like':
    case 'ilike': {
      if (typeof fieldValue !== 'string' || typeof value !== 'string') return false;
      // Convert SQL-like pattern to regex: % = .*, _ = .
      // Preserve [...] character classes, escape other regex special chars
      const escaped = value.replace(/[.*+?^${}()|\\]/g, '\\$&');
      const pattern = escaped.replace(/%/g, '.*').replace(/_/g, '.');
      const flags = operator === 'ilike' ? 'i' : '';
      const regex = new RegExp(`^${pattern}$`, flags);
      return regex.test(fieldValue);
    }

    default:
      console.warn(`Unknown x-visible-when operator: ${operator}`);
      return true;
  }
}

// Get reactive field value for x-visible-when condition
const visibleWhenConfig = computed(() => {
  const schema = props.schema as any;
  return schema['x-visible-when'] as VisibleWhenCondition | undefined;
});

// Reactively watch the dependent field value for visibility
const visibleWhenFieldValue = computed(() => {
  if (!visibleWhenConfig.value?.field) return undefined;
  return context.useFieldValue(visibleWhenConfig.value.field).value;
});

// Evaluate x-visible-when condition
const visibleWhenResult = computed(() => {
  const condition = visibleWhenConfig.value;
  if (!condition) return true; // No condition = always visible

  return evaluateCondition(condition, visibleWhenFieldValue.value);
});

// Check if field should clear its value when hidden
// Defaults to true for x-visible-when fields, but can be overridden with x-clear-on-hide: false
const shouldClearOnHide = computed(() => {
  const schema = props.schema as any;
  // If explicitly set, use that value
  if (schema['x-clear-on-hide'] !== undefined) {
    return schema['x-clear-on-hide'] === true;
  }
  // Default: clear on hide only if x-visible-when is configured
  return visibleWhenConfig.value !== undefined;
});

// Watch visibility changes and clear value when field becomes hidden
watch(visibleWhenResult, (isNowVisible, wasVisible) => {
  // Only clear when transitioning from visible to hidden
  if (wasVisible === true && isNowVisible === false && shouldClearOnHide.value) {
    // Clear the field value
    context.setFieldValue(props.path, undefined);
  }
});

// Get reactive field value for x-readonly-when condition
const readonlyWhenConfig = computed(() => {
  const schema = props.schema as any;
  return schema['x-readonly-when'] as VisibleWhenCondition | undefined;
});

// Reactively watch the dependent field value for readonly
const readonlyWhenFieldValue = computed(() => {
  if (!readonlyWhenConfig.value?.field) return undefined;
  return context.useFieldValue(readonlyWhenConfig.value.field).value;
});

// Evaluate x-readonly-when condition
const readonlyWhenResult = computed(() => {
  const condition = readonlyWhenConfig.value;
  if (!condition) return false; // No condition = not readonly from this source

  return evaluateCondition(condition, readonlyWhenFieldValue.value);
});

// Calculate visibility based on x-hidden, x-roles, and x-visible-when
const isVisible = computed(() => {
  const schema = props.schema as any;

  // x-hidden check - but still render hidden fields with const/default values
  // so they get registered with VeeValidate and their value is set
  if (schema['x-hidden'] === true) {
    // If it has a const or default value, we need to render it as a hidden field
    // Otherwise, truly hide it
    return hasConstOrDefault.value;
  }

  // x-visible-when check
  if (!visibleWhenResult.value) {
    return false;
  }

  // x-roles check
  if (schema['x-roles']) {
    const userRoles = context.context.roles || [];
    const roleConfig = schema['x-roles'];

    // If user has no roles but field requires roles, hide
    if (!Array.isArray(userRoles) || userRoles.length === 0) return false;

    // Check if any user role has 'view' permission
    const hasView = userRoles.some((role: string) =>
      roleConfig[role] && roleConfig[role].includes('view')
    );

    if (!hasView) return false;
  }

  return true;
});

// Calculate effective readonly state
const isFieldReadonly = computed(() => {
  // Explicit prop or form context overrides
  if (props.readonly || context.readonly) return true;

  const schema = props.schema as any;
  // x-readonly check
  if (schema['x-readonly'] === true) return true;

  // x-readonly-when check
  if (readonlyWhenResult.value) return true;

  // x-roles check
  if (schema['x-roles']) {
    const userRoles = context.context.roles || [];
    const roleConfig = schema['x-roles'];

    // Check if any user role has 'edit' permission
    const hasEdit = userRoles.some((role: string) =>
      roleConfig[role] && roleConfig[role].includes('edit')
    );

    if (!hasEdit) return true; // Readonly if no edit permission
  }

  return false;
});

// Get the appropriate component for this schema from registry
const component = computed(() => {
  if (!isVisible.value) return null;
  
  const comp = context.registry.getComponent(props.schema, props.uischema);
  if (!comp) {
    console.warn('No renderer found for schema:', props.schema);
    return null;
  }
  return comp;
});
</script>

<template>
  <!-- Only render if visible -->
  <template v-if="isVisible">
    <component
      :is="component"
      v-if="component"
      :schema="schema"
      :uischema="uischema"
      :path="path"
      :label="label"
      :disabled="disabled || context.disabled"
      :readonly="isFieldReadonly"
    />
    <div v-else class="quickform-no-renderer">
      <p>No renderer available for field: {{ path }}</p>
      <pre>{{ JSON.stringify(schema, null, 2) }}</pre>
    </div>
  </template>
</template>

<style scoped>
.quickform-no-renderer {
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  color: #991b1b;
}

.quickform-no-renderer pre {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 0.25rem;
  overflow-x: auto;
  font-size: 0.75rem;
}
</style>
