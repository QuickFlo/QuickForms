import type { Component } from 'vue';
import type { JSONSchema, UISchemaElement, TesterFunction, ComponentRegistry } from '@quickforms/core';

/**
 * Vue component with tester function
 */
export interface VueFieldComponent {
  component: Component;
  tester: TesterFunction;
}

/**
 * Props passed to field components
 */
export interface FieldProps {
  schema: JSONSchema;
  uischema?: UISchemaElement;
  path: string;
  modelValue?: any;
  disabled?: boolean;
  readonly?: boolean;
}

/**
 * Options for form configuration
 */
export interface FormOptions {
  readonly?: boolean;
  disabled?: boolean;
  validateOnMount?: boolean;
  validateOnChange?: boolean;
  /** Populate form with default values from schema. Defaults to true. */
  useDefaults?: boolean;
  /** Custom component registry. If not provided, default registry will be used. */
  registry?: ComponentRegistry<Component>;
}

/**
 * Form context provided to child components
 */
export interface FormContext {
  readonly: boolean;
  disabled: boolean;
  schema: JSONSchema;
  rootPath: string;
  registry: ComponentRegistry<Component>;
}
