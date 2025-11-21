# 🚀 QuickForms

**The Framework-Agnostic JSON Schema Form Generator for Modern Apps**

QuickForms is a powerful, type-safe library that generates fully functional forms from JSON Schema. Designed with a framework-agnostic core, it currently provides first-class bindings for **Vue 3** (with Quasar support coming soon).

Unlike other form generators like JSONForms, QuickForms prioritizes **developer experience**, **customization**, and **modern architecture** while keeping the API simple and intuitive.

## ⚡ Quick Comparison

| Feature | QuickForms | JSONForms |
|---------|------------|------------|
| 🎯 **Simple API** | No UI schema needed for basic forms | Requires separate UI schema |
| 🎨 **Theming** | CSS variables (60+ customizable) | Material-UI/Vuetify dependency |
| ✅ **Validation Modes** | 3 modes with custom messages | Single mode |
| 🔐 **RBAC Built-in** | `x-roles` and `x-hidden` | Custom implementation needed |
| 📦 **Bundle Size** | ~50KB (Vue + Core) | ~200KB+ (with renderer set) |
| 🧑‍💻 **Modern Stack** | Vue 3 Composition API | Vue 2/3 Options API |
| 🛠 **TypeScript** | First-class support | Good support |
| 🎓 **Learning Curve** | Low - just JSON Schema | Medium - JSON Schema + UI Schema |

## ✨ Features

### Core Features
- **🏗 Framework Agnostic Core**: Logic is separated from UI, allowing consistent behavior across frameworks
- **🔌 Fully Extensible**: Register your own components, override defaults, or create custom testers
- **🎨 CSS Variable Theming**: Customize every aspect of the form (colors, spacing, radius) with CSS variables
- **🛠 Developer Friendly**: Written in TypeScript with full type definitions
- **🧩 Component Registry**: Smart component selection based on schema type, format, or custom logic

### Validation System
- **✅ Comprehensive JSON Schema Validation**: All standard validation keywords (minLength, maxLength, pattern, minimum, maximum, etc.)
- **🔍 Three Validation Modes**: ValidateAndShow (default), ValidateAndHide (silent), NoValidation
- **💬 Custom Error Messages**: Via `x-error-messages` in schema or form options
- **📡 Validation Events**: React to validation state changes in parent components
- **⚡ Real-time Validation**: Validate as you type or on blur
- **🧑‍💻 Custom Validators**: Sync and async validators with unified API
- **⏱️ Debouncing**: Configurable debounce for async validators
- **🔀 Cross-Field Validation**: Validators have access to all form values

### Field Types & Complex Schemas
- **📝 Basic Types**: String (text, email, password, url, textarea), Number, Integer, Boolean, Date, Time, DateTime
- **🗂 Complex Types**: Nested Objects, Arrays with dynamic labels, oneOf/anyOf/allOf
- **📋 Enums**: Dropdown select with custom labels and autocomplete support
- **🎯 Conditional Logic**: oneOf schemas with type selection
- **🏷 Custom Labels**: Array item labels (`x-item-label`) and enum option labels (`x-enum-labels`)
- **🔍 Autocomplete**: Built-in datalist support for enum fields with many options

### Advanced Features
- **🔐 Role-Based Access Control**: Show/hide/disable fields based on user roles (`x-roles`, `x-hidden`)
- **🎭 Dynamic Schema Switching**: React to schema changes on the fly
- **⚙️ Default Values**: Auto-populate forms from schema defaults
- **🎨 Custom Components**: Full control over field rendering
- **🌐 Internationalization**: Customizable labels for all UI text
- **🔧 Component Defaults**: Global configuration for component behavior

## 📦 Installation

```bash
# Install core and vue package
pnpm add @quickflo/quickforms @quickflo/quickforms-vue

# Peer dependencies
pnpm add vue vee-validate
```

## 🚦 Quick Start

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

## 📚 Usage Guide

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

## 🧩 Custom Components

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

## 🎨 Theming

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

## 🧑‍💻 Form Options API

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

## 📚 Architecture

The project is structured as a monorepo:

- **`@quickflo/quickforms`**: Framework-agnostic logic (validation, schema utils, registry). Can be used to build bindings for React, Angular, etc.
- **`@quickflo/quickforms-vue`**: Vue 3 bindings using Composition API and VeeValidate.
- **`@quickflo/forms-quasar`** *(Coming Soon)*: Pre-configured bindings for Quasar framework.

## 🎓 Supported JSON Schema Features

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

### Custom Extensions
- `x-hidden` - Hide field completely
- `x-roles` - Role-based visibility and permissions
- `x-item-label` - Custom array item labels with template interpolation
- `x-enum-labels` - Custom display labels for enum options
- `x-error-messages` - Custom validation messages
- `x-component-props` - Override component-specific settings per field

## 🛣 Roadmap

- [x] Phase 1: Core Architecture & Validation
- [x] Phase 2: Vue Basic Fields & Theming
- [x] Phase 3: Extensibility & Custom Registries
- [x] Phase 4: Complex Types (Nested Objects, Arrays, OneOf/AnyOf/AllOf)
- [x] Phase 5: Validation System (Modes, Custom Messages, Events)
- [x] Phase 6: Role-Based Access Control
- [ ] Phase 7: UI Schema Support (Layouts, Rules)
- [ ] Phase 8: i18n/Localization
- [ ] Phase 9: Quasar Support

## ❓ FAQ

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

## 👥 Contributing

Contributions are welcome! Please read our contributing guidelines and submit PRs to the `main` branch.

## 📦 Packages

- **[@quickflo/quickforms](./packages/core)** - Framework-agnostic core
- **[@quickflo/quickforms-vue](./packages/vue)** - Vue 3 bindings

## 📄 License

MIT
