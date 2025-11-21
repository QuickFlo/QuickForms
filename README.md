![QuickForms Banner](./docs/assets/banner.readme.1280x320.png)

# QuickForms

**A Vue 3 form generator built from JSON Schema, with reasonable escape hatches.**

QuickForms generates forms from JSON Schema with sensible defaults and clear customization paths. Built for Vue 3 with a framework-agnostic core.

## Table of Contents

- [Motivation](#motivation)
- [Comparison with JSONForms](#comparison-with-jsonforms)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
  - [Validation](#validation)
  - [Complex Types](#complex-types)
  - [Custom Validators](#custom-validators)
  - [Internationalization & Customization](#internationalization--customization)
  - [Role-Based Access Control](#role-based-access-control)
- [Custom Components](#custom-components)
- [Theming](#theming)
- [Form Options API](#form-options-api)
- [Architecture](#architecture)
- [Supported JSON Schema Features](#supported-json-schema-features)
  - [Custom Extensions (x-* attributes)](#custom-extensions-x--attributes)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Packages](#packages)
- [License](#license)

## Motivation

JSON Schema form libraries are powerful but often rigid. QuickForms provides escape hatches at common pain points:

- Don't like the default placeholder? Override it globally or per-field
- Need custom validation? Add sync/async validators alongside JSON Schema rules  
- Enum values too technical? Map them to friendly labels with `x-enum-labels`
- Want dynamic hints? Use `hintRenderer` for full control

Sensible defaults, clear customization paths. No rebuilding components.

## Comparison with JSONForms

| Feature | QuickForms | JSONForms |
|---------|------------|------------|
| **UI Schema** | Optional | Required for layouts |
| **Theming** | CSS variables | Framework-dependent |
| **Custom Validators** | Built-in (sync + async) | Not built-in |
| **Vue Version** | Vue 3 Composition API | Vue 2/3 |
| **Bundle Size** | ~56KB gzipped | Varies by renderers |
| **Status** | Early Stage | Mature |

**Note**: This comparison reflects JSONForms as of late 2024. QuickForms is newer and less battle-tested.

## Features

### Core
- Framework-agnostic core with Vue 3 bindings
- Full TypeScript support
- CSS variable theming (60+ variables)
- Extensible component registry

### Validation
- JSON Schema validation (via Ajv)
- Three validation modes: show errors, hide errors, no validation
- Custom sync and async validators
- Configurable debouncing for async validation
- Cross-field validation support
- Custom error messages (per-field or global)

### Field Types
- Primitives: string, number, integer, boolean
- Formats: email, url, password, textarea, date, time, date-time
- Complex: nested objects, arrays, enums
- Conditional: oneOf, anyOf, allOf

### Customization
- Custom display labels for enum values (`x-enum-labels`)
- Custom array item labels with templates (`x-item-label`)
- Role-based field visibility (`x-roles`)
- HTML hints with dynamic rendering (`x-hint`, `hintRenderer`)
- Hint visibility control (always/focus/hover)
- Autocomplete for large enum lists
- Internationalization support

## Installation

```bash
# Install core and vue package
pnpm add @quickflo/quickforms @quickflo/quickforms-vue

# Peer dependencies
pnpm add vue vee-validate
```

## Quick Start

### Basic Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DynamicForm } from '@quickflo/quickforms-vue';
import type { JSONSchema } from '@quickflo/quickforms';

const schema: JSONSchema = {
  type: 'object',
  properties: {
    name: { 
      type: 'string', 
      title: 'Full Name',
      minLength: 2,
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
      minimum: 18,
      maximum: 120
    },
    role: {
      type: 'string',
      enum: ['user', 'admin', 'moderator'],
      title: 'Role',
      default: 'user'
    }
  },
  required: ['name', 'email']
};

const formData = ref({});

const handleSubmit = (data) => {
  console.log('Form submitted:', data);
};
</script>

<template>
  <DynamicForm 
    :schema="schema" 
    v-model="formData" 
    :options="{ useDefaults: true }"
    @submit="handleSubmit"
  />
</template>
```

## Usage Guide

### Validation

#### Validation Modes

Control when and how validation errors are displayed:

```vue
<DynamicForm
  :schema="schema"
  v-model="formData"
  :options="{
    validationMode: 'ValidateAndShow' // 'ValidateAndHide' | 'NoValidation'
  }"
/>
```

- **`ValidateAndShow`** (default): Validates as you type and shows errors
- **`ValidateAndHide`**: Validates silently, errors hidden from user but form won't submit if invalid
- **`NoValidation`**: Completely disables validation

#### Custom Error Messages

Two ways to customize validation messages:

**1. In Schema (recommended for reusable schemas):**

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      minLength: 8,
      'x-error-messages': {
        required: 'Password is required for security',
        minLength: 'Password must be at least 8 characters for your security'
      }
    }
  },
  required: ['password']
};
```

**2. In Form Options (for app-specific messages):**

```vue
<DynamicForm
  :schema="schema"
  v-model="formData"
  :options="{
    errorMessages: {
      'name': {
        required: 'Hey! We really need your name here.',
        minLength: 'Come on, your name is longer than that!'
      },
      'email': {
        format: 'That doesn\'t look like a real email address.'
      }
    }
  }"
/>
```

#### Validation Events

React to validation state changes:

```vue
<script setup lang="ts">
const validationState = ref({ valid: true, errors: {} });

const handleValidation = (result: { valid: boolean; errors: Record<string, string> }) => {
  validationState.value = result;
  console.log('Form is valid:', result.valid);
  console.log('Errors:', result.errors);
};
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    @validation="handleValidation"
  />
</template>
```

### Complex Types

#### Nested Objects

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        street: { type: 'string', title: 'Street' },
        city: { type: 'string', title: 'City' },
        zip: { type: 'string', pattern: '^\\d{5}$' }
      },
      required: ['street', 'city', 'zip']
    }
  }
};
```

#### Arrays

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    hobbies: {
      type: 'array',
      title: 'Hobbies',
      minItems: 2,
      items: {
        type: 'string',
        title: 'Hobby'
      }
    }
  }
};
```

#### Arrays with Custom Labels

Use `x-item-label` to customize how array items are displayed:

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    workHistory: {
      type: 'array',
      title: 'Work History',
      'x-item-label': '{{company}} - {{position}}', // Template interpolation
      items: {
        type: 'object',
        properties: {
          company: { type: 'string', title: 'Company' },
          position: { type: 'string', title: 'Position' },
          years: { type: 'number', title: 'Years' }
        }
      }
    }
  }
};
```

Set to `"none"` or `false` to hide labels entirely.

#### Enum Fields with Custom Labels

Use `x-enum-labels` to provide custom display text for enum options while keeping the underlying value:

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['draft', 'active', 'paused', 'archived'],
      title: 'Status',
      // Custom display labels (value -> label mapping)
      'x-enum-labels': {
        'draft': '📝 Draft',
        'active': '✅ Active',
        'paused': '⏸️ Paused',
        'archived': '📦 Archived'
      }
    },
    httpMethod: {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      title: 'HTTP Method',
      'x-enum-labels': {
        'GET': 'GET - Retrieve data',
        'POST': 'POST - Create resource',
        'PUT': 'PUT - Update resource',
        'DELETE': 'DELETE - Remove resource'
      }
    }
  }
};
```

#### Enum Autocomplete

For enum fields with many options, enable autocomplete using HTML5 datalist:

```typescript
// Option 1: Enable for a specific field
const schema: JSONSchema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      enum: ['US', 'CA', 'UK', 'FR', /* ...100 countries */],
      'x-component-props': {
        autocomplete: true  // Enable datalist for this field
      }
    }
  }
};

// Option 2: Enable globally with threshold
const options = {
  componentDefaults: {
    select: {
      autocomplete: false,
      autocompleteThreshold: 5  // Auto-enable for 5+ options
    }
  }
};
```

#### Conditional Schemas (oneOf)

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    paymentMethod: {
      type: 'object',
      title: 'Payment Method',
      oneOf: [
        {
          title: 'Credit Card',
          properties: {
            type: { const: 'credit_card' },
            cardNumber: { type: 'string', pattern: '^\\d{16}$' },
            cvv: { type: 'string', pattern: '^\\d{3}$' }
          },
          required: ['cardNumber', 'cvv']
        },
        {
          title: 'PayPal',
          properties: {
            type: { const: 'paypal' },
            email: { type: 'string', format: 'email' }
          },
          required: ['email']
        }
      ]
    }
  }
};
```

### Custom Validators

Add custom validation logic beyond JSON Schema capabilities. Supports both sync and async validators seamlessly.

#### Sync Validators (Cross-Field Validation)

```vue
<script setup lang="ts">
const schema: JSONSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      format: 'password',
      minLength: 8
    },
    confirmPassword: {
      type: 'string',
      format: 'password',
      title: 'Confirm Password'
    }
  },
  required: ['password', 'confirmPassword']
};
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="{
      validators: {
        // Sync validator - has access to all form values
        confirmPassword: (value, allValues) => {
          return value === allValues.password || 'Passwords must match';
        },
        password: (value, allValues) => {
          // Also validate password when confirmPassword changes
          if (allValues.confirmPassword && value !== allValues.confirmPassword) {
            return 'Passwords must match';
          }
          return true;
        }
      }
    }"
  />
</template>
```

#### Async Validators (API Validation)

```vue
<script setup lang="ts">
const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const response = await fetch(`/api/check-username/${username}`);
  const data = await response.json();
  return data.available;
};
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="{
      validators: {
        // Async validator - automatically detected!
        username: async (value) => {
          if (!value || value.length < 3) return true;
          const available = await checkUsernameAvailable(value);
          return available || 'Username already taken';
        }
      },
      // Debounce async validators to avoid excessive API calls
      validatorDebounce: {
        username: 500 // Wait 500ms after user stops typing
      }
    }"
  />
