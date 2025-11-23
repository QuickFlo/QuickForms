# Components API

QuickForms provides pre-built components for all standard JSON Schema types.

## DynamicForm

Main form component that generates fields from JSON Schema.

### Props

```typescript
interface DynamicFormProps {
  schema: JSONSchema            // JSON Schema definition
  modelValue: any               // Form data (v-model)
  options?: FormOptions         // Form configuration
}
```

### Events

```typescript
interface DynamicFormEmits {
  'update:modelValue': (value: any) => void     // Form data changed
  'validation': (result: ValidationResult) => void  // Validation state changed
}

interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}
```

### Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    email: { type: 'string', format: 'email', title: 'Email' }
  },
  required: ['name', 'email']
}

const formData = ref({})

const handleValidation = (result: ValidationResult) => {
  console.log('Valid:', result.valid)
  console.log('Errors:', result.errors)
}
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="{ validationMode: 'ValidateAndShow' }"
    @validation="handleValidation"
  />
</template>
```

### Slots

None. The `DynamicForm` component automatically renders fields based on the schema. For customization, use the [component registry](/guide/custom-components).

---

## FieldRenderer

Internal component that selects and renders the appropriate field component based on schema.

### Props

```typescript
interface FieldRendererProps {
  schema: JSONSchema
  path: string
}
```

### Usage

Used internally by `DynamicForm` and container fields (`ObjectField`, `ArrayField`, `OneOfField`). You typically won't use this directly unless building a custom layout component.

```vue
<template>
  <FieldRenderer :schema="fieldSchema" :path="fieldPath" />
</template>
```

---

## Field Components

Pre-built components for each field type. All field components share the same props interface:

### Common Props

```typescript
interface FieldProps {
  schema: JSONSchema    // Field's JSON Schema
  path: string          // Field path in form data
  disabled?: boolean    // Disable field input
  readonly?: boolean    // Make field read-only
}
```

---

## StringField

Renders text inputs for string fields.

### Handles

- `type: 'string'`
- Various formats: `email`, `url`, `password`, `textarea`

### Example Schema

```typescript
{
  type: 'string',
  title: 'Full Name',
  minLength: 2,
  maxLength: 100
}
```

**Format variants:**
```typescript
// Email
{ type: 'string', format: 'email' }

// URL
{ type: 'string', format: 'url' }

// Password
{ type: 'string', format: 'password' }

// Textarea
{ type: 'string', format: 'textarea' }
```

---

## NumberField

Renders number inputs.

### Handles

- `type: 'number'`
- `type: 'integer'`

### Example Schema

```typescript
{
  type: 'number',
  title: 'Age',
  minimum: 0,
  maximum: 120
}
```

```typescript
{
  type: 'integer',
  title: 'Quantity',
  multipleOf: 5
}
```

---

## BooleanField

Renders checkboxes for boolean values.

### Handles

- `type: 'boolean'`

### Example Schema

```typescript
{
  type: 'boolean',
  title: 'Accept Terms',
  default: false
}
```

---

## EnumField

Renders select dropdowns for enum values.

### Handles

- Fields with `enum` property

### Example Schema

```typescript
{
  type: 'string',
  title: 'Country',
  enum: ['US', 'CA', 'UK', 'DE'],
  'x-enum-labels': {
    US: 'United States',
    CA: 'Canada',
    UK: 'United Kingdom',
    DE: 'Germany'
  }
}
```

**Multiple selection:**
```typescript
{
  type: 'array',
  title: 'Tags',
  items: {
    type: 'string',
    enum: ['javascript', 'typescript', 'vue', 'react']
  },
  uniqueItems: true
}
```

---

## DateField

Renders date/time pickers.

### Handles

- `format: 'date'`
- `format: 'time'`
- `format: 'date-time'`

### Example Schema

```typescript
// Date
{
  type: 'string',
  format: 'date',
  title: 'Birth Date'
}

// Time
{
  type: 'string',
  format: 'time',
  title: 'Appointment Time'
}

