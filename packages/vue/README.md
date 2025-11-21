# @quickforms/vue

Vue 3 bindings for QuickForms - JSON Schema form generator.

## Features

- **DynamicForm** - Main form component with VeeValidate integration
- **Field Components** - Pre-built components for basic types (string, number, boolean, enum, date)
- **FieldRenderer** - Automatic component selection based on schema
- **VeeValidate Integration** - Form validation and state management
- **TypeScript** - Full type safety

## Installation

```bash
pnpm add @quickforms/vue vue vee-validate
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DynamicForm, type JSONSchema } from '@quickforms/vue';

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
      title: 'Email'
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 0
    }
  },
  required: ['name', 'email']
};

const formData = ref({});

const handleSubmit = (data: any) => {
  console.log('Form submitted:', data);
};
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    @submit="handleSubmit"
  />
</template>
```

## Components

### DynamicForm

Main form component that generates form fields from JSON Schema.

**Props:**
- `schema: JSONSchema` - JSON Schema definition
- `modelValue?: Record<string, any>` - Form data (v-model)
- `options?: FormOptions` - Form configuration

**Events:**
- `@update:modelValue` - Emitted when form data changes
- `@submit` - Emitted when form is submitted with valid data

**Slots:**
- `actions` - Custom submit button area

### Field Components

Pre-built field components:
- `StringField` - Text inputs, email, url, textarea
- `NumberField` - Number inputs with min/max/step
- `BooleanField` - Checkbox
- `EnumField` - Select dropdown
- `DateField` - Date, time, datetime inputs

Each field supports:
- Validation via VeeValidate
- Error messages
- Required field indicators
- Disabled/readonly states
- Accessibility (ARIA labels)

## Composables

### useFormField

Hook for individual field state management.

```typescript
const { value, errorMessage, label, hint } = useFormField(path, schema);
```

### useFormContext

Access form-level context.

```typescript
const context = useFormContext();
// { readonly, disabled, schema, rootPath }
```

## Customization

### Custom Submit Button

```vue
<template>
  <DynamicForm :schema="schema" v-model="formData" @submit="handleSubmit">
    <template #actions="{ isValid, errors }">
      <button type="submit" :disabled="!isValid">
        Save Form
      </button>
      <button type="button" @click="cancel">
        Cancel
      </button>
    </template>
  </DynamicForm>
</template>
```

### Form Options

```vue
<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="{
      readonly: false,
      disabled: false
    }"
  />
</template>
```

## Styling

All components use scoped styles with CSS classes prefixed with `quickform-`. You can override styles globally or use custom field components.

## License

MIT
