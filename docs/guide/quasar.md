# @quickflo/quickforms-quasar

Quasar UI components for QuickForms with beautiful, pre-styled form fields.

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


## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import { createQuasarRegistry, type QuasarFormOptions } from '@quickflo/quickforms-quasar'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Full Name' },
    email: { type: 'string', format: 'email', title: 'Email' },
    bio: { type: 'string', format: 'textarea', title: 'Bio' }
  },
  required: ['name', 'email']
}

const formData = ref({})

const options: QuasarFormOptions = {
  registry: createQuasarRegistry(),
  componentDefaults: {
    global: { outlined: true, dense: true }
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

::: tip Type Safety
Always use `QuasarFormOptions` when configuring Quasar forms. This provides proper TypeScript support for Quasar-specific `componentDefaults` like `QInputProps`, `QSelectProps`, etc.
:::

## Components

The Quasar package provides pre-built Quasar-wrapped components:

- **QuasarStringField** - `QInput` for text, email, URL, password, textarea
- **QuasarNumberField** - `QInput` with `type="number"`
- **QuasarBooleanField** - `QCheckbox`
- **QuasarEnumField** - `QSelect` for enums
- **QuasarDateField** - `QInput` with `QDate` popup
- **QuasarTimeField** - `QInput` with `QTime` popup
- **QuasarDateTimeField** - `QInput` with `QDate` and `QTime` popups
- **QuasarObjectField** - `QExpansionItem` for nested objects
- **QuasarArrayField** - `QCard` with add/remove buttons
- **QuasarTagsField** - `QSelect` chips input for free-form arrays (emails, keywords)
- **QuasarOneOfField** - `QSelect` for conditional schemas

## Configuration Options

### Understanding `componentDefaults` vs `quickformsDefaults`

**`componentDefaults`** - Native Quasar component props that get passed directly via `v-bind`:
- ✅ `outlined`, `dense`, `color`, `clearable` → These are native Quasar props
- Example: Any prop you'd find in [Quasar's QInput docs](https://quasar.dev/vue-components/input)

**`quickformsDefaults`** - QuickForms features that we implement:
- ✅ `autocomplete`, `dateMask`, `timeMask`, `height`, `darkTheme` → These are our custom features
- Example: Features we add on top of Quasar components

### Global Defaults

Set defaults that apply to all components via `componentDefaults`. The values available are just a passthrough of the respective Quasar component's props. For example, the `input` accepts any valid property from `QInputProps`:

```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'
import type { QuasarFormOptions } from '@quickflo/quickforms-quasar'

const registry = createQuasarRegistry()

const options: QuasarFormOptions = {
  registry,
  componentDefaults: {
    global: {
      outlined: true,   // All components use outlined style
      dense: true,      // All components use dense mode
      color: 'primary'  // All components use primary color
    },
    input: {
      clearable: true   // All text inputs get clear button
    },
    select: {
      useChips: true    // Enum fields display as chips
    },
    checkbox: {
      color: 'secondary'
    }
  }
}
```

### Per-Field Overrides

Use `x-quasar-props` to pass native Quasar component props. Similar to the componentDefaults in that the properties available are just a passthrough of the respective Quasar component:

```typescript
{
  type: 'string',
  format: 'textarea',
  title: 'Description',
  'x-quasar-props': {
    rows: 10,
    dense: true,
    outlined: true,
    color: 'primary'
  }
}
```

### QuickForms Convenience Features

Use `x-quickforms-quasar` for convenience features (not native Quasar props):

#### Icons

```typescript
{
  type: 'string',
  title: 'Email',
  'x-quickforms-quasar': {
    prependIcon: 'mail',
    iconColor: 'primary',
    iconSize: 'md'
  }
}
```

**Icon Properties:**
- `prependIcon` - Icon on left side
- `appendIcon` - Icon on right side (not available for password/select)
- `iconColor` - Quasar color (default: `'grey-7'`)
- `iconSize` - Size: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` (default: `'sm'`)

#### Array Buttons

Customize array field buttons with native QBtn props:

```typescript
{
  type: 'array',
  items: { type: 'string' },
  title: 'Tags',
  'x-quickforms-quasar': {
    addButtonPosition: 'top-right',
    addButton: {
      label: 'Add Tag',
      icon: 'add_circle',
      color: 'secondary',
      size: 'md'
    },
    removeButton: {
      icon: 'delete',
      color: 'negative'
    }
  }
}
```

**Array Properties:**
- `addButtonPosition` - Position: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`
- `addButton` - Native QBtn props (label, icon, color, size, push, fab, etc.)
- `removeButton` - Native QBtn props

#### Tags/Chips Input

For free-form arrays like email addresses or keywords, use `x-render: 'tags'`:

```typescript
{
  type: 'array',
  title: 'Email Recipients',
  'x-render': 'tags',
  items: {
    type: 'string',
    format: 'email'
  },
  'x-quickforms-quasar': {
    chip: {
      color: 'primary',
      icon: 'email'
    },
    separator: /[,;\n]+/  // Custom paste separator
  }
}
```

**Tags Properties:**
- `chip` - Native QChip props (color, textColor, icon, outline, dense, etc.)
- `separator` - RegExp or string pattern for parsing pasted values (default: `/[,;\s]+/`)

See [TagsField documentation](/guide/components#tagsfield-quasar) for full details.

## Supported Formats

QuickForms Quasar supports all standard JSON Schema formats:

### Standard Formats (with validation)
- `email` - Email validation (RFC 5321)
- `url` / `uri` - URL validation (RFC 3986)
- `date` - Date picker (YYYY-MM-DD)
- `time` - Time picker
- `date-time` - Date and time picker

### Custom UI Hints (no validation)
- `password` - Password input with show/hide toggle
- `textarea` - Multi-line text area

## DateTime Customization

Datetime fields default to 12-hour AM/PM format. Customize per-field:

```typescript
{
  type: 'string',
  format: 'date-time',
  title: 'Event Time',
  'x-quasar-props': {
    format24h: true,
    withSeconds: true,
    mask: 'YYYY-MM-DD HH:mm:ss'
  }
}
```

Or globally:

```typescript
{
  componentDefaults: {
    datetime: {
      format24h: true  // Native QDate/QTime prop
    }
  },
  quickformsDefaults: {
    datetime: {
      dateMask: 'MM/DD/YYYY',  // QuickForms feature
      timeMask: 'HH:mm'        // QuickForms feature
    }
  }
}
```

::: warning
The default 12-hour format (`YYYY-MM-DD hh:mm A`) won't pass JSON Schema `format: "date-time"` validation, which requires ISO 8601. Transform to ISO 8601 before submission if needed.
:::

## Theming

Quasar components automatically inherit your app's theme. Options:

1. **Quasar SASS Variables** - Customize `quasar.variables.sass`
2. **Component Defaults** - Use `componentDefaults.global`
3. **Dark Mode** - Automatic via Quasar's Dark plugin

```typescript
const options: QuasarFormOptions = {
  registry: createQuasarRegistry(),
  componentDefaults: {
    global: {
      outlined: true,
      dense: true,
      color: 'primary'
    }
  }
}
```

## Complete Options Reference

### `QuasarFormOptions`

Extends standard `FormOptions` with Quasar-specific configurations:

```typescript
interface QuasarFormOptions extends FormOptions {
  registry: ComponentRegistry
  componentDefaults?: {
    global?: Record<string, any>      // Applied to ALL components
    input?: Record<string, any>       // QInput defaults
    select?: Record<string, any>      // QSelect defaults
    checkbox?: Record<string, any>    // QCheckbox defaults
    date?: Record<string, any>        // QDate defaults
    time?: Record<string, any>        // QTime defaults
    datetime?: Record<string, any>    // DateTime field defaults
  }
  quickformsDefaults?: {
    input?: {
      iconColor?: string
      iconSize?: string
    }
    select?: {
      autocomplete?: boolean       // Enable/disable autocomplete filtering
    }
    datetime?: {
      dateMask?: string           // Date mask format
      timeMask?: string           // Time mask format
    }
    array?: {
      addButtonPosition?: string
      addButton?: Record<string, any>
      removeButton?: Record<string, any>
    }
    tags?: {
      chip?: Record<string, any>        // QChip props for tag chips
      separator?: RegExp | string       // Paste separator pattern
    }
    jsoneditor?: {
      height?: string             // Editor height (default: '300px')
      darkTheme?: boolean         // Use dark theme (default: false, auto-detects from Quasar Dark)
      lineNumbers?: boolean       // Show line numbers (default: false)
      lintGutter?: boolean        // Show lint gutter (default: false)
      tabSize?: number            // Tab size (default: 2)
      indentWithTab?: boolean     // Enable Tab key (default: true)
      formatKey?: string          // Format shortcut (default: 'Ctrl-.')
    }
  }
}
```

For base `FormOptions`, see [Form Options API](/guide/form-options).

## Examples

See [Examples](/guide/examples/basic-form) for complete working examples with Quasar.

## API Reference

### `createQuasarRegistry()`

Creates a component registry with all Quasar components registered.

**Returns:** `ComponentRegistry<Component>`

**Example:**
```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'
const registry = createQuasarRegistry()
```

## Next Steps

- [Getting Started](/guide/getting-started) - Complete tutorial
- [Form Options API](/guide/form-options) - Base options reference
- [Examples](/guide/examples/basic-form) - Working examples
