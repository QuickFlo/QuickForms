# Theming

QuickForms styling approach depends on which package you're using.

## Quasar

If you're using the Quasar package, components automatically inherit your Quasar app's theme.

**Options:**
- **Quasar SASS Variables** - Customize `quasar.variables.sass` for app-wide theming
- **Component Defaults** - Use `componentDefaults.global` for consistent QuickForms styling
- **Dark Mode** - Automatic support via Quasar's Dark plugin

**Example:**

```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'

const options = {
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

See [Quasar Package - Theming](/guide/quasar#theming) for complete documentation.

## Plain Vue

If you're using the plain Vue package, QuickForms uses **CSS custom properties** (variables) for complete styling control.

**60+ customizable variables** for colors, spacing, borders, typography, and more.

**Example:**

```css
:root {
  /* Brand Colors */
  --quickform-color-primary: #8b5cf6;
  --quickform-color-error: #ef4444;
  
  /* Spacing & Radius */
  --quickform-radius-md: 0.75rem;
  --quickform-spacing-md: 1rem;
  
  /* Typography */
  --quickform-font-family: 'Inter', sans-serif;
}

/* Dark Mode */
.dark-theme {
  --quickform-color-bg: #1f2937;
  --quickform-color-text: #f3f4f6;
  --quickform-color-border: #374151;
}
```

**Scoped Styling:**

```vue
<template>
  <div class="my-form">
    <DynamicForm :schema="schema" v-model="formData" />
  </div>
</template>

<style scoped>
.my-form {
  --quickform-color-primary: #10b981; /* Green theme */
}
</style>
```

See the main README's [STYLING_GUIDE.md](https://github.com/quickflo/quickforms/blob/main/STYLING_GUIDE.md) for the complete list of CSS variables.

## Next Steps

- [Quasar Theming](/guide/quasar#theming) - Quasar-specific options
- [Custom Components](/guide/custom-components) - Register custom styled components