// DateTime
{
  type: 'string',
  format: 'date-time',
  title: 'Event Start'
}
```

---

## ObjectField

Renders nested object fields.

### Handles

- `type: 'object'`

### Example Schema

```typescript
{
  type: 'object',
  title: 'Address',
  properties: {
    street: { type: 'string', title: 'Street' },
    city: { type: 'string', title: 'City' },
    zip: { type: 'string', title: 'ZIP Code' }
  },
  required: ['street', 'city']
}
```

**Rendering:**
- Plain Vue: Simple wrapper with nested fields
- Quasar: Expandable card with `QExpansionItem`

---

## JsonField

Renders a JSON editor for freeform object configuration.

### Handles

- `type: 'object'` with `additionalProperties` but no defined `properties`
- Any field with `x-render: 'jsoneditor'`

### Example Schema

**Auto-detected (freeform object):**
```typescript
{
  type: 'object',
  title: 'Custom Configuration',
  description: 'Freeform JSON object',
  additionalProperties: {}
}
```

**Explicit via x-render:**
```typescript
{
  type: 'object',
  title: 'API Settings',
  description: 'Configuration in JSON format',
  'x-render': 'jsoneditor',
  'x-rows': 10  // Control textarea height
}
```

**With custom props (Quasar):**
```typescript
{
  type: 'object',
  title: 'Metadata',
  'x-render': 'jsoneditor',
  'x-rows': 8,
  'x-quasar-props': {
    dense: false,
    color: 'secondary'
  },
  'x-quickforms-quasar': {
    prependIcon: 'settings',
    iconColor: 'primary',
    showFormatHint: false  // Hide info icon
  }
}
```

**Hide format hint (Vue):**
```typescript
{
  type: 'object',
  'x-render': 'jsoneditor',
  'x-show-format-hint': false  // Hide info icon
}
```

### Features

- **Tab indentation**: Press Tab to insert 2 spaces
- **Format shortcut**: Press Ctrl+Space to auto-format JSON
- **Real-time validation**: Shows parse errors as you type
- **Monospace font**: Better readability for JSON
- **Info icon**: Hover tooltip showing format shortcut (can be hidden)
- **No auto-formatting**: Only formats on initial load or manual trigger

### Keyboard Shortcuts

- **Ctrl+Space**: Format JSON with proper indentation
- **Tab**: Insert 2 spaces for indentation
- **Enter**: Insert new line (does not submit form)

### Configuration

**Global defaults (Quasar):**
```typescript
const formOptions = {
  componentDefaults: {
    jsoneditor: {
      dense: true,
      color: 'primary',
      rows: 12
    }
  },
  quickformsDefaults: {
    jsoneditor: {
      prependIcon: 'code',
      iconColor: 'grey-7',
      showFormatHint: true  // Default: true
    }
  }
}
```

---

## KeyValueField

Renders a dynamic key-value pair editor for record types.

### Handles

- `type: 'object'` with typed `additionalProperties` (e.g., `{ type: 'string' }`) but no defined `properties`

### Example Schema

**Basic record type:**
```typescript
{
  type: 'object',
  title: 'Additional Parameters',
  description: 'Dynamic key-value pairs',
  additionalProperties: {
    type: 'string'
  }
}
```

**OAuth headers example:**
```typescript
{
  type: 'object',
  title: 'Custom OAuth Headers',
  description: 'Add custom headers for OAuth requests',
  additionalProperties: {
    type: 'string'
  }
}
```

### Features

- **Dynamic rows**: Add/remove key-value pairs
- **Type-safe**: Values are typed based on `additionalProperties.type`
- **Clean UI**: Grid layout with aligned inputs
- **Theme inheritance**: Inherits from parent Quasar theme (no hardcoded colors)
- **Validation**: Empty keys are automatically filtered out
- **Button customization**: Customize add/remove buttons via `x-quickforms-quasar`

### UI Behavior

- **Add button**: Creates a new empty key-value pair
- **Remove button**: Deletes a specific pair
- **Auto-cleanup**: Pairs with empty keys are not saved to form data

### Rendering

- **Plain Vue**: Standard HTML inputs with responsive grid layout
- **Quasar**: `QInput` components with Quasar styling and icons

### Button Customization (Quasar)

**Button positioning:**
```typescript
{
  type: 'object',
  title: 'Environment Variables',
  additionalProperties: { type: 'string' },
  'x-quickforms-quasar': {
    addButtonPosition: 'bottom-right',  // Options: 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'bottom-center'
    addButton: {
      label: 'Add Variable',
      icon: 'add_circle',
      color: 'secondary'
    },
    removeButton: {
      icon: 'delete',
      color: 'negative'
    }
  }
}
```

**Position options:**
- `top-left` - Button appears above the grid, left-aligned
- `top-right` - Button appears on the same line as the label, right-aligned
- `bottom-left` - Button appears below the grid, left-aligned (default)
- `bottom-right` - Button appears below the grid, right-aligned
- `bottom-center` - Button appears below the grid, centered and full-width

**Global defaults:**
```typescript
const formOptions = {
  quickformsDefaults: {
    keyvalue: {
      addButtonPosition: 'bottom-left',
      addButton: {
        label: 'Add Item',
        icon: 'add',
        color: 'primary'
      },
      removeButton: {
        icon: 'close',
        color: 'negative'
      }
    }
  }
}
```

---

## ArrayField

Renders dynamic array fields with add/remove buttons.

### Handles

- `type: 'array'`

### Example Schema

```typescript
// Simple array
{
  type: 'array',
  title: 'Tags',
  items: { type: 'string' }
}

