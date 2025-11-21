# Theming QuickForms Quasar

QuickForms Quasar components automatically inherit your Quasar app's theme. There are three main approaches to customize the look and feel.

## Option 1: Quasar SASS Variables (Recommended)

The best way to theme QuickForms is to customize your Quasar app's SASS variables. QuickForms components will automatically use these values.

### In your `quasar.variables.sass` (or `.scss`):

```scss
// src/css/quasar.variables.sass (or .scss)

// Brand colors
$primary: #4a3aff
$secondary: #26A69A
$accent: #9C27B0
$positive: #21BA45
$negative: #C10015
$info: #31CCEC
$warning: #F2C037

// Custom colors for your app
$dark: #1d1d1d
$dark-page: #121212

// Border radius
$generic-border-radius: 8px

// Shadows
$shadow-2: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14)

// Typography
$body-font-size: 14px
$body-line-height: 1.5
```

QuickForms components (QInput, QSelect, etc.) will automatically use these variables!

## Option 2: Component Defaults with Quasar Props

Use `componentDefaults` to set global Quasar component styles:

```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar';
import type { QuasarFormOptions } from '@quickflo/quickforms-quasar';

const formOptions: QuasarFormOptions = {
  registry: createQuasarRegistry(),
  componentDefaults: {
    global: {
      // Apply to ALL components
      outlined: true,      // Use outlined style
      dense: true,         // Compact spacing
      color: 'primary',    // Use primary color
      square: false,       // Rounded corners
      class: 'my-form-field' // Custom CSS class
    },
    input: {
      // QInput-specific defaults
      clearable: true,
      filled: false,
      outlined: true,
      bgColor: 'grey-1'
    },
    select: {
      // QSelect-specific defaults
      outlined: true,
      behavior: 'menu'
    },
    checkbox: {
      // QCheckbox-specific defaults
      color: 'primary',
      size: 'md'
    }
  }
};
```

## Option 3: Custom CSS Classes

Add custom styling using CSS classes through `componentDefaults`:

```typescript
const formOptions: QuasarFormOptions = {
  registry: createQuasarRegistry(),
  componentDefaults: {
    global: {
      class: 'custom-form-field'
    },
    input: {
      class: ['custom-input', 'elevated-input']
    }
  }
};
```

Then define your styles:

```css
/* In your global CSS or component styles */
.custom-form-field {
  margin-bottom: 1.5rem !important;
}

.custom-input {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-input .q-field__control {
  border-radius: 12px !important;
}
```

## Option 4: Quasar's Dark Mode

QuickForms automatically supports Quasar's dark mode:

```typescript
// In your app's boot file or main.ts
import { Dark } from 'quasar';

// Enable dark mode
Dark.set(true);

// Or toggle based on user preference
Dark.set('auto'); // Respects system preference
```

All QuickForms components will automatically adapt to dark mode!

## Example: Matching Your Workflows App Theme

If you want QuickForms to match a custom design system:

```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar';

const workflowsTheme: QuasarFormOptions = {
  registry: createQuasarRegistry(),
  componentDefaults: {
    global: {
      outlined: true,
      dense: true,
      color: 'primary',
      class: 'workflows-field'
    },
    input: {
      clearable: true,
      inputClass: 'workflows-input',
      labelColor: 'grey-8'
    },
    card: {
      flat: false,
      bordered: true,
      class: 'workflows-card'
    }
  }
};
```

```scss
// In your SASS variables (quasar.variables.scss)
$primary: #4a3aff;  // Workflows purple
$grey-1: #f9f9fb;
$grey-8: #374151;

// Custom overrides
.workflows-field {
  margin-bottom: 1.25rem;
  
  .q-field__label {
    font-weight: 600;
    font-size: 0.8125rem;
    color: #374151;
  }
}

.workflows-input {
  font-size: 0.875rem;
}

.workflows-card {
  border-radius: 0.75rem;
  background: #ffffff;
  border-color: #eaebf0;
}
```

## Per-Field Customization

Override styles for individual fields using `x-quasar-props`:

```javascript
{
  type: 'string',
  title: 'Special Field',
  'x-quasar-props': {
    filled: true,         // Use filled style for this field only
    color: 'secondary',   // Different color
    class: 'special-field',
    bgColor: 'blue-1',
    dense: false          // Override global dense setting
  }
}
```

## Priority Order

Styles are applied in this order (lowest to highest):

1. **Quasar's default theme** (from SASS variables)
2. **Global componentDefaults** (`global` object)
3. **Component-specific defaults** (`input`, `select`, etc.)
4. **x-component-props** (generic field-level)
5. **x-quasar-props** (Quasar-specific field-level)

This means field-level props always win!

## Tips

1. **Start with Quasar SASS variables** - This is the most maintainable approach
2. **Use componentDefaults for form-wide consistency** - Set outlined, dense, etc. once
3. **Use x-quasar-props for exceptions** - Override individual fields as needed
4. **Leverage Quasar's built-in classes** - `bg-grey-1`, `text-weight-bold`, etc.
5. **Test in both light and dark mode** - Use `Dark.set('auto')` during development

## Resources

- [Quasar Style & Identity](https://quasar.dev/style/style-resources)
- [Quasar Theme Builder](https://quasar.dev/style/theme-builder)
- [Quasar Color Palette](https://quasar.dev/style/color-palette)
- [Quasar Dark Mode](https://quasar.dev/quasar-plugins/dark)