</template>
```

#### Validator Return Types

Validators can return:
- `true` - Valid
- `false` - Invalid (generic error message)
- `string` - Invalid with custom error message
- `{ valid: boolean, message?: string }` - Object format
- `Promise<any of above>` - Async validation

#### Business Logic Example

```typescript
validators: {
  // Age must match birthdate
  age: (value, allValues) => {
    if (!allValues.birthdate) return true;
    
    const birthYear = new Date(allValues.birthdate).getFullYear();
    const calculatedAge = new Date().getFullYear() - birthYear;
    
    if (Math.abs(value - calculatedAge) > 1) {
      return 'Age doesn\'t match birth date';
    }
    return true;
  },
  
  // Conditional required
  otherSpecify: (value, allValues) => {
    if (allValues.category === 'other' && !value) {
      return 'Please specify when selecting "Other"';
    }
    return true;
  }
}
```

#### Global vs Per-Field Debouncing

```typescript
// Apply same debounce to all async validators
validatorDebounce: 300

// Or configure per field
validatorDebounce: {
  username: 500,   // Slower API
  email: 300,      // Faster API
  zipCode: 1000    // Very slow API
}
```

### Internationalization & Customization

#### Customizable Labels

Customize all UI text for internationalization or branding:

```vue
<script setup lang="ts">
const spanishLabels = {
  selectPlaceholder: 'Seleccionar una opción...',
  addItem: 'Agregar elemento',
  removeItem: 'Eliminar',
  submit: 'Enviar',
  showPassword: 'Mostrar contraseña',
  hidePassword: 'Ocultar contraseña'
};
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="{ labels: spanishLabels }"
  />
