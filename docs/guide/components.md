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

A lightweight JSON code editor powered by [CodeMirror 6](https://codemirror.net/) with syntax highlighting, linting, and auto-formatting.

### Handles

- `type: 'object'` with `additionalProperties` but no defined `properties`
- Any field with `x-render: 'jsoneditor'`

### Example Schemas

**Auto-detected (freeform object):**
```typescript
{
  type: 'object',
  title: 'Custom Configuration',
  description: 'Freeform JSON object',
  additionalProperties: {}
}
```

**Basic with height:**
```typescript
{
  type: 'object',
  title: 'API Settings',
  'x-render': 'jsoneditor',
  'x-json-height': '400px'
}
```

**Dark theme:**
```typescript
{
  type: 'object',
  title: 'Config (Dark)',
  'x-render': 'jsoneditor',
  'x-json-height': '500px',
  'x-json-dark-theme': true
}
```

### Features

- **Syntax highlighting**: JSON-specific color coding
- **Real-time linting**: Optional inline error indicators with descriptive messages
- **Line numbers**: Optional gutter with line numbers (disabled by default)
- **Tab indentation**: Press Tab to insert 2 spaces
- **Format shortcut**: Ctrl+. (customizable) to auto-format JSON
- **Cursor preservation**: Format command maintains cursor position
- **Dark mode**: Optional dark theme (Quasar version auto-detects from Quasar Dark mode)

### Keyboard Shortcuts

- **Ctrl+.** (default, customizable): Format JSON with proper indentation (preserves cursor position)
- **Tab**: Insert 2 spaces for indentation
- **Enter**: Insert new line (does not submit form)

### Schema Extensions

| Extension | Type | Default | Description |
|-----------|------|---------|-------------|
| `x-json-height` | `string` | `'300px'` | Editor height (CSS value: '300px', '20rem', etc.) |
| `x-json-dark-theme` | `boolean` | `false` | Use dark theme (Quasar: auto-detects from Dark mode) |
| `x-json-line-numbers` | `boolean` | `false` | Show line numbers in gutter |
| `x-json-lint-gutter` | `boolean` | `false` | Show linting gutter with error indicators |
| `x-json-tab-size` | `number` | `2` | Number of spaces for tab indentation |
| `x-json-indent-with-tab` | `boolean` | `true` | Enable Tab key for indentation |
| `x-json-format-key` | `string` | `'Ctrl-.'` | Keyboard shortcut for formatting (e.g., 'Ctrl-f', 'Alt-Shift-f') |

### Configuration

**Per-field (schema):**
```typescript
{
  type: 'object',
  'x-render': 'jsoneditor',
  'x-json-height': '450px',
  'x-json-dark-theme': true
}
```

**Global defaults (Quasar):**
```typescript
const formOptions = {
  quickformsDefaults: {
    jsoneditor: {
      height: '400px',
      darkTheme: false,      // Or omit to auto-detect from Quasar Dark mode
      lineNumbers: false,    // Show line numbers (disabled by default)
      lintGutter: false,     // Show error indicators (disabled by default)
      tabSize: 2,            // Spaces per tab
      indentWithTab: true,   // Enable Tab key
      formatKey: 'Ctrl-.'    // Format shortcut (default)
    }
  }
}
```

**Global defaults (Vue):**
```typescript
const formOptions = {
  componentDefaults: {
    jsonEditor: {
      formatKey: 'Ctrl-.'    // Customize format shortcut
    }
  }
}
```

**Priority order (highest to lowest):**
1. Schema `x-json-*` properties
2. `quickformsDefaults.jsoneditor` (Quasar) or `componentDefaults.jsonEditor` (Vue)
3. Auto-detect from `$q.dark.isActive` (Quasar only, for darkTheme)
4. Defaults: `{ height: '300px', darkTheme: false, lineNumbers: false, lintGutter: false, tabSize: 2, indentWithTab: true, formatKey: 'Ctrl-.' }`

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

**Column headers:**
```typescript
{
  type: 'object',
  title: 'API Configuration',
  additionalProperties: { type: 'string' },
  'x-quickforms-quasar': {
    showHeaders: true,  // Default: false
    keyLabel: 'Parameter',  // Default: 'Key'
    valueLabel: 'Value'  // Default: 'Value'
  }
}
```

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
      color: 'secondary',
      class: 'text-bold',
      style: { height: '50px' }
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
  componentDefaults: {
    // Native QInput props applied to ALL key/value input fields
    keyvalue: {
      filled: true,
      color: 'primary',
      dense: true
    }
  },
  quickformsDefaults: {
    // QuickForms button features for key-value fields
    keyvalue: {
      showHeaders: false,  // Show 'Key' and 'Value' column headers
      keyLabel: 'Key',     // Customize key column header
      valueLabel: 'Value', // Customize value column header
      addButtonPosition: 'bottom-left',
      addButton: {
        label: 'Add Item',
        icon: 'add',
        color: 'primary',
        class: '',         // Add CSS classes
        style: {}          // Add inline styles
      },
      removeButton: {
        icon: 'close',
        color: 'negative'
      }
    }
  }
}
```

**Customize input styling:**
```typescript
{
  type: 'object',
  title: 'Styled Parameters',
  additionalProperties: { type: 'string' },
  'x-quasar-props': {
    filled: true,
    color: 'purple',
    labelColor: 'purple'
  }
}
```

Note: `componentDefaults.keyvalue` and `x-quasar-props` accept any native Quasar QInput props and apply them to both the key and value input fields.

---

## JsonLogicBuilderField

A visual condition builder for [JSONLogic](https://jsonlogic.com/) expressions. Enables users to build complex conditions with AND/OR grouping through an intuitive UI.

### Handles

- Any field with `x-render: 'condition-builder'` or `x-render: 'jsonlogic-builder'`

### Example Schema

**Basic condition:**
```typescript
{
  type: 'object',
  title: 'Trigger Condition',
  description: 'When should this action execute?',
  'x-render': 'condition-builder'
}
```

**Filter rules:**
```typescript
{
  type: 'object',
  title: 'Filter Rules',
  description: 'Define filtering criteria',
  'x-render': 'jsonlogic-builder'
}
```

### Features

- **Visual condition rows**: `[left value] [operator] [right value]`
- **AND/OR grouping**: Toggle between match ALL or match ANY
- **Nested groups**: Create complex nested AND/OR logic
- **14 operators**: equals, not equals, greater than, less than, contains, starts with, ends with, in list, matches regex, is true, is false, is empty, is not empty
- **Customizable operator display**: Show operators as icons, symbols, short text, or verbose labels
- **Operator filtering**: Limit which operators are available for specific use cases
- **Advanced mode**: Toggle to raw JSON editor for complex expressions
- **Bidirectional**: Converts between visual UI and JSONLogic format automatically
- **Slot support**: Custom value inputs via `#left-input` and `#right-input` slots

