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
export { default as ObjectField } from './components/ObjectField.vue';
export { default as ArrayField } from './components/ArrayField.vue';
export { default as KeyValueField } from './components/KeyValueField.vue';
export { default as JsonField } from './components/JsonField.vue';
export { default as OneOfField } from './components/OneOfField.vue';
export { default as AllOfField } from './components/AllOfField.vue';
export { default as HiddenField } from './components/HiddenField.vue';

// Composables
export { useFormField } from './composables/useFormField.js';
export { useFormContext, provideFormContext } from './composables/useFormContext.js';
export { useWatchFormValue, useWatchFormValues } from './composables/useWatchFormValue.js';
export * from './composables/utils.js';

// Types
export type {
  VueFieldComponent,
  FieldProps,
  FormOptions,
  FormContext,
  FormValuesWatchCallback,
} from './types/index.js';

// Re-export core types and utilities
export type { JSONSchema, UISchemaElement, TesterFunction } from '@quickflo/quickforms';
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
  hasXRender,
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
  hasConditional
} from '@quickflo/quickforms';
