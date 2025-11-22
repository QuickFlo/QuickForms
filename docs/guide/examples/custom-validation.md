# Custom Validation Example

Add your own validation logic beyond JSON Schema constraints.

## Basic Custom Validator

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: 'Username',
      minLength: 3
    },
    password: {
      type: 'string',
      format: 'password',
      title: 'Password',
      minLength: 8
    },
    confirmPassword: {
      type: 'string',
      format: 'password',
      title: 'Confirm Password'
    }
  },
  required: ['username', 'password', 'confirmPassword']
}

const formData = ref({})

const options = {
  validators: {
    // Sync validator
    username: (value, allValues) => {
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return 'Username can only contain letters, numbers, and underscores'
      }
      if (value.toLowerCase() === 'admin') {
        return 'Username "admin" is reserved'
      }
      return true
    },
    
    // Password strength validator
    password: (value) => {
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter'
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter'
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number'
      }
      return true
    },
    
    // Cross-field validation
    confirmPassword: (value, allValues) => {
      if (value !== allValues.password) {
        return 'Passwords must match'
      }
      return true
    }
  }
}
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="options"
  />
</template>
```

## Async Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'

const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      title: 'Email Address'
    }
  }
}

const formData = ref({})

const options = {
  validators: {
    // Async validator - checks if email is available
    email: async (value) => {
      if (!value) return true
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const response = await fetch(`/api/check-email?email=${value}`)
      const { available } = await response.json()
      
      return available || 'This email is already registered'
    }
  },
  // Debounce async validation
  validatorDebounce: {
    email: 500  // Wait 500ms after typing stops
  }
}
</script>

<template>
  <DynamicForm :schema="schema" v-model="formData" :options="options" />
</template>
```

## Complex Business Logic

```typescript
const options = {
  validators: {
    // Age validation with context
    age: (value, allValues, context) => {
      const minAge = context.minimumAge || 18
      if (value < minAge) {
        return `Must be at least ${minAge} years old`
      }
      return true
    },
    
    // Credit card validation
    cardNumber: (value) => {
      // Luhn algorithm
      const digits = value.replace(/\s/g, '').split('').reverse()
      let sum = 0
      for (let i = 0; i < digits.length; i++) {
        let digit = parseInt(digits[i])
        if (i % 2 === 1) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
      }
      return sum % 10 === 0 || 'Invalid credit card number'
    },
    
    // Date range validation
    endDate: (value, allValues) => {
      if (!value || !allValues.startDate) return true
      
      const start = new Date(allValues.startDate)
      const end = new Date(value)
      
      if (end <= start) {
        return 'End date must be after start date'
      }
      
      return true
    },
    
    // File upload validation
    file: (value) => {
      if (!value) return true
      
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (value.size > maxSize) {
        return 'File size must be less than 5MB'
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(value.type)) {
        return 'File must be JPEG, PNG, or PDF'
      }
      
      return true
    }
  },
  // Provide context
  context: {
    minimumAge: 21
  }
}
```

## Validation Return Types

Validators can return different types:

```typescript
const validators = {
  field1: (value) => {
    // Boolean
    return true  // Valid
    return false // Invalid (generic error)
  },
  
  field2: (value) => {
    // String error message
    return 'Custom error message'
    return true  // Valid
  },
  
  field3: async (value) => {
    // Promise<boolean | string>
    const result = await validateAsync(value)
    return result.isValid || result.errorMessage
  },
  
  field4: (value) => {
    // Validation result object
    return {
      valid: false,
      message: 'Custom error message'
    }
  }
}
```

## Error Messages Priority

QuickForms checks error messages in this order:

1. **Custom validator errors** (highest priority)
2. **`x-error-messages` in schema**
3. **`errorMessages` in options**
4. **Default error messages** (lowest priority)

