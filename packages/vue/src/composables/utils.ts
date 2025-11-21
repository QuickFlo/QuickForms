import type { JSONSchema } from '@quickflo/quickforms';

/**
 * Generate a field ID for accessibility
 */
export function generateFieldId(path: string): string {
  return `field-${path.replace(/\./g, '-')}`;
}

/**
 * Get label from schema or path
 */
export function getLabel(schema: JSONSchema, path: string): string {
  return schema.title || path.split('.').pop() || path;
}

/**
 * Get hint/description from schema
 * Priority: x-hint (HTML) > description (plain text)
 */
export function getHint(schema: JSONSchema): string | undefined {
  // Check for x-hint extension first (supports HTML)
  const xHint = (schema as any)['x-hint'];
  if (xHint) return xHint;
  
  // Fall back to description
  return schema.description;
}

/**
 * Check if a value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Join path segments
 */
export function joinPath(...segments: string[]): string {
  return segments.filter(Boolean).join('.');
}
