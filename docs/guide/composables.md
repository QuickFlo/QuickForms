# Composables API

QuickForms provides Vue 3 composables for building custom components and accessing form state.

## useFormField

Hook for managing individual field state with automatic validation and label handling.

### Signature

```typescript
function useFormField(
  path: string,
  schema: JSONSchema,
  options?: { label?: string }
): UseFormFieldReturn
```

### Parameters

- **`path`** - Field path in form data (e.g., `"email"`, `"user.address.city"`)
- **`schema`** - JSON Schema definition for this field
- **`options`** - Optional configuration
  - `label` - Override the field label (defaults to `schema.title` or `path`)

### Return Value

```typescript
interface UseFormFieldReturn {
  value: Ref<any>                    // Reactive field value (v-model compatible)
  errorMessage: ComputedRef<string | null>  // Current validation error
  errors: Ref<string[]>              // All validation errors
  setValue: (val: any) => void       // Programmatically set value
  setTouched: (touched: boolean) => void    // Mark field as touched
  meta: FieldMeta                    // VeeValidate field metadata
  label: ComputedRef<string>         // Display label
  hint: ComputedRef<string | undefined>     // Hint text
  hintMode: ComputedRef<'always' | 'focus' | 'hover'>  // When to show hint
  required: ComputedRef<boolean>     // Whether field is required
}
```

### Example Usage

```vue
<script setup lang="ts">
import { useFormField } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const props = defineProps<{
  schema: JSONSchema
  path: string
  disabled?: boolean
}>()

const { value, errorMessage, label, hint, required } = useFormField(
  props.path,
  props.schema
)
</script>

<template>
  <div class="field">
    <label>
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      v-model="value"
      :disabled="disabled"
      :aria-invalid="!!errorMessage"
    />
    <div v-if="hint" class="hint">{{ hint }}</div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>
```

### Features

**Automatic Validation:**
- JSON Schema validation (type, format, min/max, pattern, etc.)
- Custom validators from form options
- Async validator support with debouncing
- Custom error messages from `x-error-messages` or form options

**Smart Error Display:**
- Respects `validationMode` from form options
- `ValidateAndShow` - Shows errors as you type
- `ValidateAndHide` - Validates silently (returns `null` for errorMessage)
- `NoValidation` - Skips all validation

**Hint Management:**
- Reads from `x-hint` or `description`
- Supports HTML in `x-hint`
- Applies `hintRenderer` if provided in form options
- Respects `x-hint-mode` or global `componentDefaults.hints.showMode`

**Label Resolution:**
- Uses override from `options.label` if provided
- Falls back to `schema.title`
- Falls back to last segment of `path` (e.g., `maxAllowed` instead of `userInfo.generalInfo.mediaTypeConfig.maxAllowed`)

### Advanced: Custom Validators

The composable automatically runs custom validators from form options:

```typescript
const options = {
  validators: {
    email: async (value, allValues, context) => {
      const response = await fetch(`/guide/check-email?email=${value}`)
      const { available } = await response.json()
      return available || 'Email already taken'
    }
  },
  validatorDebounce: {
    email: 500  // Debounce async validation by 500ms
  }
}
```

### Advanced: Programmatic Control

```vue
<script setup lang="ts">
const { value, setValue, setTouched, meta } = useFormField(path, schema)

// Set value programmatically
const resetField = () => {
  setValue('')
  setTouched(false)
}

// Check field state
console.log(meta.value.dirty)    // Has value changed?
console.log(meta.value.touched)  // Has field been focused?
console.log(meta.value.valid)    // Is field valid?
</script>
```

---

## useFormContext

Access form-level context and configuration.

### Signature

```typescript
function useFormContext(): FormContext | undefined
```

### Return Value