</template>
```

**Available Labels:**

```typescript
interface FormLabels {
  selectPlaceholder?: string;  // Default: "Select an option..."
  addItem?: string;            // Default: "Add item"
  removeItem?: string;         // Default: "Remove"
  submit?: string;             // Default: "Submit"
  showPassword?: string;       // Default: "Show password"
  hidePassword?: string;       // Default: "Hide password"
}
```

#### Component Defaults

Configure default behavior for all components of a given type:

```typescript
const options = {
  componentDefaults: {
    select: {
      autocomplete: true,           // Enable autocomplete for all selects
      autocompleteThreshold: 10     // Or only when 10+ options
    },
    array: {
      collapsible: true,            // Allow collapsing array items
      defaultCollapsed: false       // Start expanded
    },
    number: {
      prefix: '$',                  // Prefix for number display
      suffix: '%'                   // Suffix for number display
    }
  }
};
```

**Field-Level Overrides:**

Use `x-component-props` in schema to override component defaults for specific fields:

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      enum: ['US', 'CA', 'UK', /* ...many options */],
      'x-component-props': {
        autocomplete: true  // Override for this field only
      }
    }
  }
};
```

### Role-Based Access Control

Control field visibility and editability based on user roles:

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    systemId: {
      type: 'string',
      title: 'System ID',
      'x-hidden': true // Always hidden
    },
    adminOnlyField: {
      type: 'string',
      title: 'Admin Only',
      'x-roles': {
        admin: ['view', 'edit'],
        user: [],
        guest: []
      }
    },
    readOnlyForUsers: {
      type: 'string',
      title: 'Read-Only for Users',
      'x-roles': {
        admin: ['view', 'edit'],
        user: ['view'],
        guest: []
      }
    }
  }
};
```

```vue
<DynamicForm
  :schema="schema"
  v-model="formData"
  :options="{
    context: {
      roles: ['admin'] // User's current roles
    }
  }"
