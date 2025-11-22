# Custom Components

Register your own components for specific fields using QuickForms' tester system.

## Why Custom Components?

QuickForms provides built-in components for all standard field types. Use custom components when you need:

- **Custom UI/UX** - Special input widgets (color picker, rich text editor, etc.)
- **Integration** - Third-party libraries (date pickers, map selectors, etc.)
- **Branding** - Company-specific styled components
- **Business logic** - Domain-specific input patterns

## Component Registry

QuickForms uses a **component registry** with a **tester priority system** to select which component renders each field.

### How It Works

1. For each field, QuickForms runs all registered testers
2. Testers return a priority number (higher = better match)
3. The component with the highest priority renders the field

This is the same pattern used by JSONForms.

## Basic Example

### 1. Create Your Component

```vue
<!-- PhoneInput.vue -->
<script setup lang="ts">
import { useFormField } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const props = defineProps<{
  schema: JSONSchema
  path: string
  disabled?: boolean
  readonly?: boolean
}>()

// useFormField handles v-model, validation, labels
const { value, errorMessage, label, hint } = useFormField(props.path, props.schema)

// Custom formatting logic
const formatPhoneNumber = (val: string) => {
  const cleaned = val.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return val
}

const handleInput = (event: Event) => {
  const input = (event.target as HTMLInputElement).value
  value.value = formatPhoneNumber(input)
}
</script>

<template>
  <div class="phone-input">
    <label v-if="label">{{ label }}</label>
    <input
      type="tel"
      :value="value"
      @input="handleInput"
      :disabled="disabled || readonly"
      placeholder="(555) 123-4567"
    />
    <div v-if="hint" class="hint">{{ hint }}</div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<style scoped>
.phone-input {
  margin-bottom: 1rem;
}
.error {
  color: red;
  font-size: 0.875rem;
}
.hint {
  color: gray;
  font-size: 0.875rem;
}
</style>
```

### 2. Create a Tester

```typescript
import { rankWith, isStringType, hasFormat } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

// Match string fields with format: "phone"
export const isPhoneField = (schema: JSONSchema): number => {
  return rankWith(10, (s) => isStringType(s) && hasFormat('phone')(s))(schema)
}
```

### 3. Register the Component

```typescript
import { createDefaultRegistry } from '@quickflo/quickforms-vue'
import PhoneInput from './PhoneInput.vue'
import { isPhoneField } from './testers'

const registry = createDefaultRegistry()

// Register with tester
registry.register('phone', PhoneInput, isPhoneField)

// Use in form
const options = {
  registry
}
```

### 4. Use in Schema

```typescript
const schema = {
  type: 'object',
  properties: {
    phone: {
      type: 'string',
      format: 'phone',  // This triggers your custom component!
      title: 'Phone Number'
    }
  }
}
```

## Tester Functions

Testers determine when a component should be used.

### Built-in Testers

```typescript
import {
  isStringType,
  isNumberType,
  isBooleanType,
  isObjectType,
  isArrayType,
  hasFormat,
  hasOneOf,
  hasAnyOf,
  hasAllOf,
  isEnum,
  isRequired,
  rankWith
} from '@quickflo/quickforms-vue'

// Examples
isStringType(schema)           // true if type: 'string'
isNumberType(schema)           // true if type: 'number'
hasFormat('email')(schema)     // true if format: 'email'
isEnum(schema)                 // true if has enum property
hasOneOf(schema)              // true if has oneOf property
```

### Combining Testers

Use `and`, `or`, `not` to combine testers:

```typescript
import { and, or, not, rankWith, isStringType, hasFormat } from '@quickflo/quickforms-vue'

// Match string with email OR url format
const isEmailOrUrl = rankWith(5, or(
  hasFormat('email'),
  hasFormat('url')
))

// Match string without a format
const isPlainString = rankWith(5, and(
  isStringType,
  not(hasFormat())
))
```

### Priority Ranking

Use `rankWith()` to set priority:

```typescript
// Higher number = higher priority

const lowPriority = rankWith(1, isStringType)    // Fallback
const mediumPriority = rankWith(5, hasFormat('email'))  // Specific format
const highPriority = rankWith(10, customLogic)   // Very specific

// If multiple testers match, highest priority wins
```

**Built-in component priorities:**
- Generic types (string, number): Priority 1-2
- Specific formats (email, date): Priority 3-5
- Complex types (object, array): Priority 5-10
- Your custom components: Usually 10-15

## Advanced Examples

### Custom Date Picker

```vue
<!-- DatePicker.vue -->
<script setup lang="ts">
import { useFormField } from '@quickflo/quickforms-vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps<{
  schema: any
  path: string
  disabled?: boolean
}>()

const { value, errorMessage, label } = useFormField(props.path, props.schema)
</script>

<template>
  <div>
    <label>{{ label }}</label>
    <Datepicker v-model="value" :disabled="disabled" />
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>
```

