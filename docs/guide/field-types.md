# Field Types

Complete reference for all supported field types in QuickForms.

## Primitive Types

### String
Basic text input.

```typescript
{ type: 'string', title: 'Name' }
```

### String Formats
- `email` - Email input with validation
- `url` / `uri` - URL input with validation
- `date` - Date picker
- `time` - Time picker
- `date-time` - Date and time picker
- `password` - Password input with show/hide toggle
- `textarea` - Multi-line text area

### Number / Integer
Numeric input with validation.

```typescript
{
  type: 'number',
  minimum: 0,
  maximum: 100,
  multipleOf: 0.5
}
```

### Boolean
Checkbox input.

```typescript
{ type: 'boolean', title: 'Accept terms' }
```

### Enum
Select dropdown.

```typescript
{
  type: 'string',
  enum: ['option1', 'option2', 'option3'],
  'x-enum-labels': {
    'option1': 'Option 1',
    'option2': 'Option 2',
    'option3': 'Option 3'
  }
}
```

## Complex Types

### Object
See [Complex Types](/guide/complex-types) for nested objects.

### Array
See [Complex Types](/guide/complex-types) for arrays.

### oneOf / anyOf / allOf
See [Complex Types](/guide/complex-types) for conditional schemas.

## Next Steps

- [Schema Basics](/guide/schema-basics) - Learn schema fundamentals
- [Complex Types](/guide/complex-types) - Work with nested structures
- [Examples](/guide/examples/basic-form) - See field types in action
