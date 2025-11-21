import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { JSONSchema, ValidationResult, ValidationError } from './types.js';

/**
 * Utility class for JSON Schema operations
 */
export class SchemaUtils {
  private ajv: Ajv;
  private validators: Map<string, ValidateFunction> = new Map();

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true, 
      strict: false,
      validateFormats: true
    });
    addFormats(this.ajv);
  }

  /**
   * Validate data against a JSON Schema
   */
  validate(schema: JSONSchema, data: any): ValidationResult {
    const schemaKey = JSON.stringify(schema);
    
    let validate = this.validators.get(schemaKey);
    if (!validate) {
      validate = this.ajv.compile(schema);
      this.validators.set(schemaKey, validate);
    }

    const valid = validate(data);
    
    return {
      valid: valid as boolean,
      errors: (validate.errors || []) as ValidationError[]
    };
  }

  /**
   * Generate default value for a schema
   */
  getDefaultValue(schema: JSONSchema): any {
    // Check for explicit default
    if (schema.default !== undefined) {
      return schema.default;
    }

    // Check for const
    if (schema.const !== undefined) {
      return schema.const;
    }

    // Check for enum (use first value)
    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0];
    }

    // Handle based on type
    switch (schema.type) {
      case 'string':
        return '';
      case 'number':
      case 'integer':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        const obj: any = {};
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            // Include required fields and fields with explicit defaults
            const isRequired = schema.required?.includes(key);
            const hasExplicitDefault = propSchema.default !== undefined || 
                                       propSchema.const !== undefined ||
                                       propSchema.enum !== undefined;
            
            if (isRequired || hasExplicitDefault) {
              obj[key] = this.getDefaultValue(propSchema);
            }
          }
        }
        return obj;
      case 'null':
        return null;
      default:
        return null;
    }
  }

  /**
   * Get schema at a specific path (dot notation)
   * Example: "user.address.street" -> schema for street field
   */
  getSchemaAtPath(schema: JSONSchema, path: string): JSONSchema | null {
    if (!path || path === '') {
      return schema;
    }

    const parts = path.split('.');
    let current: JSONSchema = schema;

    for (const part of parts) {
      if (current.type === 'object' && current.properties) {
        const nextSchema = current.properties[part];
        if (!nextSchema) {
          return null;
        }
        current = nextSchema;
      } else if (current.type === 'array') {
        // Handle array index (e.g., "items.0.field")
        if (!isNaN(Number(part))) {
          if (Array.isArray(current.items)) {
            const index = Number(part);
            current = current.items[index];
          } else if (current.items) {
            current = current.items;
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }

      if (!current) {
        return null;
      }
    }

    return current;
  }

  /**
   * Check if a field at path is required
   */
  isRequired(schema: JSONSchema, fieldPath: string): boolean {
    const parts = fieldPath.split('.');
    const fieldName = parts.pop();
    const parentPath = parts.join('.');

    if (!fieldName) {
      return false;
    }

    const parentSchema = parentPath 
      ? this.getSchemaAtPath(schema, parentPath)
      : schema;

    if (!parentSchema || parentSchema.type !== 'object') {
      return false;
    }

    return parentSchema.required?.includes(fieldName) || false;
  }

  /**
   * Get all property paths from a schema (flattened)
   * Example: { user: { name: string } } -> ['user.name']
   */
  getPropertyPaths(schema: JSONSchema, prefix: string = ''): string[] {
    const paths: string[] = [];

    if (schema.type === 'object' && schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        paths.push(fullPath);

        // Recursively get nested paths
        if (propSchema.type === 'object' && propSchema.properties) {
          paths.push(...this.getPropertyPaths(propSchema, fullPath));
        }
      }
    }

    return paths;
  }

  /**
   * Merge multiple schemas (for allOf)
   */
  mergeSchemas(...schemas: JSONSchema[]): JSONSchema {
    const merged: JSONSchema = {
      type: 'object',
      properties: {},
      required: []
    };

    for (const schema of schemas) {
      if (schema.properties) {
        merged.properties = {
          ...merged.properties,
          ...schema.properties
        };
      }

      if (schema.required) {
        merged.required = [
          ...(merged.required || []),
          ...schema.required
        ];
      }

      // Merge other properties
      if (schema.title) merged.title = schema.title;
      if (schema.description) merged.description = schema.description;
    }

    return merged;
  }

  /**
   * Resolve $ref references in a schema
   * Note: Only handles internal references (#/$defs/...)
   */
  resolveRef(schema: JSONSchema, ref: string): JSONSchema | null {
    if (!ref.startsWith('#/')) {
      console.warn('External references not supported:', ref);
      return null;
    }

    const path = ref.substring(2).split('/'); // Remove '#/' and split
    let current: any = schema;

    for (const part of path) {
      current = current[part];
      if (!current) {
        return null;
      }
    }

    return current as JSONSchema;
  }

  /**
   * Clear the validation cache
   */
  clearCache(): void {
    this.validators.clear();
  }
}
