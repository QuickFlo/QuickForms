# Validation

Learn about QuickForms' flexible validation system.

## Overview

QuickForms provides three levels of validation:

1. **JSON Schema validation** - Built-in validation based on schema keywords
2. **Custom validators** - Add your own sync/async validation logic
3. **Validation modes** - Control when and how errors are displayed

## Validation Modes

Control validation behavior with the `validationMode` option:

```vue
<DynamicForm
  :options="{
    validationMode: 'ValidateAndShow' // 'ValidateAndHide' | 'NoValidation'
  }"
/>
```

- **`ValidateAndShow`** (default) - Validates as you type and displays errors
- **`ValidateAndHide`** - Validates but hides errors from user
- **`NoValidation`** - Completely disables validation

## JSON Schema Validation

QuickForms automatically validates based on JSON Schema keywords:

```typescript
{
  email: {
    type: 'string',
    format: 'email',        // Email format validation
    minLength: 5,           // Minimum length
    maxLength: 100          // Maximum length
  },
  age: {
    type: 'number',
    minimum: 18,            // Minimum value
    maximum: 120            // Maximum value
  }
}
```

## Custom Error Messages

Override default validation messages in two ways:

### In Schema
```typescript
{
  password: {
    type: 'string',
    minLength: 8,
    'x-error-messages': {
      required: 'Password is required',
      minLength: 'Password must be at least 8 characters'
    }
  }
}
```

### In Form Options
```vue
<DynamicForm
  :options="{
    errorMessages: {
      'password': {
        required: 'Please enter a password',
        minLength: 'Too short!'
      }
    }
  }"
/>
```

## Custom Validators

See [Custom Validators Guide](/guide/custom-validators) for detailed information on adding custom validation logic.

## Validation Events

React to validation state changes:

```vue
<script setup lang="ts">
const handleValidation = (result: { valid: boolean; errors: Record<string, string> }) => {
  console.log('Form valid:', result.valid)
  console.log('Errors:', result.errors)
}
</script>

<template>
  <DynamicForm @validation="handleValidation" />
</template>
```

## Next Steps

- [Custom Validators](/guide/custom-validators) - Add sync/async validation
- [Schema Extensions](/guide/schema-extensions) - Learn about `x-error-messages`
- [Form Options API](/guide/form-options) - Complete validation options reference
