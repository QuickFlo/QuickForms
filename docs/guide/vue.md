# @quickflo/quickforms-vue

Vue 3 bindings for QuickForms.

## Installation

::: code-group

```sh [pnpm]
pnpm add @quickflo/quickforms @quickflo/quickforms-vue
```

```sh [npm]
npm install @quickflo/quickforms @quickflo/quickforms-vue
```

```sh [yarn]
yarn add @quickflo/quickforms @quickflo/quickforms-vue
```

:::

## Components

### DynamicForm

Main form component that generates fields from JSON Schema.

```vue
<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="options"
    @validation="handleValidation"
  />
</template>
```

**Props:**
- `schema` - JSON Schema definition
- `modelValue` - Form data (v-model)
- `options` - Form configuration

**Events:**
- `@update:modelValue` - Form data changed
- `@validation` - Validation state changed

See [Form Options API](/guide/form-options) for complete options reference.

### Field Components

Pre-built components for all field types:
- `StringField` - Text inputs
- `NumberField` - Number inputs
- `BooleanField` - Checkboxes
- `EnumField` - Select dropdowns
- `DateField` - Date/time pickers
- `ObjectField` - Nested objects
- `ArrayField` - Dynamic arrays
- `OneOfField` - Conditional schemas

## Composables

### useFormField

Hook for field state management.

```typescript
const { value, errorMessage, label, hint } = useFormField(path, schema)
```

### useFormContext

Access form-level context.

```typescript
const context = useFormContext()
// { readonly, disabled, schema, rootPath, context }
```

## Next Steps

- [Getting Started](/guide/getting-started) - Build your first form
- [API Reference](/guide/components) - Complete component documentation
- [Examples](/guide/examples/basic-form) - See QuickForms in action
