# Form Options API

Complete reference for the `options` prop on `DynamicForm`.

## Interface

```typescript
interface FormOptions {
  useDefaults?: boolean
  readonly?: boolean
  disabled?: boolean
  validationMode?: ValidationMode
  errorMessages?: ErrorMessages
  validators?: ValidatorMap
  validatorDebounce?: number | Record<string, number>
  context?: Record<string, any>
  registry?: ComponentRegistry
  labels?: FormLabels
  componentDefaults?: ComponentDefaults
}
```

## Properties

### `useDefaults`

- **Type:** `boolean`
- **Default:** `true`

Populate form with default values from schema's `default` properties.

```vue
<DynamicForm
  :schema="schema"
  v-model="formData"
  :options="{ useDefaults: true }"
/>
```

### `readonly`

- **Type:** `boolean`
- **Default:** `false`

Make the entire form read-only. Fields are visible but not editable.

```vue
<DynamicForm
  :options="{ readonly: true }"
/>
```

### `disabled`

- **Type:** `boolean`
- **Default:** `false`

Disable the entire form. Fields are visible but grayed out and not interactive.

```vue
<DynamicForm
  :options="{ disabled: true }"
/>
```

### `validationMode`

- **Type:** `'ValidateAndShow' | 'ValidateAndHide' | 'NoValidation'`
- **Default:** `'ValidateAndShow'`

Control validation behavior:

- **`ValidateAndShow`** - Validates as you type and displays errors
- **`ValidateAndHide`** - Validates but hides errors from user (prevents invalid submission)
- **`NoValidation`** - Completely disables validation

```vue
<DynamicForm
  :options="{ validationMode: 'ValidateAndHide' }"
/>
```

### `errorMessages`

- **Type:** `Record<string, Record<string, string>>`
- **Default:** `{}`

Override validation error messages per field and rule.

```typescript
{
  errorMessages: {
    'email': {
      required: 'Email is required',
      format: 'Please enter a valid email address'
    },
    'password': {
      minLength: 'Password must be at least 8 characters'
    }
  }
}
```

**Rule keys:** `required`, `minLength`, `maxLength`, `minimum`, `maximum`, `pattern`, `format`, `minItems`, `maxItems`, `uniqueItems`

### `validators`

- **Type:** `Record<string, ValidatorFunction>`
- **Default:** `{}`

Add custom validation logic beyond JSON Schema capabilities.

```typescript
type ValidatorFunction = (
  value: any,
  allValues: Record<string, any>,
  context?: Record<string, any>
) => boolean | string | Promise<boolean | string>
```

**Sync validator:**
```typescript
{
  validators: {
    confirmPassword: (value, allValues) => {
      return value === allValues.password || 'Passwords must match'
    }
  }
}
```

**Async validator:**
```typescript
{
  validators: {
    username: async (value) => {
      const available = await checkUsername(value)
      return available || 'Username taken'
    }
  }
}
```

### `validatorDebounce`

- **Type:** `number | Record<string, number>`
- **Default:** `300`

Debounce delay in milliseconds for async validators.

**Global debounce:**
```typescript
{ validatorDebounce: 500 }
```

**Per-field debounce:**
```typescript
{
  validatorDebounce: {
    username: 500,
    email: 300
  }
}
```

### `context`

- **Type:** `Record<string, any>`
- **Default:** `{}`

Application context passed to validators and accessible in custom components.

```typescript
{
  context: {
    roles: ['admin', 'user'],
    userId: 123,
    tenant: 'acme-corp'
  }
}
```

Used for role-based access control:

```typescript
const schema = {
  properties: {
    adminField: {
      type: 'string',
      'x-roles': {
        admin: ['view', 'edit'],
        user: []
      }
    }
  }
}
```

### `registry`

- **Type:** `ComponentRegistry`
- **Default:** Default registry with built-in components

Custom component registry for overriding or adding field renderers.

```typescript
import { createDefaultRegistry } from '@quickflo/quickforms-vue'

const registry = createDefaultRegistry()
registry.register('custom-phone', PhoneInput, tester)

// Use in form
<DynamicForm :options="{ registry }" />
```

See [Testers & Registry API](/guide/testers-registry) for details.

### `labels`

- **Type:** `FormLabels`
- **Default:** English labels

Customize UI text for internationalization.

```typescript
interface FormLabels {
  selectPlaceholder?: string  // "Select an option..."
  addItem?: string            // "Add item"
  removeItem?: string         // "Remove"
  submit?: string             // "Submit"
  showPassword?: string       // "Show password"
  hidePassword?: string       // "Hide password"
}
```

**Example:**
```typescript
{
  labels: {
    selectPlaceholder: 'Seleccionar una opción...',
    addItem: 'Agregar elemento',
    submit: 'Enviar'
  }
}
```

### `componentDefaults`

- **Type:** `ComponentDefaults`
- **Default:** Component-specific defaults

Configure default behavior for all components of a given type.

```typescript
interface ComponentDefaults {
  array?: {
    collapsible?: boolean
    defaultCollapsed?: boolean
  }
  number?: {
    prefix?: string
    suffix?: string
  }
}
```

**Example:**
```typescript
{
  componentDefaults: {
    number: {
      prefix: '$'
    }
  }
}
```

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'

const formData = ref({})

const options = {
  useDefaults: true,
  validationMode: 'ValidateAndShow',
  
  errorMessages: {
    email: {
      required: 'Email is required',
      format: 'Invalid email format'
    }
  },
  
  validators: {
    username: async (value) => {
      const available = await checkUsername(value)
      return available || 'Username already taken'
    },
    confirmPassword: (value, allValues) => {
      return value === allValues.password || 'Passwords must match'
    }
  },
  
  validatorDebounce: {
    username: 500
  },
  
  context: {
    roles: ['admin'],
    userId: 123
  },
  
  labels: {
    submit: 'Save Changes',
    addItem: 'Add New Item'
  },
  
  componentDefaults: {
    number: {
      prefix: '$'
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
