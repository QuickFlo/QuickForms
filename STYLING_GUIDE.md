# QuickForms Styling Guide

QuickForms provides multiple styling approaches, from simple CSS variable overrides to complete component replacement.

## Styling Approaches

### 1. CSS Variables (Recommended)

Override CSS variables in your app to theme all forms globally:

```css
:root {
  /* Primary colors */
  --quickform-color-primary: #8b5cf6;
  --quickform-color-primary-hover: #7c3aed;
  
  /* Borders and radius */
  --quickform-color-border: #d1d5db;
  --quickform-color-border-focus: #8b5cf6;
  --quickform-radius-md: 0.75rem;
  
  /* Typography */
  --quickform-font-family: 'Inter', sans-serif;
  --quickform-font-size-base: 1rem;
  --quickform-label-font-weight: 600;
  
  /* Input spacing */
  --quickform-input-padding-x: 0.75rem;
  --quickform-input-padding-y: 0.75rem;
  
  /* Error colors */
  --quickform-color-error: #dc2626;
  --quickform-color-error-bg: #fef2f2;
}
```

See `packages/vue/src/styles/variables.css` for all 60+ available variables.

### 2. Direct CSS Overrides

For more specific control, override CSS classes directly:

```vue
<template>
  <div class="my-form">
    <DynamicForm :schema="schema" v-model="data" />
  </div>
</template>

<style scoped>
.my-form :deep(.quickform-input) {
  border: 2px solid #000;
  border-radius: 0;
}

.my-form :deep(.quickform-label) {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.my-form :deep(.quickform-error) {
  font-weight: 600;
}
</style>
```

### 3. Custom Components (Complete Control)

Register your own components for specific field types:

```typescript
import { createDefaultRegistry, rankWith, isStringType } from '@quickflo/quickforms-vue';
import MyCustomInput from './MyCustomInput.vue';

const registry = createDefaultRegistry();

// Override all string fields
registry.register('custom-string', MyCustomInput, (schema) =>
  rankWith(10, isStringType(schema))
);

// Or target specific formats
registry.register('phone', PhoneInput, (schema) =>
  rankWith(15, isStringType(schema) && schema.format === 'phone')
);
```

```vue
<DynamicForm
  :schema="schema"
  v-model="data"
  :options="{ registry }"
/>
```

## CSS Classes Reference

### Components
- `.quickform` - Main form
- `.quickform-field` - Each field wrapper
- `.quickform-string-field`, `.quickform-number-field`, etc. - Specific field types

### Inputs
- `.quickform-input` - Text/number/date inputs
- `.quickform-textarea` - Textareas
- `.quickform-select` - Dropdowns
- `.quickform-checkbox` - Checkboxes
- `.quickform-autocomplete` - Autocomplete inputs (with datalist)

### Labels & Text
- `.quickform-label` - Field labels
- `.quickform-hint` - Help text
- `.quickform-error` - Error messages
- `.quickform-required` - Required indicator (*)

### Complex Fields
- `.quickform-object-field` - Nested objects
- `.quickform-array-field` - Arrays
- `.quickform-array-item` - Individual array items
- `.quickform-oneof-field` - OneOf selectors

### Buttons
- `.quickform-submit` - Submit button
- `.quickform-btn` - Generic button
- `.quickform-btn-icon` - Icon buttons (array add/remove)
- `.quickform-password-toggle` - Password visibility toggle

## ARIA States

Style field states using ARIA attributes:

```css
.quickform-input[aria-invalid="true"] {
  border-color: var(--quickform-color-error);
  background-color: var(--quickform-color-error-bg);
}

.quickform-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quickform-input:focus {
  border-color: var(--quickform-color-border-focus);
  box-shadow: var(--quickform-shadow-focus);
}
```

## Complete Theme Examples

### Workflows UI Theme (From WorkflowsTheme.vue)

```css
:root {
  --quickform-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --quickform-color-primary: #4a3aff;
  --quickform-color-primary-hover: #6d5fff;
  --quickform-color-border: #e0e2e9;
  --quickform-color-border-focus: #4a3aff;
  --quickform-radius-md: 0.5rem;
  --quickform-font-size-base: 0.875rem;
  --quickform-label-font-weight: 600;
  --quickform-label-color: #374151;
  --quickform-object-bg: #f9f9fb;
  --quickform-array-item-bg: #f9f9fb;
}
```

See `packages/vue/dev/WorkflowsTheme.vue` for the complete implementation.

### Dark Mode

```css
.dark-theme {
  --quickform-color-bg: #1f2937;
  --quickform-color-text: #f3f4f6;
  --quickform-color-border: #374151;
  --quickform-color-border-focus: #8b5cf6;
  --quickform-color-bg-hover: #111827;
  --quickform-label-color: #d1d5db;
}
```

## Advanced Customization

### Per-Field Styling

Use schema extensions for field-specific behavior:

```json
{
  "status": {
    "type": "string",
    "enum": ["draft", "active"],
    "x-enum-labels": {
      "draft": "📝 Draft",
      "active": "✅ Active"
    },
    "x-hint": "Select the workflow <strong>status</strong>",
    "x-hint-mode": "focus"
  }
}
```

### Dynamic Hints

```typescript
const options = {
  hintRenderer: (hint, { value, path }) => {
    if (path === 'password' && value?.length > 0) {
      const strength = calculateStrength(value);
      return `${hint} <span class="strength-${strength}">Strength: ${strength}</span>`;
    }
    return hint;
  }
};
```

## Best Practices

1. **Start with CSS variables** - Easiest and most maintainable
2. **Use `:deep()` in scoped styles** - Required for targeting nested components
3. **Test all states** - Default, focus, error, disabled, hover
4. **Maintain accessibility** - Don't remove focus rings, maintain color contrast
5. **Check mobile** - Test on small screens and touch devices

## More Examples

See the `/packages/vue/dev` directory for complete working examples:
- `WorkflowsTheme.vue` - Complete theme matching a production app
- `ThemeExample.vue` - Dark mode and custom themes
- `CustomRegistryExample.vue` - Custom components