/>
```

## Custom Components

QuickForms allows you to register your own components for specific fields using a powerful "tester" system.

```typescript
import { createDefaultRegistry, rankWith, isStringType, and, hasFormat } from '@quickflo/quickforms-vue';
import MyCustomPhoneInput from './MyCustomPhoneInput.vue';

// 1. Create a registry (start with defaults)
const registry = createDefaultRegistry();

// 2. Register your component with a tester
// This will match any string field with format: "phone"
registry.register('custom-phone', MyCustomPhoneInput, (schema) =>
  rankWith(10, and(isStringType, hasFormat('phone'))(schema))
);

// 3. Pass registry to the form
// <DynamicForm :options="{ registry }" ... />
```

### Creating a Custom Component

Custom components receive standard props:

```vue
<script setup lang="ts">
import { useFormField } from '@quickflo/quickforms-vue';

const props = defineProps<{
  schema: JSONSchema;
  path: string;
  disabled?: boolean;
}>();

// useFormField handles v-model, validation, and labels automatically
const { value, errorMessage, label } = useFormField(props.path, props.schema);
</script>

<template>
  <div>
    <label>{{ label }}</label>
    <input v-model="value" :disabled="disabled" />
    <span v-if="errorMessage" class="error">{{ errorMessage }}</span>
  </div>
</template>
```

## Theming

QuickForms uses CSS custom properties (variables) for styling. You can override these globally or for specific forms.

```css
/* Global Override */
:root {
  /* Brand Colors */
  --quickform-color-primary: #8b5cf6; /* Purple */
  --quickform-color-error: #ef4444;
  
  /* Spacing & Radius */
  --quickform-radius-md: 0.75rem;
  --quickform-spacing-md: 1rem;
  
  /* Typography */
  --quickform-font-family: 'Inter', sans-serif;
}

