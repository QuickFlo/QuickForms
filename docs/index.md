---
layout: home

hero:
  name: QuickForms
  text: JSON Schema Form Generator
  tagline: Vue 3 forms with sensible defaults and reasonable escape hatches
  image:
    src: /assets/banner.readme.1280x320.png
    alt: QuickForms
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/quickflo/quickforms

features:
  - icon: ⚡
    title: Fast & Lightweight
    details: Framework-agnostic core with Vue 3 Composition API bindings. ~56KB gzipped.
  
  - icon: 🎨
    title: Themeable
    details: 60+ CSS variables for complete styling control. No design system lock-in.
  
  - icon: 🔧
    title: Reasonable Escape Hatches
    details: Override placeholders, add custom validators, map enum labels—without rebuilding components.
  
  - icon: 📝
    title: JSON Schema Powered
    details: Full JSON Schema Draft 7+ support including oneOf, anyOf, nested objects, and arrays.
  
  - icon: ✅
    title: Flexible Validation
    details: Three validation modes, custom sync/async validators, and cross-field validation.
  
  - icon: 🔐
    title: Role-Based Access
    details: Built-in RBAC with field-level visibility and editability control.
  
  - icon: 🌍
    title: i18n Ready
    details: Customize all labels and messages globally or per-form for internationalization.
  
  - icon: 🧩
    title: Extensible
    details: Custom component registry with tester system for complete control over field rendering.
---

<div style="text-align: center; margin: 4rem 0;">
  <h2 style="font-size: 2.5rem; margin-bottom: 3rem;">See It In Action</h2>
  
  <div style="margin-bottom: 3rem; display: flex; justify-content: center; align-items: center;">
    <img src="/assets/quickforms-showcase-quasar.png" alt="QuickForms with Quasar" style="border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); max-width: 100%; width: 1000px" />
  </div>
  
  <div style="margin-bottom: 2rem; display: flex; justify-content: center; align-items: center;">
    <img src="/assets/quickforms-showcase-vue.png" alt="QuickForms with Plain Vue" style="border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); max-width: 100%; width: 1000px" />
  </div>
</div>

## Quick Example

### Quasar

If you're using Quasar, you get beautiful pre-styled components out of the box:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'
import type { JSONSchema } from '@quickflo/quickforms'

const registry = createQuasarRegistry()

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
      minimum: 18
    }
  },
  required: ['name', 'email']
}

const formData = ref({})

// formData updates automatically as user types!
// Use it however you want: display, send to API, etc.
</script>

<template>
  <DynamicForm 
    :schema="schema" 
    v-model="formData"
    :options="{ registry }"
  />
</template>
```

See [Quasar Package Docs](/guide/quasar) for all Quasar-specific options.

### Plain Vue

Use the plain Vue package with your own styling:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = { /* same schema as above */ }
const formData = ref({})
</script>

<template>
  <DynamicForm 
    :schema="schema" 
    v-model="formData"
  />
</template>
```

See [Vue Package Docs](/guide/vue) for plain Vue options.

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

## Why QuickForms?

JSON Schema form libraries are powerful but often rigid. QuickForms provides **escape hatches at common pain points**:

- ✅ Don't like the default placeholder? Override it globally or per-field
- ✅ Need custom validation? Add sync/async validators alongside JSON Schema rules
- ✅ Enum values too technical? Map them to friendly labels with `x-enum-labels`
- ✅ Want dynamic hints? Use `hintRenderer` for full control

**Sensible defaults, clear customization paths. No rebuilding components.**
