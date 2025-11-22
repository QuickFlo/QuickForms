# What is QuickForms?

QuickForms is a **Vue 3 JSON Schema form generator** designed with **sensible defaults and reasonable escape hatches**.

## The Problem

JSON Schema form libraries are powerful but often rigid:

- **Hard to customize** - Changing simple things like placeholders requires rebuilding components
- **Design system lock-in** - Tightly coupled to Material-UI, Bootstrap, or custom frameworks
- **Limited validation** - JSON Schema alone can't handle cross-field or async validation
- **Poor DX** - Complex APIs, required UI schemas, or unclear customization paths

## The QuickForms Approach

QuickForms provides **escape hatches at common pain points**:

- ✅ Don't like the default placeholder? Override it globally or per-field
- ✅ Need custom validation? Add sync/async validators alongside JSON Schema rules
- ✅ Enum values too technical? Map them to friendly labels with `x-enum-labels`
- ✅ Want dynamic hints? Use `hintRenderer` for full control
- ✅ Need custom components? Register them with the tester system

**The philosophy**: Sensible defaults that work out of the box, with clear customization paths when you need them.

## Key Features

### 🚀 Framework-Agnostic Core
The core logic is framework-independent, making it easy to build bindings for React, Angular, or other frameworks in the future.

### 📝 Full JSON Schema Support
- All primitive types (string, number, boolean)
- Complex types (objects, arrays, oneOf, anyOf, allOf)
- Validation keywords (minLength, pattern, minimum, etc.)
- Standard formats (email, url, date, time, date-time)

### ✅ Flexible Validation
- **Three validation modes**: show errors, hide errors, or no validation
- **Custom validators**: Sync and async validation with automatic debouncing
- **Cross-field validation**: Validators have access to all form values
- **Custom error messages**: Override messages in schema or form options

### 🎨 Themeable via CSS Variables
60+ CSS variables give you complete control over styling without rebuilding components. No design system lock-in.

### 🔐 Built-in RBAC
Field-level visibility and editability control based on user roles.

### 🌍 Internationalization Ready
Customize all UI labels and messages globally or per-form.

### 🧩 Extensible Component System
Register custom components using a powerful tester system borrowed from jsonforms.

## Architecture

QuickForms is structured as a monorepo:

```
packages/
  core/           # Framework-agnostic logic
  vue/            # Vue 3 bindings  
  quasar/         # Quasar component preset
```

### Core Package (`@quickflo/quickforms`)
Framework-agnostic TypeScript package containing:
- JSON Schema validation via Ajv
- Component registry with tester priority system
- Schema utilities (default values, path resolution)
- Type definitions

### Vue Package (`@quickflo/quickforms-vue`)
Vue 3 Composition API bindings with VeeValidate integration:
- `DynamicForm` component
- Field components for all types
- Composables (`useFormField`, `useFormContext`)
- Custom component registration

### Quasar Package (`@quickflo/quickforms-quasar`)
Pre-configured Quasar component renderers for zero-config usage.

## When to Use QuickForms

**Good fit:**
- Building admin panels, dashboards, or workflow engines
- Generating forms from API schemas (OpenAPI/JSON Schema)
- Need rapid form development with validation
- Want to iterate on form design without rebuilding components
- Working with dynamic schemas that change at runtime

**Not a good fit:**
- Marketing landing pages with custom-designed forms
- Very simple forms (1-3 fields) where hand-coding is faster
- Need pixel-perfect control over every aspect of form layout

## Next Steps

- [Getting Started](/guide/getting-started) - Install and create your first form
- [Schema Basics](/guide/schema-basics) - Learn JSON Schema fundamentals
- [Examples](/guide/examples/basic-form) - See QuickForms in action
