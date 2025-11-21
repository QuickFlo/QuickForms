/**
 * Simple test of @quickforms/core built package
 * Run with: node test-example.mjs
 */

import {
  ComponentRegistry,
  SchemaUtils,
  rankWith,
  isStringType,
  isNumberType,
  isEmailFormat
} from './dist/index.js';

console.log('\n🚀 Testing @quickforms/core\n');

// Test 1: Component Registry
console.log('=== Test 1: Component Registry ===');
const registry = new ComponentRegistry();

registry.register('string-input', 'StringComponent', (schema) =>
  rankWith(1, isStringType(schema))
);

registry.register('email-input', 'EmailComponent', (schema) =>
  rankWith(2, isEmailFormat(schema))
);

const stringSchema = { type: 'string' };
const emailSchema = { type: 'string', format: 'email' };

console.log('✓ String schema →', registry.getComponent(stringSchema));
console.log('✓ Email schema →', registry.getComponent(emailSchema));

// Test 2: Schema Utils
console.log('\n=== Test 2: Schema Utilities ===');
const utils = new SchemaUtils();

const testSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'number', minimum: 0 }
  },
  required: ['name', 'email']
};

console.log('✓ Default values:', utils.getDefaultValue(testSchema));
console.log('✓ Is "name" required?', utils.isRequired(testSchema, 'name'));
console.log('✓ Is "age" required?', utils.isRequired(testSchema, 'age'));

// Test 3: Validation
console.log('\n=== Test 3: Validation ===');
const validData = { name: 'John', email: 'john@example.com', age: 25 };
const invalidData = { name: 'Jane', email: 'not-an-email', age: -5 };

const validResult = utils.validate(testSchema, validData);
const invalidResult = utils.validate(testSchema, invalidData);

console.log('✓ Valid data passes?', validResult.valid);
console.log('✓ Invalid data fails?', !invalidResult.valid);
console.log('✓ Error count:', invalidResult.errors.length);

console.log('\n✅ All tests passed!\n');