```typescript
// Register for date format
import { rankWith, isStringType, hasFormat, and } from '@quickflo/quickforms-vue'

const isDateField = rankWith(15, (schema) => 
  isStringType(schema) && hasFormat('date')(schema)
)

registry.register('custom-date', DatePicker, isDateField)
```

### Custom Enum with Icons

```vue
<!-- IconSelect.vue -->
<script setup lang="ts">
import { useFormField } from '@quickflo/quickforms-vue'

const props = defineProps<{
  schema: any
  path: string
}>()

const { value, errorMessage, label } = useFormField(props.path, props.schema)

// Get icons from x-enum-icons extension
const icons = props.schema['x-enum-icons'] || {}
</script>

<template>
  <div>
    <label>{{ label }}</label>
    <div class="icon-select">
      <button
        v-for="option in schema.enum"
        :key="option"
        @click="value = option"
        :class="{ active: value === option }"
        type="button"
      >
        <span class="icon">{{ icons[option] }}</span>
        <span>{{ option }}</span>
      </button>
    </div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>
```

### Conditional Registration

Only register component if a library is available:

```typescript
import { createDefaultRegistry } from '@quickflo/quickforms-vue'

const registry = createDefaultRegistry()

// Only register if library is installed
if (typeof window !== 'undefined' && window.MyCustomLibrary) {
  import('./CustomComponent.vue').then((mod) => {
    registry.register('custom', mod.default, tester)
  })
}
```

## Quasar Custom Components

For Quasar projects, start with the Quasar registry:

```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'
import CustomPhoneInput from './CustomPhoneInput.vue'

const registry = createQuasarRegistry()

// Add your custom component
registry.register('phone', CustomPhoneInput, isPhoneField)

// Use in boot file
export const options = {
  registry,
  // ... other options
}
```

## Component Props

Your custom component receives these props:

```typescript
interface FieldComponentProps {
  schema: JSONSchema          // Field's JSON Schema
  path: string                // Field path (e.g., "user.email")
  disabled?: boolean          // Form-level disabled state
  readonly?: boolean          // Form-level readonly state
}
```

## useFormField Composable

The `useFormField` composable handles all the boilerplate:

```typescript
const {
  value,           // Reactive field value (v-model compatible)
  errorMessage,    // Current validation error
  label,           // Field label from schema.title
  hint,            // Hint text from schema.description or x-hint
  required,        // Whether field is required
  disabled,        // Computed disabled state
  readonly         // Computed readonly state
} = useFormField(path, schema)
```

## Overriding Built-in Components

Register with higher priority to override:

```typescript
import { createDefaultRegistry } from '@quickflo/quickforms-vue'
import CustomStringField from './CustomStringField.vue'

const registry = createDefaultRegistry()

// Override default string component (priority 2) with higher priority
const isMyString = rankWith(20, isStringType)

registry.register('custom-string', CustomStringField, isMyString)
```

## Schema-Based Selection

Use custom schema properties to trigger components:

```typescript
// Schema with custom property
{
  type: 'string',
  'x-widget': 'color-picker'
}

// Tester that checks custom property
const isColorPicker = rankWith(15, (schema) => 
  schema['x-widget'] === 'color-picker'
)
```

## Best Practices

1. **Use high priority** - Set 10+ to override built-ins
2. **Keep testers simple** - Fast checks only
3. **Use `useFormField`** - Handles validation and labels
4. **Test thoroughly** - Especially validation behavior
5. **Document extensions** - If using custom `x-*` properties
6. **Consider accessibility** - ARIA labels, keyboard navigation
7. **Handle edge cases** - null, undefined, disabled states

## Complete Example

See this complete workflow:

```typescript
// 1. Component
// MySlider.vue - Custom range slider
<script setup lang="ts">
import { useFormField } from '@quickflo/quickforms-vue'

const props = defineProps<{
  schema: any
  path: string
  disabled?: boolean
}>()

const { value, errorMessage, label } = useFormField(props.path, props.schema)
const min = props.schema.minimum || 0
const max = props.schema.maximum || 100
</script>

<template>
  <div>
    <label>{{ label }}: {{ value }}</label>
    <input
      type="range"
      v-model="value"
      :min="min"
      :max="max"
      :disabled="disabled"
    />
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

// 2. Tester
import { rankWith, isNumberType } from '@quickflo/quickforms-vue'

const isSlider = rankWith(10, (schema) =>
  isNumberType(schema) && schema['x-widget'] === 'slider'
)

// 3. Registration
import { createDefaultRegistry } from '@quickflo/quickforms-vue'
import MySlider from './MySlider.vue'

const registry = createDefaultRegistry()
registry.register('slider', MySlider, isSlider)

// 4. Usage
const schema = {
  type: 'object',
  properties: {
    volume: {
      type: 'number',
      title: 'Volume',
      minimum: 0,
      maximum: 100,
      'x-widget': 'slider'
    }
  }
}

const options = { registry }
```

## Next Steps

- [Testers & Registry API](/guide/testers-registry) - Complete API reference
- [Schema Extensions](/guide/schema-extensions) - Custom `x-*` properties
- [Composables API](/guide/composables) - `useFormField` details
