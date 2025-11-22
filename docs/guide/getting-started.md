# Getting Started

Get up and running with QuickForms in minutes.

## Installation

::: code-group

```sh [pnpm]
pnpm add @quickflo/quickforms @quickflo/quickforms-vue @quickflo/quickforms-quasar
```

```sh [npm]
npm install @quickflo/quickforms @quickflo/quickforms-vue @quickflo/quickforms-quasar
```

```sh [yarn]
yarn add @quickflo/quickforms @quickflo/quickforms-vue @quickflo/quickforms-quasar
```

:::

::: info Plain Vue Users
If you're using plain Vue instead of Quasar, you only need `@quickflo/quickforms` and `@quickflo/quickforms-vue`.
:::

## Your First Form

::: tip
Create a simple contact form with name, email, and message fields.
:::
### Quasar

::: tip Best Practice
For Quasar projects, create a boot file to configure QuickForms once and use it throughout your app.
:::

**1. Create `src/boot/quickforms.ts`:**

```typescript
import { boot } from 'quasar/wrappers'
import { createQuasarRegistry, QuasarFormOptions } from '@quickflo/quickforms-quasar'

export const registry = createQuasarRegistry()

export const options: QuasarFormOptions = {
  registry,
  componentDefaults: {
    global: {
      outlined: true,
      dense: true,
    },
    select: {
      outlined: true,
    },
  },
}

export default boot(({ app }) => {
  console.log('QuickForms boot executed')
  // Register custom components here if needed
})
```

**2. Register the boot file in `quasar.config.js`:**

```javascript
boot: [
  'quickforms'
]
```

**3. Use in your components:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'
import { options } from 'boot/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      minLength: 2
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email Address'
    },
    message: {
      type: 'string',
      title: 'Message',
      format: 'textarea'
    }
  },
  required: ['name', 'email', 'message']
}

const formData = ref({})
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="options"
  />
</template>
```

This approach centralizes your QuickForms configuration and makes it easy to register custom components in one place.

See [Quasar Package Docs](/guide/quasar) for all Quasar-specific options like `componentDefaults`, `x-quasar-props`, and `x-quickforms-quasar` features.

### Plain Vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  // Same schema as above
}

const formData = ref({})
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
  />
</template>
```

See [Vue Package Docs](/guide/vue) for plain Vue component options.

## What QuickForms Does

QuickForms will:
- ✅ Render appropriate input types for each field
- ✅ Show email validation for the email field
- ✅ Mark required fields with asterisks
- ✅ Display validation errors as you type
- ✅ Two-way bind data via `v-model`

## Understanding the Schema

The `schema` object follows [JSON Schema Draft 7+](https://json-schema.org/) specification:

```typescript
{
  type: 'object',          // Root must be an object
  properties: {            // Define form fields
    name: {
      type: 'string',      // Field type
      title: 'Full Name',  // Display label
      minLength: 2         // Validation rule
    }
  },
  required: ['name']       // Required fields array
}
```

## Form Data Binding

QuickForms uses `v-model` for two-way data binding:

```vue
<script setup lang="ts">
const formData = ref({
  name: 'John Doe',        // Pre-fill values
  email: 'john@example.com'
})

// Watch for changes
watch(formData, (newData) => {
  console.log('Form data changed:', newData)
})
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
  />
  
  <!-- Display current form state -->
  <pre>{{ formData }}</pre>
</template>
```

## Form Options

Customize form behavior with the `options` prop:

```vue
<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="{
      useDefaults: true,                 // Pre-fill with default values from schema
      validationMode: 'ValidateAndShow', // Control error display
      readonly: false,                   // Make entire form read-only
      disabled: false                    // Disable entire form
    }"
  />
</template>
```

**See Complete Options:**
- [Form Options API](/guide/form-options) - Base options (validation, labels, etc.)
- [Quasar Package Options](/guide/quasar#configuration-options) - Quasar-specific (`componentDefaults`, `x-quasar-props`, etc.)
- [Vue Package Options](/guide/vue#components) - Plain Vue component options

### Validation Modes

- **`ValidateAndShow`** (default) - Validates as you type and shows errors
- **`ValidateAndHide`** - Validates silently, prevents invalid submission but hides errors
- **`NoValidation`** - Disables all validation

```vue
<DynamicForm
  :schema="schema"
  v-model="formData"
  :options="{ validationMode: 'ValidateAndHide' }"
/>
```

## Events

QuickForms emits events for monitoring form state:

```vue
<script setup lang="ts">
const handleValidation = (result: { valid: boolean; errors: Record<string, string> }) => {
  console.log('Form is valid:', result.valid)
  console.log('Validation errors:', result.errors)
}
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    @validation="handleValidation"
  />
</template>
```

**Available Events:**
- `@update:modelValue` - Emitted when form data changes (automatic with `v-model`)
- `@validation` - Emitted when validation state changes

QuickForms uses CSS custom properties for theming. Override them globally:

```css
:root {
  --quickform-color-primary: #8b5cf6;
  --quickform-color-error: #ef4444;
  --quickform-radius-md: 0.75rem;
  --quickform-spacing-md: 1rem;
}
```

Or scope to a specific form:

```vue
<template>
  <div class="my-form">
    <DynamicForm :schema="schema" v-model="formData" />
  </div>
</template>

<style scoped>
.my-form {
  --quickform-color-primary: #10b981; /* Green theme */
}
</style>
```

See the [Theming Guide](/guide/theming) for complete customization options.

## Next Steps

- [Schema Basics](/guide/schema-basics) - Deep dive into JSON Schema
- [Field Types](/guide/field-types) - Learn about all supported field types
- [Validation](/guide/validation) - Advanced validation techniques
- [Examples](/guide/examples/basic-form) - See more complete examples
