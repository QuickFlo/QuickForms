// Registry
export { createQuasarRegistry } from './registry.js';

// Quasar-specific composables
export {
  useQuasarFormContext,
  provideQuasarFormContext,
} from './composables/useQuasarFormContext.js';

export {
  useQuasarFormField,
  type QuasarComponentType,
  type QuickFormsFeatureType,
  type UseQuasarFormFieldOptions,
  type UseQuasarFormFieldReturn,
} from './composables/useQuasarFormField.js';

// Utility functions for custom components
export {
  mergeQuasarProps,
  mergeQuickFormsQuasarFeatures,
  getFieldGapStyle,
} from './utils.js';

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
export { default as QuasarKeyValueField } from './components/QuasarKeyValueField.vue';
export { default as QuasarJsonField } from './components/QuasarJsonField.vue';
export { default as QuasarMultiEnumField } from './components/QuasarMultiEnumField.vue';
export { default as QuasarOneOfField } from './components/QuasarOneOfField.vue';
export { default as QuasarAllOfField } from './components/QuasarAllOfField.vue';
export { default as QuasarJsonLogicBuilderField } from './components/QuasarJsonLogicBuilderField.vue';

// JSONLogic utilities
export {
  OPERATORS,
  toJsonLogic,
  fromJsonLogic,
  createEmptyCondition,
  createEmptyGroup,
  createEmptyRoot,
  getOperatorInfo,
  generateConditionId,
} from './utils/jsonlogic.js';
export type {
  ComparisonOperator,
  OperatorInfo,
  SimpleCondition,
  ConditionGroup,
  ConditionItem,
  ConditionRoot,
  JsonLogic,
} from './utils/jsonlogic.js';

// Quasar-specific types
export type {
  QuasarComponentDefaults,
  QuasarFormOptions,
  QuasarFormContext,
  QuickFormsQuasarFeatures,
  QuickFormsQuasarArrayFeatures,
  QuickFormsQuasarKeyValueFeatures,
  QuickFormsQuasarDefaults,
} from './types.js';

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
  isRecordType,
  isJsonType,
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
