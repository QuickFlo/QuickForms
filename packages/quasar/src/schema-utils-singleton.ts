import { SchemaUtils } from '@quickflo/quickforms';

// Shared SchemaUtils instance for the Quasar package
// Reuse a single Ajv instance to avoid repeated startup cost per form/component.
export const schemaUtils = new SchemaUtils();