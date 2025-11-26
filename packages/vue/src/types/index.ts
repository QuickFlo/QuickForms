import type { Component } from 'vue';
import type { JSONSchema, UISchemaElement, TesterFunction, ComponentRegistry } from '@quickflo/quickforms';

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
 * Validation result - can be boolean, error string, or object
 */
export type ValidationResult = boolean | string | { valid: boolean; message?: string };

/**
 * Custom validator function - supports both sync and async
 */
export type ValidatorFunction = (
  value: any,
  allValues: Record<string, any>,
  context?: Record<string, any>
) => ValidationResult | Promise<ValidationResult>;

/**
 * Hint renderer function - customize hint display
 */
export type HintRendererFunction = (
  hint: string,
  field: {
    schema: JSONSchema;
    path: string;
    value: any;
  }
) => string;

/**
 * Internationalization / customizable labels for UI text
 */
export interface FormLabels {
  /** Placeholder for select/enum fields. Default: "Select an option..." */
  selectPlaceholder?: string;
  /** Label for add button in arrays. Default: "Add item" */
  addItem?: string;
  /** Label for remove button in arrays. Default: "Remove" */
  removeItem?: string;
  /** Label for submit button. Default: "Submit" */
  submit?: string;
  /** Show password toggle hint. Default: "Show password" */
  showPassword?: string;
  /** Hide password toggle hint. Default: "Hide password" */
  hidePassword?: string;
}

/**
 * Component-specific default configurations
 */
export interface ComponentDefaults {
  /** Layout configuration for field spacing */
  layout?: {
    /** 
     * Vertical gap between form fields.
     * For Vue package: accepts CSS value (e.g., '1rem', '24px')
     * For Quasar package: accepts 'xs' | 'sm' | 'md' | 'lg' | 'xl' or CSS value
     * Default: '1rem'
     */
    fieldGap?: string;
  };
  select?: {
    /** Enable datalist autocomplete for enum fields. Default: false */
    autocomplete?: boolean;
    /** Minimum options to show autocomplete. Default: 5 */
    autocompleteThreshold?: number;
  };
  array?: {
    /** Allow collapsing array items. Default: false */
    collapsible?: boolean;
    /** Start with items collapsed. Default: false */
    defaultCollapsed?: boolean;
  };
  object?: {
    /** 
     * Default expanded state for object fields. 
     * 'required-only' = required fields expanded, optional collapsed (default)
     * 'all' = all fields expanded
     * 'none' = all fields collapsed
     */
    defaultExpanded?: 'required-only' | 'all' | 'none';
    /** Show "(optional)" indicator for optional object fields. Default: true */
    showOptionalIndicator?: boolean;
  };
  number?: {
    /** Prefix for number display (e.g., "$"). Default: undefined */
    prefix?: string;
    /** Suffix for number display (e.g., "%"). Default: undefined */
    suffix?: string;
  };
  hints?: {
    /** When to show hints. Default: "always" */
    showMode?: 'always' | 'focus' | 'hover';
  };
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
  /** Custom field validators (sync or async) */
  validators?: Record<string, ValidatorFunction>;
  /** Debounce delay for async validators in milliseconds */
  validatorDebounce?: number | Record<string, number>;
  /** Customizable labels for i18n or branding */
  labels?: FormLabels;
  /** Component-specific default configurations */
  componentDefaults?: ComponentDefaults;
  /** Custom hint renderer function for dynamic hints */
  hintRenderer?: HintRendererFunction;
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
  validators?: Record<string, ValidatorFunction>;
  validatorDebounce?: number | Record<string, number>;
  formValues: () => Record<string, any>;
  labels: FormLabels;
  componentDefaults: ComponentDefaults;
  hintRenderer?: HintRendererFunction;
}
