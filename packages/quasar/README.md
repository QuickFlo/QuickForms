# @quickflo/quickforms-quasar

Quasar UI components for QuickForms - a Vue 3 JSON Schema form generator library.

## Installation

```bash
pnpm add @quickflo/quickforms-quasar quasar
```

## Usage

### Basic Example

```vue
<script setup>
import { ref } from 'vue';
import { DynamicForm } from '@quickflo/quickforms-vue';
import { createQuasarRegistry } from '@quickflo/quickforms-quasar';

const registry = createQuasarRegistry();

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      description: 'Enter your full name'
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email Address'
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 0,
      maximum: 120
    },
    newsletter: {
      type: 'boolean',
      title: 'Subscribe to newsletter'
    },
    country: {
      type: 'string',
      enum: ['USA', 'Canada', 'UK', 'Germany'],
      title: 'Country'
    }
  },
  required: ['name', 'email']
};

const formData = ref({});
</script>

<template>
  <DynamicForm 
    v-model="formData" 
    :schema="schema" 
    :options="{ registry }" 
  />
</template>
```

### Global Component Defaults

You can set global Quasar defaults that apply to all components via `componentDefaults`:

```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar';
import type { QuasarFormOptions } from '@quickflo/quickforms-quasar';

const registry = createQuasarRegistry();

const formOptions: QuasarFormOptions = {
  registry,
  componentDefaults: {
    global: {
      outlined: true,  // All components use outlined style
      dense: true,     // All components use dense mode
      color: 'primary' // All components use primary color
    },
    input: {
      clearable: true  // All inputs get a clear button
    },
    select: {
      useChips: true   // Enum fields use chips
    },
    checkbox: {
      color: 'secondary'
    }
  }
};
```

Defaults are applied in this priority order (lowest to highest):
1. `global` - applies to all components
2. Component-specific (e.g., `input`, `select`) - applies to specific component types
3. `x-component-props` - per-field override
4. `x-quasar-props` - per-field Quasar-specific override

### Supported Formats

QuickForms Quasar supports all standard JSON Schema formats plus custom UI hints. For complete documentation on supported formats, validation behavior, and examples, see the [main QuickForms README](../../README.md#string-formats).

**Quick reference:**
- Standard formats with validation: `email`, `url`/`uri`, `date`, `time`, `date-time`
- Custom UI hints (no validation): `password`, `textarea`

### DateTime Field Customization

The datetime field defaults to 12-hour AM/PM format (`YYYY-MM-DD hh:mm A`). **Note:** This human-readable format will not pass JSON Schema `format: "date-time"` validation, which requires ISO 8601 format. This is a UX trade-off - the UI remains user-friendly while you can transform to ISO 8601 before submission if needed.

Customize per-field:

```javascript
{
  type: 'string',
  format: 'date-time',
  title: 'Event Time',
  'x-quasar-props': {
    format24h: true,        // Use 24-hour format (default: false)
    withSeconds: true,      // Include seconds (default: false)
    mask: 'YYYY-MM-DD HH:mm:ss' // Custom format mask
  }
}
```

Or set globally via `componentDefaults.datetime`:

```typescript
const formOptions = {
  registry: createQuasarRegistry(),
  componentDefaults: {
    datetime: {
      format24h: true,  // All datetime fields use 24-hour
      dateMask: 'MM/DD/YYYY',
      timeMask: 'HH:mm'
    }
  }
};
```

### Custom Component Props

You can pass Quasar-specific props directly through your schema using `x-quasar-props` (or the generic `x-component-props`):

```javascript
const schema = {
  type: 'object',
  properties: {
    bio: {
      type: 'string',
      title: 'Biography',
      format: 'textarea',
      'x-quasar-props': {
        rows: 10,
        dense: true,
        color: 'primary'
      }
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      title: 'Priority',
      'x-quasar-props': {
        color: 'secondary',
        dense: true
      }
    }
  }
};
```

### Custom Component Registration

```vue
<script setup>
import { createQuasarRegistry, rankWith, isStringType } from '@quickflo/quickforms-quasar';
import CustomPhoneInput from './CustomPhoneInput.vue';

const registry = createQuasarRegistry();

// Register custom component for phone format
registry.register('phone', CustomPhoneInput, (schema) =>
  rankWith(10, isStringType(schema) && schema.format === 'phone')
);
</script>
```

## Components

The package provides Quasar-wrapped versions of all standard form components:

- **QuasarStringField** - Wraps `QInput` for text, email, URL, password, and textarea
- **QuasarNumberField** - Wraps `QInput` with `type="number"`
- **QuasarBooleanField** - Wraps `QCheckbox`
- **QuasarEnumField** - Wraps `QSelect` for enum/dropdown fields
- **QuasarDateField** - Wraps `QInput` with `QDate` popup picker
- **QuasarTimeField** - Wraps `QInput` with `QTime` popup picker
- **QuasarDateTimeField** - Wraps `QInput` with `QDate` and `QTime` popups
- **QuasarObjectField** - Wraps `QExpansionItem` for nested objects
- **QuasarArrayField** - Wraps `QCard` with `QBtn` for repeatable fields
- **QuasarOneOfField** - Wraps `QSelect` for conditional schemas
- **QuasarAllOfField** - Renders merged schemas

## Const Fields (Hidden Fields)

Fields with `const` values are automatically hidden and set - the user never sees them!

```javascript
{
  type: 'object',
  properties: {
    credentialType: {
      const: 'gcp_service_account'
      // Automatically hidden and set to 'gcp_service_account'
      // User never interacts with it!
    },
    apiKey: {
      type: 'string',
      title: 'API Key'
    }
  }
}
```

This is much better UX than showing a disabled field or dropdown with only one option!

## Features

- ✅ Full Quasar UI integration
- ✅ Automatic validation with visual feedback
- ✅ Support for all JSON Schema types
- ✅ Custom component registration
- ✅ Schema-level prop passthrough via `x-quasar-props` or `x-component-props`
- ✅ Quasar theming support
- ✅ TypeScript support
- ✅ Nested objects and arrays
- ✅ Conditional schemas (oneOf, anyOf, allOf)

## Theming

QuickForms Quasar components automatically inherit your Quasar app's theme. You have several options:

1. **Quasar SASS Variables (Recommended)** - Customize your `quasar.variables.sass` file
2. **Component Defaults** - Use `componentDefaults.global` for consistent styling
3. **Custom CSS Classes** - Add classes via `componentDefaults`
4. **Dark Mode** - Automatic support via Quasar's Dark plugin

See [THEMING.md](./THEMING.md) for detailed examples and best practices.

**Quick Example:**
```typescript
const formOptions: QuasarFormOptions = {
  registry: createQuasarRegistry(),
  componentDefaults: {
    global: {
      outlined: true,
      dense: true,
      color: 'primary'
    }
  }
};
```

## API Reference

### `createQuasarRegistry()`

Creates a component registry pre-configured with all Quasar field components.

**Returns:** `ComponentRegistry<Component>`

**Example:**
```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar';
const registry = createQuasarRegistry();
```

## License

MIT
