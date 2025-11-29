import type { Component } from 'vue';
import {
  ComponentRegistry,
  isStringType,
  isNumberType,
  isBooleanType,
  isEnumType,
  isDateFormat,
  isTimeFormat,
  isDateTimeFormat,
  isObjectType,
  isArrayType,
  isRecordType,
  isJsonType,
  hasOneOf,
  hasAnyOf,
  hasAllOf,
  hasConst,
  hasXRender,
  rankWith,
} from '@quickflo/quickforms';
import QuasarStringField from './components/QuasarStringField.vue';
import QuasarNumberField from './components/QuasarNumberField.vue';
import QuasarBooleanField from './components/QuasarBooleanField.vue';
import QuasarEnumField from './components/QuasarEnumField.vue';
import QuasarDateField from './components/QuasarDateField.vue';
import QuasarTimeField from './components/QuasarTimeField.vue';
import QuasarDateTimeField from './components/QuasarDateTimeField.vue';
import QuasarObjectField from './components/QuasarObjectField.vue';
import QuasarArrayField from './components/QuasarArrayField.vue';
import QuasarKeyValueField from './components/QuasarKeyValueField.vue';
import QuasarJsonField from './components/QuasarJsonField.vue';
import QuasarMultiEnumField from './components/QuasarMultiEnumField.vue';
import QuasarOneOfField from './components/QuasarOneOfField.vue';
import QuasarAllOfField from './components/QuasarAllOfField.vue';
import { HiddenField } from '@quickflo/quickforms-vue';

/**
 * Create a Quasar component registry with all built-in Quasar field components
 * 
 * This provides a pre-configured registry with Quasar UI components (QInput, QSelect, etc.)
 * that can be used directly with DynamicForm. Users can extend this registry with custom
 * components or create their own from scratch.
 * 
 * @example
 * ```typescript
 * import { createQuasarRegistry } from '@quickflo/quickforms-quasar';
 * import { DynamicForm } from '@quickflo/quickforms-vue';
 * import { rankWith, isStringType } from '@quickflo/quickforms';
 * import CustomPhoneField from './CustomPhoneField.vue';
 * 
 * const registry = createQuasarRegistry();
 * 
 * // Register custom component with higher priority
 * registry.register('phone', CustomPhoneField, (schema) =>
 *   rankWith(10, isStringType(schema) && schema.format === 'phone')
 * );
 * 
 * // Use in form
 * <DynamicForm :schema="schema" v-model="data" :options="{ registry }" />
 * ```
 */
export function createQuasarRegistry(): ComponentRegistry<Component> {
  const registry = new ComponentRegistry<Component>();

  // Register hidden field for const values (highest priority: 100)
  registry.register('hidden', HiddenField, (schema) =>
    rankWith(100, hasConst(schema))
  );

  // === EXPLICIT x-render OVERRIDES (priority: 50) ===
  // These allow explicit control over which component renders a field
  // Priority 50 is higher than normal type detection but lower than const fields
  
  registry.register('string-override', QuasarStringField, (schema) =>
    rankWith(50, hasXRender('string')(schema))
  );

  registry.register('number-override', QuasarNumberField, (schema) =>
    rankWith(50, hasXRender('number')(schema))
  );

  registry.register('boolean-override', QuasarBooleanField, (schema) =>
    rankWith(50, hasXRender('boolean')(schema))
  );

  registry.register('enum-override', QuasarEnumField, (schema) =>
    rankWith(50, hasXRender('enum')(schema))
  );

  registry.register('date-override', QuasarDateField, (schema) =>
    rankWith(50, hasXRender('date')(schema))
  );

  registry.register('time-override', QuasarTimeField, (schema) =>
    rankWith(50, hasXRender('time')(schema))
  );

  registry.register('datetime-override', QuasarDateTimeField, (schema) =>
    rankWith(50, hasXRender('datetime')(schema))
  );

  registry.register('object-override', QuasarObjectField, (schema) =>
    rankWith(50, hasXRender('object')(schema))
  );

  registry.register('array-override', QuasarArrayField, (schema) =>
    rankWith(50, hasXRender('array')(schema))
  );

  registry.register('keyvalue-override', QuasarKeyValueField, (schema) =>
    rankWith(50, hasXRender('keyvalue')(schema))
  );

  registry.register('json-override', QuasarJsonField, (schema) =>
    rankWith(50, hasXRender('json')(schema) || hasXRender('jsoneditor')(schema))
  );

  // === NORMAL TYPE DETECTION (lower priorities) ===

  // Register string field (base priority: 1)
  registry.register('string', QuasarStringField, (schema) =>
    rankWith(1, isStringType(schema))
  );

  // Register number field (base priority: 1)
  registry.register('number', QuasarNumberField, (schema) =>
    rankWith(1, isNumberType(schema))
  );

  // Register boolean field (base priority: 1)
  registry.register('boolean', QuasarBooleanField, (schema) =>
    rankWith(1, isBooleanType(schema))
  );

  // Register enum field (priority: 2, higher than string since enums are strings)
  registry.register('enum', QuasarEnumField, (schema) =>
    rankWith(2, isEnumType(schema))
  );

  // Register date field (priority: 2, higher than string since dates use string format)
  registry.register('date', QuasarDateField, (schema) =>
    rankWith(2, isDateFormat(schema))
  );

  // Register time field (priority: 2, higher than string since times use string format)
  registry.register('time', QuasarTimeField, (schema) =>
    rankWith(2, isTimeFormat(schema))
  );

  // Register datetime field (priority: 3, higher than date/time since it's more specific)
  registry.register('datetime', QuasarDateTimeField, (schema) =>
    rankWith(3, isDateTimeFormat(schema))
  );

  // Register key-value field (priority: 6, for record types with typed additionalProperties)
  registry.register('keyvalue', QuasarKeyValueField, (schema) =>
    rankWith(6, isRecordType(schema))
  );

  // Register JSON field (priority: 5, for freeform objects)
  registry.register('json', QuasarJsonField, (schema) =>
    rankWith(5, isJsonType(schema))
  );

  // Register object field (priority: 1)
  registry.register('object', QuasarObjectField, (schema) =>
    rankWith(1, isObjectType(schema))
  );

  // Register multi-enum field (priority: 5, higher than array since it's more specific)
  // Detects array with enum items for multi-select dropdown
  registry.register('multiEnum', QuasarMultiEnumField, (schema) => {
    if (!isArrayType(schema)) return -1;
    const items = schema.items;
    if (!items || typeof items === 'boolean') return -1;
    const itemsSchema = Array.isArray(items) ? items[0] : items;
    if (!itemsSchema || typeof itemsSchema === 'boolean') return -1;
    // Check if items have enum property
    const hasEnum = 'enum' in itemsSchema && Array.isArray(itemsSchema.enum);
    return rankWith(5, hasEnum);
  });

  // Register array field (priority: 1, fallback for other arrays)
  registry.register('array', QuasarArrayField, (schema) =>
    rankWith(1, isArrayType(schema))
  );

  // Register oneOf field (priority: 10)
  registry.register('oneOf', QuasarOneOfField, (schema) =>
    rankWith(10, hasOneOf(schema))
  );

  // Register anyOf field (priority: 10) - reusing OneOfField for now
  registry.register('anyOf', QuasarOneOfField, (schema) =>
    rankWith(10, hasAnyOf(schema))
  );

  // Register allOf field (priority: 10)
  registry.register('allOf', QuasarAllOfField, (schema) =>
    rankWith(10, hasAllOf(schema))
  );

  return registry;
}