### Customizing Operator Display

The operator dropdown is **autocomplete-enabled** with smart shortcuts:
- Type `>=` to find "greater or equal"
- Type `!=` to find "not equals"
- Type `contains` or `has` to find "contains"
- Type `empty` to find "is empty" and "is not empty"

**Display Modes:**
- `'short'` - Text labels (default, e.g., "equals", "contains", "is empty")
- `'symbol'` - Math symbols for comparisons, text for others (e.g., `=`, `≠`, "contains")
- `'icon'` - Icons with labels (most visual)
- `'verbose'` - Full labels with symbols (e.g., `= equals`)

**Via schema:**
```typescript
{
  type: 'object',
  'x-render': 'condition-builder',
  'x-operator-display': 'symbol', // or 'icon', 'short', 'verbose'
  'x-allowed-operators': ['==', '!=', '>', '<', '>=', '<='] // Limit to basic comparisons
}
```

**Via componentDefaults:**
```typescript
const options = {
  quickformsDefaults: {
    jsonlogicbuilder: {
      operatorDisplayMode: 'short',  // Default: clean text labels
      allowedOperators: ['==', '!=', 'contains', 'isEmpty']  // Optional: limit operators
    }
  }
}
```

### Template Syntax Mode

By default, variable references like `user.status` are converted to JSONLogic's `{ "var": "user.status" }` format. If your application uses a template engine (like Handlebars), you can enable **template syntax mode** to preserve `{{ }}` expressions as strings.

**When enabled:**
- Values like <code v-pre>{{ user.status }}</code> are kept as strings in the JSONLogic output
- Your application is responsible for resolving templates before JSONLogic evaluation
- Existing `{ "var": ... }` values are displayed as <code v-pre>{{ ... }}</code> in the UI for backwards compatibility

**Via schema:**
```typescript
{
  type: 'object',
  'x-render': 'condition-builder',
  'x-use-template-syntax': true
}
```

