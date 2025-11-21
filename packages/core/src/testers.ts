import type { JSONSchema, UISchemaElement } from './types.js';

/**
 * Helper to create a ranked tester
 * Returns rank if predicate is true, -1 otherwise
 */
export const rankWith = (rank: number, predicate: boolean): number => {
  return predicate ? rank : -1;
};

/**
 * Basic type testers
 */

export const isStringType = (schema: JSONSchema): boolean => {
  if (schema.type === 'string') return true;
  if (schema.const !== undefined && typeof schema.const === 'string') return true;
  return false;
};

export const isNumberType = (schema: JSONSchema): boolean => {
  if (schema.type === 'number' || schema.type === 'integer') return true;
  if (schema.const !== undefined && typeof schema.const === 'number') return true;
  return false;
};

export const isIntegerType = (schema: JSONSchema): boolean => {
  return schema.type === 'integer';
};

export const isBooleanType = (schema: JSONSchema): boolean => {
  if (schema.type === 'boolean') return true;
  if (schema.const !== undefined && typeof schema.const === 'boolean') return true;
  return false;
};

export const isObjectType = (schema: JSONSchema): boolean => {
  return schema.type === 'object' || (schema.type === undefined && schema.properties !== undefined);
};

export const isArrayType = (schema: JSONSchema): boolean => {
  return schema.type === 'array';
};

export const isNullType = (schema: JSONSchema): boolean => {
  return schema.type === 'null';
};

/**
 * Enum tester
 */
export const isEnumType = (schema: JSONSchema): boolean => {
  return Array.isArray(schema.enum) && schema.enum.length > 0;
};

/**
 * Format-specific testers
 */

export const hasFormat = (format: string) => (schema: JSONSchema): boolean => {
  return schema.format === format;
};

export const isEmailFormat = (schema: JSONSchema): boolean => {
  return isStringType(schema) && schema.format === 'email';
};

export const isDateFormat = (schema: JSONSchema): boolean => {
  return isStringType(schema) && schema.format === 'date';
};

export const isTimeFormat = (schema: JSONSchema): boolean => {
  return isStringType(schema) && schema.format === 'time';
};

export const isDateTimeFormat = (schema: JSONSchema): boolean => {
  return isStringType(schema) && schema.format === 'date-time';
};

export const isUrlFormat = (schema: JSONSchema): boolean => {
  return isStringType(schema) && (schema.format === 'url' || schema.format === 'uri');
};

/**
 * Composition testers
 */

export const hasOneOf = (schema: JSONSchema): boolean => {
  return Array.isArray(schema.oneOf) && schema.oneOf.length > 0;
};

export const hasAnyOf = (schema: JSONSchema): boolean => {
  return Array.isArray(schema.anyOf) && schema.anyOf.length > 0;
};

export const hasAllOf = (schema: JSONSchema): boolean => {
  return Array.isArray(schema.allOf) && schema.allOf.length > 0;
};

/**
 * Discriminated union tester
 */
export const isDiscriminatedUnion = (schema: JSONSchema): boolean => {
  return hasOneOf(schema) && schema.discriminator !== undefined;
};

/**
 * Conditional schema tester
 */
export const hasConditional = (schema: JSONSchema): boolean => {
  return schema.if !== undefined;
};

/**
 * Custom extension tester factory
 */
export const hasExtension = (extensionKey: string) => (schema: JSONSchema): boolean => {
  return schema[extensionKey as keyof JSONSchema] !== undefined;
};

/**
 * Combines multiple testers with AND logic
 */
export const and = (...testers: Array<(schema: JSONSchema) => boolean>) => {
  return (schema: JSONSchema): boolean => {
    return testers.every(tester => tester(schema));
  };
};

/**
 * Combines multiple testers with OR logic
 */
export const or = (...testers: Array<(schema: JSONSchema) => boolean>) => {
  return (schema: JSONSchema): boolean => {
    return testers.some(tester => tester(schema));
  };
};

/**
 * Negates a tester
 */
export const not = (tester: (schema: JSONSchema) => boolean) => {
  return (schema: JSONSchema): boolean => {
    return !tester(schema);
  };
};
