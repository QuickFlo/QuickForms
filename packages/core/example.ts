/**
 * Example usage of @quickforms/core
 * Run with: node --loader ts-node/esm example.ts
 * Or build and run: pnpm run build && node dist/example.js
 */

import {
  ComponentRegistry,
  SchemaUtils,
  rankWith,
  isStringType,
  isNumberType,
  isEmailFormat,
  type JSONSchema
} from './src/index.js';

// Example 1: Component Registry
console.log('\n=== Component Registry Example ===\n');

const registry = new ComponentRegistry<string>();

// Register components with testers
registry.register('string-input', 'StringInputComponent', (schema) =>
  rankWith(1, isStringType(schema))
);

registry.register('email-input', 'EmailInputComponent', (schema) =>
  rankWith(2, isEmailFormat(schema)) // Higher priority for email format
);

registry.register('number-input', 'NumberInputComponent', (schema) =>
  rankWith(1, isNumberType(schema))
);

// Test component selection
const stringSchema: JSONSchema = { type: 'string' };
const emailSchema: JSONSchema = { type: 'string', format: 'email' };
const numberSchema: JSONSchema = { type: 'number' };

console.log('String schema gets:', registry.getComponent(stringSchema)); // StringInputComponent
console.log('Email schema gets:', registry.getComponent(emailSchema)); // EmailInputComponent (higher priority)
console.log('Number schema gets:', registry.getComponent(numberSchema)); // NumberInputComponent

// Example 2: Schema Utilities
console.log('\n=== Schema Utilities Example ===\n');

const utils = new SchemaUtils();

// Test schema
const userSchema: JSONSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name'
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email'
    },
    age: {
      type: 'number',
      minimum: 0,
      title: 'Age'
    },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' }
      },
      required: ['city']
    }
  },
  required: ['name', 'email']
};

// Generate default values
console.log('Default values:', JSON.stringify(utils.getDefaultValue(userSchema), null, 2));

// Get schema at path
const emailFieldSchema = utils.getSchemaAtPath(userSchema, 'email');
console.log('\nEmail field schema:', emailFieldSchema);

// Check required fields
console.log('\nIs "name" required?', utils.isRequired(userSchema, 'name')); // true
console.log('Is "age" required?', utils.isRequired(userSchema, 'age')); // false
console.log('Is "address.city" required?', utils.isRequired(userSchema, 'address.city')); // true

// Validate data
const validData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'Springfield'
  }
};

const invalidData = {
  name: 'Jane',
  email: 'not-an-email', // Invalid email format
  age: -5 // Invalid (negative)
};

console.log('\n=== Validation Example ===\n');
const validResult = utils.validate(userSchema, validData);
console.log('Valid data result:', validResult.valid);

const invalidResult = utils.validate(userSchema, invalidData);
console.log('Invalid data result:', invalidResult.valid);
console.log('Validation errors:', invalidResult.errors.map(e => ({
  path: e.instancePath,
  message: e.message
})));

// Example 3: Get all property paths
console.log('\n=== Property Paths Example ===\n');
const paths = utils.getPropertyPaths(userSchema);
console.log('All property paths:', paths);

console.log('\n✅ All examples completed successfully!\n');
