# Schema Basics

QuickForms uses [JSON Schema](https://json-schema.org/) to define form structure and validation. This guide covers the fundamentals.

## JSON Schema Introduction

JSON Schema is an industry-standard vocabulary for validating and documenting JSON data. It's:
- **Self-documenting** - Schemas describe data structure and constraints
- **Language-agnostic** - Works across any programming language
- **Extensible** - Supports custom extensions via `x-*` attributes
- **Widely adopted** - Used by OpenAPI, VS Code, and many other tools

## Basic Structure

Every QuickForms schema starts with an object:

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    // Field definitions go here
  }
}
```

## Primitive Types

### String

```typescript
{
  fieldName: {
    type: 'string',
    title: 'Field Label',
    minLength: 2,
    maxLength: 50,
    pattern: '^[A-Za-z]+$',  // Regex validation
    default: 'Default value'
  }
}
```

**String Formats:**
- `email` - Email validation
- `url` / `uri` - URL validation
- `date` - Date picker (YYYY-MM-DD)
- `time` - Time picker (HH:mm:ss)
- `date-time` - Date+time picker
- `password` - Password input with show/hide toggle
- `textarea` - Multi-line text input

```typescript
{
  email: { type: 'string', format: 'email' },
  website: { type: 'string', format: 'url' },
  birthdate: { type: 'string', format: 'date' },
  password: { type: 'string', format: 'password' },
  bio: { type: 'string', format: 'textarea' }
}
```

### Number / Integer

```typescript
{
  age: {
    type: 'number',        // Use 'integer' for whole numbers only
    title: 'Age',
    minimum: 18,
    maximum: 120,
    multipleOf: 1,         // Step increment
    default: 25
  }
}
```

### Boolean

```typescript
{
  newsletter: {
    type: 'boolean',
    title: 'Subscribe to newsletter',
    default: false
  }
}
```

Rendered as a checkbox.

### Enum (Select)

```typescript
{
  status: {
    type: 'string',
    enum: ['draft', 'active', 'archived'],
    title: 'Status',
    default: 'draft'
  }
}
```

Rendered as a select dropdown. For better UX, add custom labels:

```typescript
{
  status: {
    type: 'string',
    enum: ['draft', 'active', 'archived'],
    'x-enum-labels': {
      draft: '📝 Draft',
      active: '✅ Active',
      archived: '📦 Archived'
    }
  }
}
```

## Common Properties

### `title`
Display label for the field. If omitted, the property key is used.

```typescript
{ type: 'string', title: 'Full Name' }  // Shows "Full Name"
{ type: 'string' }                       // Shows "fieldName"
```

### `description`
Help text displayed below the field.

```typescript
{
  password: {
    type: 'string',
    format: 'password',
    description: 'Must be at least 8 characters'
  }
}
```

For HTML hints, use `x-hint`:

```typescript
{
  email: {
    type: 'string',
    format: 'email',
    'x-hint': 'We follow <a href="/privacy">strict privacy rules</a>'
  }
}
```

### `default`
Default value when form is initialized.

```typescript
{
  country: {
    type: 'string',
    enum: ['US', 'CA', 'UK'],
    default: 'US'  // Pre-selected
  }
}
```

Enable `useDefaults` in form options to populate defaults:

```vue
<DynamicForm :options="{ useDefaults: true }" />
```

### `required`
Required fields are specified at the parent object level:

```typescript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' }
  },
  required: ['name', 'email']  // Both required
}
```

Required fields show an asterisk (*) in their label.

## Validation Keywords

### String Validation
- `minLength` / `maxLength` - Length constraints
- `pattern` - Regular expression (JavaScript flavor)
- `format` - Predefined formats (email, url, date, etc.)

```typescript
{
  username: {
    type: 'string',
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_]+$'
  }
}
```

### Number Validation
- `minimum` / `maximum` - Inclusive bounds
- `exclusiveMinimum` / `exclusiveMaximum` - Exclusive bounds
- `multipleOf` - Must be divisible by this value

```typescript
{
  price: {
    type: 'number',
    minimum: 0,
    maximum: 9999.99,
    multipleOf: 0.01  // Two decimal places
  }
}
```

## Complete Example

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    // String field
    name: {
      type: 'string',
      title: 'Full Name',
      minLength: 2,
      description: 'First and last name'
    },
    
    // Email field
    email: {
      type: 'string',
      format: 'email',
      title: 'Email Address'
    },
    
    // Number field
    age: {
      type: 'integer',
      title: 'Age',
      minimum: 18,
      maximum: 120
    },
    
    // Boolean field
    terms: {
      type: 'boolean',
      title: 'I agree to the terms'
    },
    
    // Enum field
    role: {
      type: 'string',
      enum: ['user', 'admin', 'moderator'],
      title: 'Role',
      default: 'user'
    }
  },
  required: ['name', 'email', 'age', 'terms']
}
```

## Next Steps

- [Field Types](/guide/field-types) - Deep dive into all field types
- [Validation](/guide/validation) - Advanced validation techniques
- [Complex Types](/guide/complex-types) - Objects, arrays, and conditionals
- [Schema Extensions](/guide/schema-extensions) - Custom `x-*` attributes