**Via componentDefaults:**
```typescript
const options = {
  quickformsDefaults: {
    jsonlogicbuilder: {
      useTemplateSyntax: true
    }
  }
}
```

**Output comparison:**

| Mode | User types | JSONLogic output |
|------|------------|------------------|
| Default (`false`) | `user.status` | `{ "var": "user.status" }` |
| Template (`true`) | <code v-pre>{{ user.status }}</code> | <code v-pre>"{{ user.status }}"</code> |

**Loading existing data:**

When `useTemplateSyntax: true`, the builder automatically converts existing `{ "var": ... }` definitions to <code v-pre>{{ ... }}</code> format for display, ensuring backwards compatibility.

### Supported Operators

| Operator | Symbol | Text (default) | Description | Right Value |
|----------|--------|----------------|-------------|-------------|
| `==` | = | equals | Equals | Required |
| `!=` | ≠ | not equals | Not equals | Required |
| `>` | > | greater than | Greater than | Required |
| `>=` | ≥ | greater or equal | Greater or equal | Required |
| `<` | < | less than | Less than | Required |
| `<=` | ≤ | less or equal | Less or equal | Required |
| `contains` | - | contains | String contains substring | Required |
| `startsWith` | - | starts with | Starts with | Required |
| `endsWith` | - | ends with | Ends with | Required |
| `in` | - | in list | Value in list | Required (comma-separated) |
| `matches` | - | matches | Regex match | Required (pattern) |
| `isTrue` | - | is true | Is true | Not needed |
| `isFalse` | - | is false | Is false | Not needed |
| `isEmpty` | - | is empty | Empty string, null, or undefined | Not needed |
| `isNotEmpty` | - | is not empty | Has value | Not needed |

### UI Layout

```
Match: [ALL] [ANY] of these conditions

┌─────────────┐  ┌────────────┐  ┌─────────────┐
│ user.age    │  │ > greater  │  │ 18          │  [×]
└─────────────┘  └────────────┘  └─────────────┘
                      AND
┌─────────────┐  ┌────────────┐  ┌─────────────┐
│ user.status │  │ = equals   │  │ active      │  [×]
└─────────────┘  └────────────┘  └─────────────┘

[+ Add condition]  [+ Add group]
```

### JSONLogic Output

The visual builder produces standard JSONLogic:

```json
{
  "and": [
    { ">": [{ "var": "user.age" }, 18] },
    { "==": [{ "var": "user.status" }, "active"] }
  ]
}
```

### Nested Groups

Click "Add group" to create nested AND/OR logic:

```
Match: [ALL] of these conditions

│ order.total │ │ > │ │ 100 │

┌─ ANY ────────────────────────────────┐
│  │ user.role │ │ = │ │ admin │       │
│  │ user.role │ │ = │ │ manager │     │
│                          [+ Add]     │
└──────────────────────────────────────┘
```

Produces:
```json
{
  "and": [
    { ">": [{ "var": "order.total" }, 100] },
    {
      "or": [
        { "==": [{ "var": "user.role" }, "admin"] },
        { "==": [{ "var": "user.role" }, "manager"] }
      ]
    }
  ]
}
```

### Custom Value Inputs (Slots)

Provide custom input components for left/right values:

```vue
<QuasarJsonLogicBuilderField :schema="schema" :path="path">
  <template #left-input="{ value, onChange, disabled, readonly }">
    <MyCustomInput
      :model-value="value"
      @update:model-value="onChange"
      :disable="disabled"
    />
  </template>
  
  <template #right-input="{ value, onChange, disabled, readonly, operator }">
    <MyCustomInput
      :model-value="value"
      @update:model-value="onChange"
      :disable="disabled"
    />
  </template>
</QuasarJsonLogicBuilderField>
```

### Utilities

The package exports utilities for working with JSONLogic:

```typescript
import {
  toJsonLogic,        // Convert visual conditions → JSONLogic
  fromJsonLogic,      // Convert JSONLogic → visual conditions
  createEmptyCondition,
  createEmptyGroup,
  createEmptyRoot,
  OPERATORS,          // List of supported operators
  getOperatorInfo,    // Get operator metadata
} from '@quickflo/quickforms-quasar'
```

### Types

```typescript
import type {
  ComparisonOperator,
  SimpleCondition,
  ConditionGroup,
  ConditionItem,
  ConditionRoot,
  JsonLogic,
  ToJsonLogicOptions,
  FromJsonLogicOptions,
} from '@quickflo/quickforms-quasar'
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
