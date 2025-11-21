// Import global styles
import './styles/variables.css';

// Registry
export { createDefaultRegistry } from './registry.js';

// Components
export { default as DynamicForm } from './components/DynamicForm.vue';
export { default as FieldRenderer } from './components/FieldRenderer.vue';
export { default as StringField } from './components/StringField.vue';
export { default as NumberField } from './components/NumberField.vue';
export { default as BooleanField } from './components/BooleanField.vue';
export { default as EnumField } from './components/EnumField.vue';
export { default as DateField } from './components/DateField.vue';

// Composables
export { useFormField } from './composables/useFormField.js';
export { useFormContext, provideFormContext } from './composables/useFormContext.js';
export * from './composables/utils.js';

// Types
export type { VueFieldComponent, FieldProps, FormOptions, FormContext } from './types/index.js';

// Re-export core types and utilities
export type { JSONSchema, UISchemaElement, TesterFunction } from '@quickforms/core';
export {
  ComponentRegistry,
  SchemaUtils,
  // Tester utilities
  rankWith,
  and,
  or,
  not,
  hasFormat,
  hasExtension,
  // Type testers
  isStringType,
  isNumberType,
  isIntegerType,
  isBooleanType,
  isEnumType,
  isObjectType,
  isArrayType,
  isNullType,
  // Format testers
  isEmailFormat,
  isDateFormat,
  isTimeFormat,
  isDateTimeFormat,
  isUrlFormat,
  // Composition testers
  hasOneOf,
  hasAnyOf,
  hasAllOf,
  isDiscriminatedUnion,
  hasConditional
} from '@quickforms/core';
