# Theming Examples

Customize the look and feel of your forms.

## Plain Vue: CSS Variables

QuickForms uses CSS custom properties for comprehensive theming.

### Basic Theme Customization

```vue
<template>
  <div class="custom-theme">
    <DynamicForm :schema="schema" v-model="formData" />
  </div>
</template>

<style scoped>
.custom-theme {
  /* Primary Color */
  --quickform-color-primary: #10b981;  /* Green */
  
  /* Error Color */
  --quickform-color-error: #ef4444;
  
  /* Border Radius */
  --quickform-radius-md: 0.75rem;
  
  /* Spacing */
  --quickform-spacing-md: 1.5rem;
  
  /* Typography */
  --quickform-font-family: 'Inter', sans-serif;
  --quickform-font-size-base: 16px;
}
</style>
```

### Dark Mode Theme

```vue
<template>
  <div :class="{ 'dark-theme': isDark }">
    <button @click="isDark = !isDark">Toggle Dark Mode</button>
    <DynamicForm :schema="schema" v-model="formData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isDark = ref(false)
</script>

<style scoped>
.dark-theme {
  /* Background Colors */
  --quickform-color-bg: #1f2937;
  --quickform-color-bg-input: #374151;
  
  /* Text Colors */
  --quickform-color-text: #f3f4f6;
  --quickform-color-text-secondary: #9ca3af;
  
  /* Border Colors */
  --quickform-color-border: #4b5563;
  --quickform-color-border-focus: #60a5fa;
  
  /* Error/Success */
  --quickform-color-error: #f87171;
  --quickform-color-success: #34d399;
}
</style>
```

### Complete Custom Theme

```vue
<template>
  <div class="corporate-theme">
    <DynamicForm :schema="schema" v-model="formData" />
  </div>
</template>

<style scoped>
.corporate-theme {
  /* === Colors === */
  /* Primary */
  --quickform-color-primary: #2563eb;
  --quickform-color-primary-hover: #1d4ed8;
  --quickform-color-primary-light: #dbeafe;
  
  /* Background */
  --quickform-color-bg: #ffffff;
  --quickform-color-bg-input: #f9fafb;
  --quickform-color-bg-disabled: #e5e7eb;
  
  /* Text */
  --quickform-color-text: #111827;
  --quickform-color-text-secondary: #6b7280;
  --quickform-color-text-disabled: #9ca3af;
  --quickform-color-placeholder: #9ca3af;
  
  /* Borders */
  --quickform-color-border: #d1d5db;
  --quickform-color-border-hover: #9ca3af;
  --quickform-color-border-focus: #2563eb;
  
  /* Status */
  --quickform-color-error: #dc2626;
  --quickform-color-error-bg: #fee2e2;
  --quickform-color-success: #16a34a;
  --quickform-color-warning: #d97706;
  --quickform-color-info: #0284c7;
  
  /* === Spacing === */
  --quickform-spacing-xs: 0.25rem;
  --quickform-spacing-sm: 0.5rem;
  --quickform-spacing-md: 1rem;
  --quickform-spacing-lg: 1.5rem;
  --quickform-spacing-xl: 2rem;
  
  /* === Typography === */
  --quickform-font-family: 'Inter', system-ui, sans-serif;
  --quickform-font-size-xs: 0.75rem;
  --quickform-font-size-sm: 0.875rem;
  --quickform-font-size-base: 1rem;
  --quickform-font-size-lg: 1.125rem;
  --quickform-font-size-xl: 1.25rem;
  
  --quickform-font-weight-normal: 400;
  --quickform-font-weight-medium: 500;
  --quickform-font-weight-semibold: 600;
  --quickform-font-weight-bold: 700;
  
  --quickform-line-height-tight: 1.25;
  --quickform-line-height-normal: 1.5;
  --quickform-line-height-relaxed: 1.75;
  
  /* === Border Radius === */
  --quickform-radius-sm: 0.25rem;
  --quickform-radius-md: 0.5rem;
  --quickform-radius-lg: 0.75rem;
  --quickform-radius-xl: 1rem;
  --quickform-radius-full: 9999px;
  
  /* === Shadows === */
  --quickform-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --quickform-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --quickform-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* === Transitions === */
  --quickform-transition-fast: 150ms;
  --quickform-transition-base: 200ms;
  --quickform-transition-slow: 300ms;
  
  /* === Z-Index === */
  --quickform-z-dropdown: 1000;
  --quickform-z-modal: 1050;
  --quickform-z-tooltip: 1100;
}
</style>
```

## Quasar: Component Defaults

For Quasar, use `componentDefaults` for consistent styling.

### Global Quasar Defaults

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'

const registry = createQuasarRegistry()

const options = {
  registry,
  componentDefaults: {
    // Apply to ALL components
    global: {
      outlined: true,
      dense: true,
      color: 'primary'
    },
    // Text inputs
    input: {
      clearable: true,
      stackLabel: true
    },
    // Select dropdowns
    select: {
      useChips: true,
      outlined: true
    },
    // Checkboxes
    checkbox: {
      color: 'secondary',
      keepColor: true
    }
  }
}

const formData = ref({})
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="options"
  />
