/**
 * JSON Schema type definitions (Draft 7+)
 */
export interface JSONSchema {
  // Core schema properties
  type?:
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "object"
    | "array"
    | "null";
  title?: string;
  description?: string;
  default?: any;
  const?: any;
  enum?: any[];
  placeholder?: string;

  // String validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string; // email, date, time, date-time, uri, etc.

  // Number validation
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;

  // Object properties
  properties?: Record<string, JSONSchema>;
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  patternProperties?: Record<string, JSONSchema>;
  minProperties?: number;
  maxProperties?: number;

  // Array properties
  items?: JSONSchema | JSONSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchema;

  // Composition
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;

  // Conditional
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;

  // References
  $ref?: string;
  $defs?: Record<string, JSONSchema>;
  definitions?: Record<string, JSONSchema>;

  // Discriminator for oneOf (OpenAPI style)
  discriminator?: {
    propertyName: string;
    mapping?: Record<string, string>;
  };

  // Custom extensions (x- prefix)
  [key: `x-${string}`]: any;
}

/**
 * UI Schema for layout and presentation hints
 */
export interface UISchemaElement {
  type: string;
  scope?: string; // JSON Pointer to data location
  label?: string;
  rule?: Rule;
  options?: Record<string, any>;
  elements?: UISchemaElement[];
}

/**
 * Visibility rule for conditional rendering
 */
export interface Rule {
  effect: "SHOW" | "HIDE" | "ENABLE" | "DISABLE";
  condition: {
    scope: string;
    schema: JSONSchema;
  };
}

/**
 * Component that can be registered in the registry
 */
export interface FieldComponent<T = any> {
  component: T;
  tester: TesterFunction;
}

/**
 * Function that tests if a component should be used for a schema
 * Returns a number indicating priority (higher = better match)
 * Returns -1 if component should not be used
 */
export type TesterFunction = (
  schema: JSONSchema,
  uischema?: UISchemaElement
) => number;

/**
 * Props passed to field renderer components
 */
export interface RendererProps {
  schema: JSONSchema;
  uischema?: UISchemaElement;
  path: string;
  data: any;
  enabled: boolean;
  visible: boolean;
  errors?: string[];
  handleChange: (path: string, value: any) => void;
}

/**
 * Validation error from Ajv
 */
export interface ValidationError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, any>;
  message?: string;
}

/**
 * Result from schema validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