/* Dark Mode Example */
.dark-theme {
  --quickform-color-bg: #1f2937;
  --quickform-color-text: #f3f4f6;
  --quickform-color-border: #374151;
}
```

See `packages/vue/src/styles/variables.css` for the full list of 60+ customizable variables.

See **[STYLING_GUIDE.MD](./STYLING_GUIDE.MD)** for a full guide on styling.

## Form Options API

Complete reference for the `options` prop:

```typescript
interface FormOptions {
  /** Populate form with default values from schema */
  useDefaults?: boolean; // default: true
  
  /** Make entire form read-only */
  readonly?: boolean;
  
  /** Disable entire form */
  disabled?: boolean;
  
  /** Validation behavior */
  validationMode?: 'ValidateAndShow' | 'ValidateAndHide' | 'NoValidation';
  
  /** Custom error messages by field path and rule */
  errorMessages?: Record<string, Record<string, string>>;
  
  /** Custom field validators (sync or async) */
  validators?: Record<string, ValidatorFunction>;
  
  /** Debounce delay for async validators in milliseconds */
  validatorDebounce?: number | Record<string, number>;
  
  /** Application context (user info, roles, etc.) */
  context?: Record<string, any>;
  
  /** Custom component registry */
  registry?: ComponentRegistry;
  
  /** Customizable labels for i18n or branding */
  labels?: FormLabels;
  
  /** Component-specific default configurations */
  componentDefaults?: ComponentDefaults;
}

interface FormLabels {
  selectPlaceholder?: string;  // Default: "Select an option..."
  addItem?: string;            // Default: "Add item"
  removeItem?: string;         // Default: "Remove"
  submit?: string;             // Default: "Submit"
  showPassword?: string;       // Default: "Show password"
  hidePassword?: string;       // Default: "Hide password"
}

interface ComponentDefaults {
  select?: {
    autocomplete?: boolean;           // Default: false
    autocompleteThreshold?: number;   // Default: 5
  };
  array?: {
    collapsible?: boolean;            // Default: false
    defaultCollapsed?: boolean;       // Default: false
  };
  number?: {
    prefix?: string;                  // Default: undefined
    suffix?: string;                  // Default: undefined
  };
}

