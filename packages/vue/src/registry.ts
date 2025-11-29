import type { Component } from 'vue';
import { ComponentRegistry, isStringType, isNumberType, isBooleanType, isEnumType, isDateFormat, isObjectType, isArrayType, isRecordType, isJsonType, hasOneOf, hasAnyOf, hasAllOf, hasConst, hasXRender, rankWith } from '@quickflo/quickforms';
import StringField from './components/StringField.vue';
import NumberField from './components/NumberField.vue';
import BooleanField from './components/BooleanField.vue';
import EnumField from './components/EnumField.vue';
import DateField from './components/DateField.vue';
import ObjectField from './components/ObjectField.vue';
import ArrayField from './components/ArrayField.vue';
import KeyValueField from './components/KeyValueField.vue';
import JsonField from './components/JsonField.vue';
import OneOfField from './components/OneOfField.vue';
import AllOfField from './components/AllOfField.vue';
import HiddenField from './components/HiddenField.vue';

/**
 * Create a default component registry with all built-in field components
 * 
 * Users can call this function, add their own components, and pass the
 * registry to DynamicForm via the options prop.
 * 
 * @example
 * ```typescript
 * import { createDefaultRegistry, rankWith } from '@quickforms/vue';
 * import { isStringType } from '@quickflo/quickforms';
 * import CustomPhoneInput from './CustomPhoneInput.vue';
 * 
 * const registry = createDefaultRegistry();
 * 
 * // Register custom component with higher priority
 * registry.register('phone', CustomPhoneInput, (schema) =>
 *   rankWith(10, isStringType(schema) && schema.format === 'phone')
 * );
 * 
 * // Use in form
 * <DynamicForm :schema="schema" v-model="data" :options="{ registry }" />
 * ```
 */
export function createDefaultRegistry(): ComponentRegistry<Component> {
  const registry = new ComponentRegistry<Component>();

  // Register hidden field for const values (highest priority: 100)
  // This should be checked before any other field type
  registry.register('hidden', HiddenField, (schema) =>
    rankWith(100, hasConst(schema))
  );

  // === EXPLICIT x-render OVERRIDES (priority: 50) ===
  // These allow explicit control over which component renders a field
  // Priority 50 is higher than normal type detection but lower than const fields
  
  registry.register('string-override', StringField, (schema) =>
    rankWith(50, hasXRender('string')(schema))
  );

  registry.register('number-override', NumberField, (schema) =>
    rankWith(50, hasXRender('number')(schema))
  );

  registry.register('boolean-override', BooleanField, (schema) =>
    rankWith(50, hasXRender('boolean')(schema))
  );

  registry.register('enum-override', EnumField, (schema) =>
    rankWith(50, hasXRender('enum')(schema))
  );

  registry.register('date-override', DateField, (schema) =>
    rankWith(50, hasXRender('date')(schema))
  );

  registry.register('object-override', ObjectField, (schema) =>
    rankWith(50, hasXRender('object')(schema))
  );

  registry.register('array-override', ArrayField, (schema) =>
    rankWith(50, hasXRender('array')(schema))
  );

  registry.register('keyvalue-override', KeyValueField, (schema) =>
    rankWith(50, hasXRender('keyvalue')(schema))
  );

  registry.register('json-override', JsonField, (schema) =>
    rankWith(50, hasXRender('json')(schema) || hasXRender('jsoneditor')(schema))
  );

  // === NORMAL TYPE DETECTION (lower priorities) ===

  // Register string field (base priority: 1)
  registry.register('string', StringField, (schema) =>
    rankWith(1, isStringType(schema))
  );

  // Register number field (base priority: 1)
  registry.register('number', NumberField, (schema) =>
    rankWith(1, isNumberType(schema))
  );

  // Register boolean field (base priority: 1)
  registry.register('boolean', BooleanField, (schema) =>
    rankWith(1, isBooleanType(schema))
  );

  // Register enum field (priority: 2, higher than string since enums are strings)
  registry.register('enum', EnumField, (schema) =>
    rankWith(2, isEnumType(schema))
  );

  // Register date field (priority: 2, higher than string since dates use string format)
  registry.register('date', DateField, (schema) =>
    rankWith(2, isDateFormat(schema))
  );

  // Register key-value field (priority: 6, for record types with typed additionalProperties)
  registry.register('keyvalue', KeyValueField, (schema) =>
    rankWith(6, isRecordType(schema))
  );

  // Register JSON field (priority: 5, for freeform objects)
  registry.register('json', JsonField, (schema) =>
    rankWith(5, isJsonType(schema))
  );

  // Register object field (priority: 1)
  registry.register('object', ObjectField, (schema) =>
    rankWith(1, isObjectType(schema))
  );

  // Register array field (priority: 1)
  registry.register('array', ArrayField, (schema) =>
    rankWith(1, isArrayType(schema))
  );

  // Register oneOf field (priority: 10)
  registry.register('oneOf', OneOfField, (schema) =>
    rankWith(10, hasOneOf(schema))
  );

  // Register anyOf field (priority: 10) - reusing OneOfField for now
  registry.register('anyOf', OneOfField, (schema) =>
    rankWith(10, hasAnyOf(schema))
  );

  // Register allOf field (priority: 10)
  registry.register('allOf', AllOfField, (schema) =>
    rankWith(10, hasAllOf(schema))
  );

  return registry;
}