// Array of objects
{
  type: 'array',
  title: 'Contacts',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      phone: { type: 'string', title: 'Phone' }
    }
  },
  minItems: 1,
  maxItems: 5
}
```

**Features:**
- Add/remove buttons
- Respects `minItems` and `maxItems`
- Drag-to-reorder (if enabled)

---

## OneOfField

Renders conditional schemas with a selector.

### Handles

- Schemas with `oneOf`

### Example Schema

```typescript
{
  oneOf: [
    {
      type: 'object',
      title: 'Individual',
      properties: {
        name: { type: 'string', title: 'Full Name' },
        ssn: { type: 'string', title: 'SSN' }
      }
    },
    {
      type: 'object',
      title: 'Business',
      properties: {
        company: { type: 'string', title: 'Company Name' },
        ein: { type: 'string', title: 'EIN' }
      }
    }
  ]
}
```

**Rendering:**
- Dropdown to select which schema to use
- Dynamically renders fields based on selection

---

## AllOfField

Renders merged schemas (intersection).

### Handles

- Schemas with `allOf`

### Example Schema

```typescript
{
  allOf: [
    {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' }
      }
    },
    {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', title: 'Email' }
      }
    }
  ]
}
```

**Behavior:**
- Merges all schemas in `allOf` array
- Renders as a single flat object

---

## HiddenField

Renders a hidden input (no visual output).

### Handles

- Fields with `'x-hidden': true`

### Example Schema

```typescript
{
  type: 'string',
  'x-hidden': true,
  default: 'hidden-value'
}
```

**Use Cases:**
- Hidden form fields
- Tracking fields
- Server-side data

---

## Customizing Built-in Components

You cannot modify built-in components directly, but you can:

### 1. Override with Custom Component

Register a custom component with higher priority:

```typescript
import { createDefaultRegistry, rankWith, isStringType } from '@quickflo/quickforms-vue'
import CustomStringField from './CustomStringField.vue'

const registry = createDefaultRegistry()

// Override default StringField (priority 2) with priority 20
registry.register('custom-string', CustomStringField, rankWith(20, isStringType))
```

### 2. Use Component Defaults (Quasar)

Configure global defaults for all components:

```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'

const options = {
  registry: createQuasarRegistry(),
  componentDefaults: {
    global: {
      outlined: true,
      dense: true
    },
    input: {
      clearable: true
    }
  }
}
```

### 3. Per-Field Overrides

Use schema extensions:

```typescript
{
  type: 'string',
  title: 'Email',
  'x-component-props': {
    placeholder: 'you@example.com',
    autocomplete: 'email'
  }
}
```

---

## Component Props Reference

All field components receive these props automatically:

| Prop | Type | Description |
|------|------|-------------|
| `schema` | `JSONSchema` | Field's JSON Schema definition |
| `path` | `string` | Field path (e.g., `"email"`, `"user.name"`) |
| `disabled` | `boolean` | Form-level disabled state |
| `readonly` | `boolean` | Form-level readonly state |

Field components use `useFormField(path, schema)` to access:
- `value` - Reactive field value
- `errorMessage` - Validation error
- `label` - Display label
- `hint` - Hint text
- `required` - Required status

See [Composables API](/guide/composables) for details.

---

## Next Steps

- [Custom Components](/guide/custom-components) - Register your own components
- [Composables API](/guide/composables) - Build custom field components
- [Testers & Registry](/guide/testers-registry) - Component selection system
