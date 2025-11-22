# Custom Validators

Add custom validation logic beyond JSON Schema capabilities. Supports both sync and async validators.

## Sync Validators

Perfect for cross-field validation or business logic that doesn't require API calls.

### Password Confirmation Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'

const schema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      format: 'password',
      minLength: 8,
      title: 'Password'
    },
    confirmPassword: {
      type: 'string',
      format: 'password',
      title: 'Confirm Password'
    }
  },
  required: ['password', 'confirmPassword']
}

const formData = ref({})

const options = {
  validators: {
    // Sync validator with access to all form values
    confirmPassword: (value, allValues) => {
      return value === allValues.password || 'Passwords must match'
    },
    // Also validate password when confirmPassword changes
    password: (value, allValues) => {
      if (allValues.confirmPassword && value !== allValues.confirmPassword) {
        return 'Passwords must match'
      }
      return true
    }
  }
}
</script>

<template>
  <DynamicForm :schema="schema" v-model="formData" :options="options" />
</template>
```

### Business Logic Example

```typescript
validators: {
  // Age must match birthdate
  age: (value, allValues) => {
    if (!allValues.birthdate) return true
    
    const birthYear = new Date(allValues.birthdate).getFullYear()
    const calculatedAge = new Date().getFullYear() - birthYear
    
    if (Math.abs(value - calculatedAge) > 1) {
      return 'Age doesn\'t match birth date'
    }
    return true
  },
  
  // Conditional required
  otherSpecify: (value, allValues) => {
    if (allValues.category === 'other' && !value) {
      return 'Please specify when selecting "Other"'
    }
    return true
  }
}
```

## Async Validators

Perfect for API validation like username availability or email verification.

### Username Availability Example

```vue
<script setup lang="ts">
const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const response = await fetch(`/guide/check-username/${username}`)
  const data = await response.json()
  return data.available
}

const options = {
  validators: {
    // Async validator - automatically detected!
    username: async (value) => {
      if (!value || value.length < 3) return true
      
      const available = await checkUsernameAvailable(value)
      return available || 'Username already taken'
    }
  },
  
  // Debounce to avoid excessive API calls
  validatorDebounce: {
    username: 500 // Wait 500ms after user stops typing
  }
}
</script>

<template>
  <DynamicForm :schema="schema" v-model="formData" :options="options" />
</template>
```

### Email Verification Example

```typescript
validators: {
  email: async (value) => {
    if (!value) return true
    
    // Check email format first (JSON Schema handles this)
    // Then verify domain
    const response = await fetch('/guide/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email: value })
    })
    
    const result = await response.json()
    return result.valid || 'Email domain not allowed'
  }
}
```

## Debouncing

Control how long to wait after user stops typing before running async validators.

### Global Debounce

```typescript
{
  validatorDebounce: 300 // Apply to all async validators
}
```

### Per-Field Debounce

```typescript
{
  validatorDebounce: {
    username: 500,   // Slower API
    email: 300,      // Faster API
    zipCode: 1000    // Very slow API
  }
}
```

## Return Values

Validators can return multiple formats:

```typescript
// Valid
return true

// Invalid with generic error
return false

// Invalid with custom message
return 'Username already taken'

// Object format
return { valid: false, message: 'Custom error' }

// Async (return Promise of any above)
return Promise.resolve(true)
```

## Validator Function Signature

```typescript
type ValidatorFunction = (
  value: any,                        // Current field value
  allValues: Record<string, any>,    // All form values
  context?: Record<string, any>      // Form context (e.g., user roles)
) => boolean | string | Promise<boolean | string>
```

## Using Context

Access application context in validators:

```vue
<script setup lang="ts">
const options = {
  context: {
    userId: 123,
    roles: ['admin']
  },
  validators: {
    adminField: (value, allValues, context) => {
      if (!context?.roles?.includes('admin')) {
        return 'Admin access required'
      }
      return true
    }
  }
}
</script>
```

## Best Practices

1. **Return early** for empty values if field is optional
2. **Use debouncing** for async validators to avoid excessive API calls
3. **Provide clear error messages** - return strings instead of false
4. **Keep validators pure** - no side effects
5. **Test edge cases** - null, undefined, empty strings

## Next Steps

- [Validation Guide](/guide/validation) - Validation modes and error messages
- [Form Options API](/guide/form-options) - Complete validator options