```vue
<script setup lang="ts">
const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      // Schema-level custom messages
      'x-error-messages': {
        required: 'Email is required',
        format: 'Please enter a valid email address'
      }
    }
  }
}

const options = {
  // Form-level custom messages
  errorMessages: {
    email: {
      required: 'Email cannot be empty',
      format: 'Invalid email format'
    }
  },
  // Custom validator (takes precedence over all)
  validators: {
    email: async (value) => {
      const exists = await checkEmail(value)
      return exists || 'This email is already taken'  // Highest priority
    }
  }
}
</script>
```

## Validation Modes

Control when/how validation errors are displayed:

```typescript
const options = {
  // ValidateAndShow - Show errors as you type (default)
  validationMode: 'ValidateAndShow',
  
  // ValidateAndHide - Validate silently, don't show errors
  // validationMode: 'ValidateAndHide',
  
  // NoValidation - Skip all validation
  // validationMode: 'NoValidation',
  
  validators: {
    email: async (value) => {
      // Validation still runs in all modes
      // But errors only shown in ValidateAndShow
      return await checkEmail(value)
    }
  }
}
```

## Complete Example: Registration Form

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'

const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: 'Username',
      minLength: 3,
      maxLength: 20,
      'x-hint': 'Letters, numbers, and underscores only'
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email Address'
    },
    password: {
      type: 'string',
      format: 'password',
      title: 'Password',
      minLength: 8,
      'x-hint': 'At least 8 characters with uppercase, lowercase, and numbers'
    },
    confirmPassword: {
      type: 'string',
      format: 'password',
      title: 'Confirm Password'
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 13
    },
    termsAccepted: {
      type: 'boolean',
      title: 'I accept the terms and conditions'
    }
  },
  required: ['username', 'email', 'password', 'confirmPassword', 'age', 'termsAccepted']
}

const formData = ref({})

const options = {
  validators: {
    username: async (value) => {
      // Format validation
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return 'Only letters, numbers, and underscores allowed'
      }
      
      // Reserved words
      const reserved = ['admin', 'root', 'system']
      if (reserved.includes(value.toLowerCase())) {
        return 'This username is reserved'
      }
      
      // Check availability (async)
      const response = await fetch(`/api/check-username?username=${value}`)
      const { available } = await response.json()
      return available || 'Username already taken'
    },
    
    email: async (value) => {
      // Check if email exists
      const response = await fetch(`/api/check-email?email=${value}`)
      const { available } = await response.json()
      return available || 'Email already registered'
    },
    
    password: (value) => {
      if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter'
      if (!/[a-z]/.test(value)) return 'Must contain lowercase letter'
      if (!/[0-9]/.test(value)) return 'Must contain number'
      if (/\s/.test(value)) return 'Cannot contain spaces'
      return true
    },
    
    confirmPassword: (value, allValues) => {
      return value === allValues.password || 'Passwords do not match'
    },
    
    age: (value, allValues, context) => {
      if (value < 13) return 'Must be at least 13 years old'
      if (value > 120) return 'Please enter a valid age'
      return true
    },
    
    termsAccepted: (value) => {
      return value === true || 'You must accept the terms to continue'
    }
  },
  
  // Debounce async validators
  validatorDebounce: {
    username: 500,
    email: 500
  },
  
  // Custom error messages as fallback
  errorMessages: {
    username: {
      required: 'Username is required',
      minLength: 'Username must be at least 3 characters'
    },
    password: {
      minLength: 'Password must be at least 8 characters'
    }
  }
}

const handleValidation = (result) => {
  console.log('Form valid:', result.valid)
  console.log('Errors:', result.errors)
}
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="options"
    @validation="handleValidation"
  />
</template>
```

## Tips

1. **Return boolean `true` for valid** - Don't return a success message
2. **Be specific with errors** - Clear error messages improve UX
3. **Debounce async validators** - Prevent excessive API calls
4. **Access all values** - Use second parameter for cross-field validation
5. **Use context** - Pass dynamic configuration via context object
6. **Handle async errors** - Wrap async code in try/catch

## Next Steps

- [Custom Validators Guide](/guide/custom-validators) - Deep dive into validators
- [Validation Guide](/guide/validation) - JSON Schema validation
- [Form Options](/guide/form-options) - All form options