type ValidatorFunction = (
  value: any,
  allValues: Record<string, any>,
  context?: Record<string, any>
) => boolean | string | Promise<boolean | string>;
```

## Architecture

The project is structured as a monorepo:

- **`@quickflo/quickforms`**: Framework-agnostic logic (validation, schema utils, registry). Can be used to build bindings for React, Angular, etc.
- **`@quickflo/quickforms-vue`**: Vue 3 bindings using Composition API and VeeValidate.
- **`@quickflo/forms-quasar`** *(Coming Soon)*: Pre-configured bindings for Quasar framework.

## Supported JSON Schema Features

### Types
- `string`, `number`, `integer`, `boolean`, `object`, `array`, `null`
- All string formats: `email`, `url`, `uri`, `date`, `time`, `date-time`, `password`, `textarea`

### Validation Keywords
- **String**: `minLength`, `maxLength`, `pattern`, `format`
- **Number**: `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`, `multipleOf`
- **Array**: `minItems`, `maxItems`, `uniqueItems`
- **Object**: `properties`, `required`, nested validation
- **General**: `enum`, `const`, `default`

### Advanced
- `oneOf`, `anyOf`, `allOf` - Conditional schemas
- Nested objects and arrays (unlimited depth)
- `$ref` and `$defs` for schema references

### Custom Extensions (`x-*` attributes)

QuickForms extends JSON Schema with custom `x-*` attributes to provide escape hatches for common customization needs:

#### `x-hidden`
**Purpose**: Completely hide a field from rendering
**Type**: `boolean`
**Example**:
```json
{
  "systemId": {
    "type": "string",
    "x-hidden": true
  }
}
```

#### `x-roles`
**Purpose**: Role-based access control for field visibility and editability
**Type**: `Record<string, ('view' | 'edit')[]>`
**Example**:
```json
{
  "adminField": {
    "type": "string",
    "x-roles": {
      "admin": ["view", "edit"],
      "user": ["view"],
      "guest": []
    }
  }
}
```

#### `x-item-label`
**Purpose**: Custom labels for array items with template interpolation
**Type**: `string | "none" | false`
**Example**:
```json
{
  "workHistory": {
    "type": "array",
    "x-item-label": "{{company}} - {{position}}",
    "items": {
      "type": "object",
      "properties": {
        "company": { "type": "string" },
        "position": { "type": "string" }
      }
    }
  }
}
```
Use `"none"` or `false` to hide labels entirely.

#### `x-enum-labels`
**Purpose**: Custom display text for enum options (value → label mapping)
**Type**: `Record<string, string>`
**Example**:
```json
{
  "status": {
    "type": "string",
    "enum": ["draft", "active", "paused"],
    "x-enum-labels": {
      "draft": "📝 Draft",
      "active": "✅ Active",
      "paused": "⏸️ Paused"
    }
  }
}
```

#### `x-error-messages`
**Purpose**: Custom validation error messages per rule type
**Type**: `Record<string, string>`
**Example**:
```json
{
  "password": {
    "type": "string",
    "minLength": 8,
    "x-error-messages": {
      "required": "Password is required for security",
      "minLength": "Password must be at least 8 characters"
    }
  }
}
```

#### `x-component-props`
**Purpose**: Override component-specific behavior for a single field
**Type**: `Record<string, any>`
**Example**:
```json
{
  "country": {
    "type": "string",
    "enum": ["US", "CA", "UK", "..."],
    "x-component-props": {
      "autocomplete": true
    }
  }
}
```

#### `x-hint`
**Purpose**: HTML-enabled hint text (takes precedence over `description`)
**Type**: `string`
**Example**:
```json
{
  "email": {
    "type": "string",
    "x-hint": "Read our <a href='/policy'>privacy policy</a>"
  }
}
```

#### `x-hint-mode`
**Purpose**: Control when hints are displayed
**Type**: `"always" | "focus" | "hover"`
**Default**: `"always"`
**Example**:
```json
{
  "password": {
    "type": "string",
    "description": "Must be 8+ characters",
    "x-hint-mode": "focus"
  }
}
```

---

**Note**: All `x-*` attributes are optional and designed as escape hatches. QuickForms works perfectly with standard JSON Schema—use extensions only when you need them.

## Roadmap

- [x] Phase 1: Core Architecture & Validation
- [x] Phase 2: Vue Basic Fields & Theming
- [x] Phase 3: Extensibility & Custom Registries
- [x] Phase 4: Complex Types (Nested Objects, Arrays, OneOf/AnyOf/AllOf)
- [x] Phase 5: Validation System (Modes, Custom Messages, Events)
- [x] Phase 6: Role-Based Access Control
- [ ] Phase 7: UI Schema Support (Layouts, Rules)
- [ ] Phase 8: i18n/Localization
- [ ] Phase 9: Quasar Support

## FAQ

**Q: How is this different from JSONForms?**

A: QuickForms focuses on modern architecture (Vue 3 Composition API, framework-agnostic core) and developer experience. Key differences:
- Simpler API - no separate UI schema required for basic use
- Built-in role-based access control
- CSS variable theming instead of Material-UI dependency
- Cleaner validation with multiple modes
- Smaller bundle size

**Q: Can I use this with React/Angular?**

A: The core is framework-agnostic. Vue bindings are production-ready. React/Angular bindings can be built using the same core.

**Q: Can I use custom components?**

A: Yes! See the "Custom Components" section above. The tester system gives you full control over component selection.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit PRs to the `main` branch.

## Packages

- **[@quickflo/quickforms](./packages/core)** - Framework-agnostic core
- **[@quickflo/quickforms-vue](./packages/vue)** - Vue 3 bindings

## License

MIT