```typescript
interface FormContext {
  schema: JSONSchema                 // Root schema
  validationMode: ValidationMode     // Current validation mode
  readonly?: boolean                 // Form-level readonly
  disabled?: boolean                 // Form-level disabled
  errorMessages?: ErrorMessages      // Custom error messages
  validators?: ValidatorMap          // Custom validators
  validatorDebounce?: number | Record<string, number>
  hintRenderer?: HintRenderer        // Custom hint renderer
  componentDefaults?: ComponentDefaults
  context?: Record<string, any>      // User-provided context
  formValues?: () => any             // Get all form values
}
```

### Example Usage

```vue
<script setup lang="ts">
import { useFormContext } from '@quickflo/quickforms-vue'

const formContext = useFormContext()

// Check form-level state
const isReadonly = computed(() => formContext?.readonly || false)
const isDisabled = computed(() => formContext?.disabled || false)

// Access user context
const userId = computed(() => formContext?.context?.userId)

// Get all form values
const allValues = computed(() => formContext?.formValues?.() || {})
</script>
```

### Use Cases

**1. Custom Components:**

Access form configuration in custom field components:

```vue
<script setup lang="ts">
import { useFormContext } from '@quickflo/quickforms-vue'

const context = useFormContext()

// Apply global component defaults
const defaults = context?.componentDefaults?.input || {}
</script>
```

**2. Cross-Field Logic:**

Access other field values for dependent validation:

```vue
<script setup lang="ts">
const context = useFormContext()

const validatePasswordConfirm = (value: string) => {
  const allValues = context?.formValues?.() || {}
  return value === allValues.password || 'Passwords must match'
}
</script>
```

**3. Role-Based UI:**

Show/hide elements based on user context:

```vue
<script setup lang="ts">
const context = useFormContext()
const isAdmin = computed(() => context?.context?.role === 'admin')
</script>

<template>
  <div v-if="isAdmin">
    <!-- Admin-only content -->
  </div>
</template>
```

---

## provideFormContext

Provide form context to child components (used internally by `DynamicForm`).

### Signature

```typescript
function provideFormContext(context: FormContext): void
```

### Usage

This is primarily used internally by the `DynamicForm` component. You typically won't need to call this directly unless building a custom form wrapper.

```typescript
import { provideFormContext } from '@quickflo/quickforms-vue'

// In a custom form wrapper component
provideFormContext({
  schema: mySchema,
  validationMode: 'ValidateAndShow',
  readonly: false,
  // ... other context
})
```

---

## Utility Functions

### getHint

Extract hint text from schema (used internally by `useFormField`).

```typescript
function getHint(schema: JSONSchema): string | undefined
```

Returns `x-hint` if present, otherwise `description`.

### Example

```typescript
import { getHint } from '@quickflo/quickforms-vue'

const hint = getHint({
  type: 'string',
  description: 'Plain text hint',
  'x-hint': 'HTML hint with <a>link</a>'
})

console.log(hint)  // "HTML hint with <a>link</a>"
```

---

## Type Definitions

### ValidationMode

```typescript
type ValidationMode = 'ValidateAndShow' | 'ValidateAndHide' | 'NoValidation'
```

### FieldMeta

From VeeValidate:

```typescript
interface FieldMeta {
  touched: boolean     // Has field been focused?
  dirty: boolean       // Has value changed from initial?
  valid: boolean       // Is field valid?
  pending: boolean     // Is async validation running?
  initialValue: any    // Original value
}
```

### HintRenderer

Custom function to transform hint text:

```typescript
type HintRenderer = (
  hint: string,
  context: {
    schema: JSONSchema
    path: string
    value: any
  }
) => string
```

### ValidatorMap

Custom validators keyed by field path:

```typescript
type ValidatorMap = Record<string, ValidatorFunction>

type ValidatorFunction = (
  value: any,
  allValues: Record<string, any>,
  context: Record<string, any>
) => boolean | string | Promise<boolean | string> | ValidationResult

interface ValidationResult {
  valid: boolean
  message?: string
}
```

---

## Next Steps

- [Custom Components](/guide/custom-components) - Build custom fields using these composables
- [Custom Validators](/guide/custom-validators) - Add custom validation logic
- [Form Options](/guide/form-options) - Configure form-level behavior
