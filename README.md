# 🚀 QuickForms

**The Framework-Agnostic JSON Schema Form Generator for Modern Apps**

QuickForms is a powerful, type-safe library that generates fully functional forms from JSON Schema. Designed with a framework-agnostic core, it currently provides first-class bindings for **Vue 3** (with Quasar support coming soon).

Unlike other form generators, QuickForms prioritizes **customization**, **extensibility**, and **developer experience**.

## ✨ Features

- **🏗 Framework Agnostic Core**: Logic is separated from UI, allowing consistent behavior across frameworks.
- **🔌 Fully Extensible**: Register your own components, override defaults, or create custom testers.
- **🎨 CSS Variable Theming**: Customize every aspect of the form (colors, spacing, radius) with simple CSS variables.
- **✅ Powerful Validation**: Built on [Ajv](https://ajv.js.org/) (JSON Schema Draft 7+) and [VeeValidate](https://vee-validate.logaretm.com/).
- **🛠 Developer Friendly**: Written in TypeScript with full type definitions.
- **🧩 Component Registry**: Smart component selection based on schema type, format, or custom logic.

## 📦 Installation

```bash
# Install core and vue package
pnpm add @quickforms/core @quickforms/vue

# Peer dependencies
pnpm add vue vee-validate
```

## 🚦 Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DynamicForm } from '@quickforms/vue';
import type { JSONSchema } from '@quickforms/core';

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
    role: {
      type: 'string',
      enum: ['user', 'admin'],
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
    :options={useDefaults: true}
    @submit="handleSubmit"
  />
</template>
```

## 🧩 Custom Components

QuickForms allows you to register your own components for specific fields using a powerful "tester" system.

```typescript
import { createDefaultRegistry, rankWith, isStringType, and, hasFormat } from '@quickforms/vue';
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
import { useFormField } from '@quickforms/vue';

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

## 🏗 Architecture

The project is structured as a monorepo:

- **`@quickforms/core`**: Framework-agnostic logic (validation, schema utils, registry). Can be used to build bindings for React, Angular, etc.
- **`@quickforms/vue`**: Vue 3 bindings using Composition API and VeeValidate.
- **`@quickforms/quasar`** *(Coming Soon)*: Pre-configured bindings for Quasar framework.

## 🛣 Roadmap

- [x] Phase 1: Core Architecture & Validation
- [x] Phase 2: Vue Basic Fields & Theming
- [x] Phase 3: Extensibility & Custom Registries
- [ ] Phase 4: Complex Types (Nested Objects, Arrays, OneOf/AnyOf)
- [ ] Phase 5: Quasar Support
- [ ] Phase 6: UI Schema Support

## 📄 License

MIT
