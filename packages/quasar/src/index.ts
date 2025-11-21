// Registry
export { createQuasarRegistry } from './registry.js';

// Quasar Components
export { default as QuasarStringField } from './components/QuasarStringField.vue';
export { default as QuasarNumberField } from './components/QuasarNumberField.vue';
export { default as QuasarBooleanField } from './components/QuasarBooleanField.vue';
export { default as QuasarEnumField } from './components/QuasarEnumField.vue';
export { default as QuasarDateField } from './components/QuasarDateField.vue';
export { default as QuasarTimeField } from './components/QuasarTimeField.vue';
export { default as QuasarDateTimeField } from './components/QuasarDateTimeField.vue';
export { default as QuasarObjectField } from './components/QuasarObjectField.vue';
export { default as QuasarArrayField } from './components/QuasarArrayField.vue';
export { default as QuasarMultiEnumField } from './components/QuasarMultiEnumField.vue';
export { default as QuasarOneOfField } from './components/QuasarOneOfField.vue';
export { default as QuasarAllOfField } from './components/QuasarAllOfField.vue';

// Quasar-specific types
export type { QuasarComponentDefaults, QuasarFormOptions } from './types.js';

// Re-export types from Vue package
export type {
  FieldProps,
  FormOptions,
  FormContext,
  VueFieldComponent,
} from '@quickflo/quickforms-vue';

// Re-export core types and utilities for convenience
export type {
  JSONSchema,
  UISchemaElement,
  TesterFunction,
} from '@quickflo/quickforms';

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
  hasConst,
  isDiscriminatedUnion,
  hasConditional,
} from '@quickflo/quickforms';
