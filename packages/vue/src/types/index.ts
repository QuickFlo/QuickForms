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
  label?: string;
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
  /** Application context (user, roles, etc) for field visibility logic */
  context?: Record<string, any>;
  /** Validation mode. Defaults to 'ValidateAndShow' */
  validationMode?: 'ValidateAndShow' | 'ValidateAndHide' | 'NoValidation';
  /** Custom error messages by path and rule type */
  errorMessages?: Record<string, Record<string, string>>;
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
  context: Record<string, any>;
  validationMode: 'ValidateAndShow' | 'ValidateAndHide' | 'NoValidation';
  errorMessages?: Record<string, Record<string, string>>;
}
