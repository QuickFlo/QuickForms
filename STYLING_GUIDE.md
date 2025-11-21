# QuickForms Styling Guide

## Current Styling Options

### Option 1: Global CSS Overrides

All components use predictable CSS classes prefixed with `quickform-`. Override them in your app's CSS:

```css
/* Override input styles */
.quickform-input {
  border: 2px solid #8b5cf6;
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-size: 1rem;
}

.quickform-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Override labels */
.quickform-label {
  color: #1f2937;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Override error messages */
.quickform-error {
  color: #dc2626;
  font-weight: 500;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Override submit button */
.quickform-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.75rem 2rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.quickform-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

### Option 2: Scoped Component Styles

Wrap DynamicForm in your own component with scoped styles:

```vue
<template>
  <div class="my-form-wrapper">
    <DynamicForm :schema="schema" v-model="data" />
  </div>
</template>

<style scoped>
.my-form-wrapper :deep(.quickform-input) {
  /* Your custom styles */
  border: 1px solid #d1d5db;
}

.my-form-wrapper :deep(.quickform-label) {
  /* Your custom label styles */
  font-family: 'Inter', sans-serif;
}
</style>
```

## Available CSS Classes

### Field Wrappers
- `.quickform-field` - Wraps each field
- `.quickform-string-field` - String field wrapper
- `.quickform-number-field` - Number field wrapper
- `.quickform-boolean-field` - Boolean field wrapper
- `.quickform-enum-field` - Enum field wrapper
- `.quickform-date-field` - Date field wrapper

### Input Elements
- `.quickform-input` - All text/number/date inputs
- `.quickform-textarea` - Textarea elements
- `.quickform-checkbox` - Checkbox elements
- `.quickform-select` - Select dropdowns
- `.quickform-input-with-icon` - Inputs with icons (e.g., password)
- `.quickform-input-wrapper` - Wrapper for inputs with icons

### Labels and Text
- `.quickform-label` - Field labels
- `.quickform-hint` - Help text/descriptions
- `.quickform-error` - Error messages
- `.quickform-required` - Required field indicator (*)

### Checkboxes
- `.quickform-checkbox-label` - Label for checkbox
- `.quickform-checkbox-text` - Text inside checkbox label

### Password Field
- `.quickform-password-toggle` - Eye icon button
- `.quickform-input-with-icon` - Password input with padding for icon

### Form Actions
- `.quickform-actions` - Submit button area
- `.quickform-submit` - Default submit button

### Form Container
- `.quickform` - Main form element

## CSS State Classes

Fields automatically get ARIA attributes that you can style:

```css
/* Invalid fields */
.quickform-input[aria-invalid="true"] {
  border-color: #dc2626;
  background-color: #fef2f2;
}

/* Disabled fields */
.quickform-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Focus states */
.quickform-input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

## Example: Custom Theme

### Material Design Style

```css
.quickform-field {
  margin-bottom: 1.5rem;
}

.quickform-label {
  color: #5f6368;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.quickform-input,
.quickform-select,
.quickform-textarea {
  border: none;
  border-bottom: 1px solid #dadce0;
  border-radius: 4px 4px 0 0;
  background-color: #f8f9fa;
  padding: 0.75rem 0.75rem 0.5rem;
  transition: all 0.2s;
}

.quickform-input:focus,
.quickform-select:focus,
.quickform-textarea:focus {
  outline: none;
  border-bottom: 2px solid #1a73e8;
  background-color: #e8f0fe;
  box-shadow: none;
}

.quickform-submit {
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 0.625rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
```

### Minimal/Brutalist Style

```css
.quickform-input,
.quickform-select,
.quickform-textarea {
  border: 2px solid black;
  border-radius: 0;
  background: white;
  font-family: monospace;
  padding: 0.5rem;
}

.quickform-label {
  font-family: monospace;
  font-weight: bold;
  text-transform: uppercase;
}

.quickform-submit {
  background: black;
  color: white;
  border: 2px solid black;
  border-radius: 0;
  padding: 1rem 2rem;
  font-family: monospace;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
}

.quickform-submit:hover:not(:disabled) {
  background: white;
  color: black;
}
```

## Future Improvements (Not Implemented Yet)

### CSS Custom Properties (Phase 5)

```css
:root {
  --quickform-color-primary: #3b82f6;
  --quickform-color-error: #dc2626;
  --quickform-color-success: #10b981;
  --quickform-border-radius: 0.375rem;
  --quickform-input-padding: 0.5rem;
  --quickform-font-size: 1rem;
  --quickform-label-color: #374151;
  --quickform-border-color: #d1d5db;
}
```

### Unstyled/Headless Mode (Phase 5)

```vue
<DynamicForm
  :schema="schema"
  :unstyled="true"
>
  <!-- Use your own components -->
</DynamicForm>
```

### Custom Component Registration (Phase 5)

```typescript
import { createSchemaForm } from '@quickforms/vue';
import MyCustomInput from './MyCustomInput.vue';

const CustomForm = createSchemaForm({
  string: MyCustomInput,
  // ...other custom components
});
```

## Tips

1. **Use `:deep()` in scoped styles** to target child components
2. **Avoid `!important`** when possible by increasing specificity
3. **Test all field states**: default, focus, error, disabled
4. **Consider accessibility**: maintain good color contrast
5. **Test with real data**: validation errors, long text, etc.

## Need More Control?

For maximum styling control:
1. Wait for **Phase 4** (Quasar package) - pre-styled with Quasar components
2. Wait for **Phase 5** (Custom components) - register your own field components
3. Fork and modify the source code (it's MIT licensed!)
