# Basic Form Example

A simple contact form demonstrating the fundamentals of QuickForms.

## Quasar Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'
import type { JSONSchema } from '@quickflo/quickforms'

const registry = createQuasarRegistry()

const schema: JSONSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      minLength: 2,
      'x-hint': 'Enter your first and last name'
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email Address',
      'x-hint': 'We\'ll never share your email'
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 18,
      maximum: 120,
      'x-hint': 'You must be 18 or older'
    },
    newsletter: {
      type: 'boolean',
      title: 'Subscribe to newsletter',
      default: false
    },
    role: {
      type: 'string',
      enum: ['user', 'admin', 'moderator'],
      title: 'Role',
      default: 'user'
    }
  },
  required: ['name', 'email', 'age']
}

const formData = ref({})

const options = {
  registry,
  useDefaults: true,
  componentDefaults: {
    global: {
      outlined: true,
      dense: true
    }
  }
}
</script>

<template>
  <q-page padding>
    <div class="q-gutter-md" style="max-width: 600px; margin: 0 auto">
      <div class="text-h4">Contact Form</div>
      
      <DynamicForm
        :schema="schema"
        v-model="formData"
        :options="options"
      />
      
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Current Form Data</div>
          <pre class="text-caption">{{ JSON.stringify(formData, null, 2) }}</pre>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
```

## Plain Vue Example

If you're not using Quasar, use the plain Vue package:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      minLength: 2,
      description: 'Enter your first and last name'
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email Address',
      description: 'We\'ll never share your email'
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 18,
      maximum: 120,
      description: 'You must be 18 or older'
    },
    newsletter: {
      type: 'boolean',
      title: 'Subscribe to newsletter',
      default: false
    },
    role: {
      type: 'string',
      enum: ['user', 'admin', 'moderator'],
      title: 'Role',
      default: 'user'
    }
  },
  required: ['name', 'email', 'age']
}

const formData = ref({})
</script>

<template>
  <div class="example-container">
    <h1>Contact Form</h1>
    
    <DynamicForm
      :schema="schema"
      v-model="formData"
      :options="{ useDefaults: true }"
    />
    
    <div class="form-state">
      <h3>Current Form Data:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.example-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-state {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.form-state pre {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
}
</style>
```

## Key Differences

**Quasar version:**
- Uses `createQuasarRegistry()` to get pre-styled Quasar components
- Fields render as `QInput`, `QSelect`, `QCheckbox` automatically
- Supports `x-hint` for hints (instead of `description`)
- Uses `componentDefaults` for consistent styling (outlined, dense)
- Wraps in `q-page` with Quasar spacing utilities

**Plain Vue version:**
- No registry needed - uses default components
- Fields render as plain HTML inputs with custom styling
- Uses `description` for hints
- Custom CSS for styling

## What's Happening?

### Schema Definition
```typescript
const schema: JSONSchema = {
  type: 'object',           // Root type
  properties: { /* ... */ }, // Field definitions
  required: ['name', 'email', 'age']  // Required fields
}
```

### Field Types
- **`name`** - String with minimum length validation
- **`email`** - String with email format validation
- **`age`** - Number with min/max constraints
- **`newsletter`** - Boolean rendered as checkbox
- **`role`** - Enum rendered as select dropdown

### Validation
QuickForms automatically:
- Validates email format
- Checks minimum string length
- Validates number ranges
- Shows required field indicators (*)
- Displays error messages as you type

### Two-Way Binding
The `v-model` directive creates reactive two-way data binding:

```vue
<DynamicForm v-model="formData" />
```

Changes to the form update `formData`, and programmatic updates to `formData` update the form.

### Using Form Data
Since data is available via `v-model`, you can use it however you want:

```typescript
const saveForm = () => {
  // formData.value contains all form data
  await api.post('/contacts', formData.value)
}

const resetForm = () => {
  formData.value = {}
}
```

## Try It Yourself

1. Leave required fields empty and try to submit
2. Enter an invalid email address
3. Set age below 18 or above 120
4. Watch the form data update in real-time

## Next Steps

- [Nested Objects](/guide/examples/nested-objects) - Handle complex object structures
- [Arrays](/guide/examples/arrays) - Work with dynamic lists
- [Custom Validation](/guide/examples/custom-validation) - Add your own validation logic