</template>
```

### Per-Field Quasar Styling

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      // Pass native Quasar props
      'x-quasar-props': {
        outlined: true,
        color: 'primary',
        dense: true,
        clearable: true,
        hint: 'Enter your full legal name'
      }
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      'x-quasar-props': {
        outlined: true,
        color: 'secondary',
        useChips: false,
        optionsDense: true
      }
    },
    description: {
      type: 'string',
      format: 'textarea',
      'x-quasar-props': {
        outlined: true,
        rows: 5,
        autogrow: true,
        counter: true,
        maxlength: 500
      }
    }
  }
}
```

### Quasar Icons and Colors

```typescript
const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      title: 'Email',
      // QuickForms convenience features
      'x-quickforms-quasar': {
        prependIcon: 'mail',
        iconColor: 'primary',
        iconSize: 'md'
      }
    },
    username: {
      type: 'string',
      title: 'Username',
      'x-quickforms-quasar': {
        prependIcon: 'person',
        appendIcon: 'verified',  // Shows on right
        iconColor: 'positive'
      }
    },
    url: {
      type: 'string',
      format: 'url',
      'x-quickforms-quasar': {
        prependIcon: 'link',
        iconColor: 'info',
        iconSize: 'sm'
      }
    }
  }
}
```

### Quasar Array Buttons

```typescript
const schema = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      title: 'Tasks',
      items: {
        type: 'object',
        properties: {
          task: { type: 'string', title: 'Task' },
          done: { type: 'boolean', title: 'Done' }
        }
      },
      // Customize array buttons
      'x-quickforms-quasar': {
        addButtonPosition: 'top-right',
        addButton: {
          label: 'Add Task',
          icon: 'add_circle_outline',
          color: 'positive',
          push: true,
          size: 'md'
        },
        removeButton: {
          icon: 'delete_outline',
          color: 'negative',
          flat: true,
          round: true,
          size: 'sm'
        }
      }
    }
  }
}
```

## Combining Themes with x-* Extensions

Use schema extensions for per-field customization:

```typescript
const schema = {
  type: 'object',
  properties: {
    urgentField: {
      type: 'string',
      title: 'Urgent Task',
      // Custom error messages
      'x-error-messages': {
        required: 'This field is critical!'
      },
      // Quasar styling
      'x-quasar-props': {
        outlined: true,
        color: 'negative',  // Red theme
        labelColor: 'negative'
      },
      // QuickForms icons
      'x-quickforms-quasar': {
        prependIcon: 'warning',
        iconColor: 'negative'
      }
    },
    successField: {
      type: 'string',
      title: 'Completed',
      'x-quasar-props': {
        outlined: true,
        color: 'positive',  // Green theme
        readonly: true
      },
      'x-quickforms-quasar': {
        prependIcon: 'check_circle',
        iconColor: 'positive'
      }
    }
  }
}
```

## Brand Color Examples

### Professional Blue

```css
:root {
  --quickform-color-primary: #2563eb;
  --quickform-color-primary-hover: #1d4ed8;
  --quickform-color-border-focus: #3b82f6;
}
```

### Modern Purple

```css
:root {
  --quickform-color-primary: #8b5cf6;
  --quickform-color-primary-hover: #7c3aed;
  --quickform-color-border-focus: #a78bfa;
}
```

### Vibrant Orange

```css
:root {
  --quickform-color-primary: #f97316;
  --quickform-color-primary-hover: #ea580c;
  --quickform-color-border-focus: #fb923c;
}
```

### Fresh Green

```css
:root {
  --quickform-color-primary: #10b981;
  --quickform-color-primary-hover: #059669;
  --quickform-color-border-focus: #34d399;
}
```

## Minimal/Borderless Theme

```css
.minimal-theme {
  --quickform-color-border: transparent;
  --quickform-color-bg-input: #f9fafb;
  --quickform-radius-md: 0.5rem;
  --quickform-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.minimal-theme input:focus,
.minimal-theme select:focus,
.minimal-theme textarea:focus {
  --quickform-color-border: var(--quickform-color-primary);
  box-shadow: 0 0 0 3px var(--quickform-color-primary-light);
}
```

## Material Design Theme

```css
.material-theme {
  /* Material colors */
  --quickform-color-primary: #1976d2;
  --quickform-color-error: #d32f2f;
  --quickform-color-success: #388e3c;
  
  /* Material elevation */
  --quickform-shadow-md: 0 2px 4px -1px rgba(0,0,0,.2), 
                         0 4px 5px 0 rgba(0,0,0,.14), 
                         0 1px 10px 0 rgba(0,0,0,.12);
  
  /* Material typography */
  --quickform-font-family: 'Roboto', sans-serif;
  
  /* Flatter borders */
  --quickform-radius-md: 4px;
}
```

## Tips

1. **Start with defaults** - Override only what you need
2. **Use CSS variables** - Easy to maintain and switch themes
3. **Test dark mode** - Ensure sufficient contrast
4. **Consistent spacing** - Use spacing variables for harmony
5. **Brand colors** - Match your app's design system
6. **Accessibility** - Maintain WCAG contrast ratios

## All Available CSS Variables

For a complete list of CSS variables, see [STYLING_GUIDE.md](https://github.com/quickflo/quickforms/blob/main/STYLING_GUIDE.md) in the repository.

## Next Steps

- [Theming Guide](/guide/theming) - Complete theming documentation
- [Quasar Package](/guide/quasar) - Quasar-specific options
- [Schema Extensions](/guide/schema-extensions) - Custom properties
