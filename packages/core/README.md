# @quickforms/core

Framework-agnostic core for QuickForms - JSON Schema form generator.

## Features

- **ComponentRegistry**: Generic registry system for component registration with tester priority
- **SchemaUtils**: JSON Schema utilities (validation via Ajv, default values, path traversal)
- **Testers**: Predicate functions for schema type detection
- **TypeScript**: Full type definitions for JSON Schema and core interfaces

## Installation

```bash
pnpm add @quickforms/core
```

## Usage

### Component Registry

```typescript
import { ComponentRegistry, rankWith, isStringType } from '@quickforms/core';

const registry = new ComponentRegistry();

// Register a component with a tester
registry.register(
  'string-input',
  MyStringInputComponent,
  (schema) => rankWith(1, isStringType(schema))
);

// Get the best matching component
const component = registry.getComponent({ type: 'string' });
```

### Schema Utilities

```typescript
import { SchemaUtils } from '@quickforms/core';

const utils = new SchemaUtils();

// Validate data
const result = utils.validate(schema, data);
if (!result.valid) {
  console.error(result.errors);
}

// Get default values
const defaults = utils.getDefaultValue(schema);

// Get schema at path
const fieldSchema = utils.getSchemaAtPath(schema, 'user.address.street');

// Check if field is required
const isRequired = utils.isRequired(schema, 'user.name');
```

### Testers

```typescript
import { 
  rankWith, 
  isStringType, 
  isEmailFormat,
  and 
} from '@quickforms/core';

// Simple tester
const stringTester = (schema) => rankWith(1, isStringType(schema));

// Format-specific tester (higher priority)
const emailTester = (schema) => rankWith(2, isEmailFormat(schema));

// Combine testers
const requiredEmailTester = (schema) => 
  rankWith(3, and(isEmailFormat, isRequired)(schema));
```

## License

MIT
