# Testers & Registry API

The component registry and tester system controls which component renders each field.

## Overview

QuickForms uses a **priority-based tester system** borrowed from JSONForms:

1. For each field, all registered testers are evaluated
2. Each tester returns a priority number (higher = better match)
3. The component with the highest priority renders the field

This allows you to:
- Override built-in components
- Add components for custom formats
- Create specialized components for specific use cases

## Component Registry

### createDefaultRegistry

Creates a registry with all standard Vue components registered.

```typescript
function createDefaultRegistry(): ComponentRegistry<Component>
```

**Example:**

```typescript
import { createDefaultRegistry } from '@quickflo/quickforms-vue'

const registry = createDefaultRegistry()
```

### createQuasarRegistry

Creates a registry with all Quasar components registered.

```typescript
function createQuasarRegistry(): ComponentRegistry<Component>
```

**Example:**

```typescript
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'

const registry = createQuasarRegistry()
```

### ComponentRegistry Methods

#### register

Register a new component with its tester.

```typescript
registry.register(
  name: string,
  component: Component,
  tester: TesterFunction
): void
```

**Parameters:**
- `name` - Unique identifier for the component
- `component` - Vue component
- `tester` - Function that returns priority number

**Example:**

```typescript
import CustomInput from './CustomInput.vue'
import { rankWith, isStringType } from '@quickflo/quickforms-vue'

registry.register(
  'custom-string',
  CustomInput,
  rankWith(10, isStringType)
)
```

#### getComponent

Get the best-matching component for a schema.

```typescript
registry.getComponent(schema: JSONSchema): Component | undefined
```

**Example:**

```typescript
const schema = { type: 'string', format: 'email' }
const component = registry.getComponent(schema)
```

---

## Tester Functions

Testers evaluate schemas and return priority numbers.

### TesterFunction

```typescript
type TesterFunction = (schema: JSONSchema) => number
```

Returns:
- `0` - Does not match
- `> 0` - Matches (higher = better match)

### rankWith

Combines a priority rank with a predicate function.

```typescript
function rankWith(
  rank: number,
  predicate: (schema: JSONSchema) => boolean
): TesterFunction
```

**Example:**

```typescript
import { rankWith, isStringType } from '@quickflo/quickforms-vue'

// Priority 10 if schema is string type
const tester = rankWith(10, isStringType)

console.log(tester({ type: 'string' }))   // 10
console.log(tester({ type: 'number' }))   // 0
```

---

## Type Testers

Check the JSON Schema `type` property.

### isStringType

```typescript
function isStringType(schema: JSONSchema): boolean
```

Returns `true` if `schema.type === 'string'`.

### isNumberType

```typescript
function isNumberType(schema: JSONSchema): boolean
```

Returns `true` if `schema.type === 'number'`.

### isIntegerType

```typescript
function isIntegerType(schema: JSONSchema): boolean
```

Returns `true` if `schema.type === 'integer'`.

### isBooleanType

```typescript
function isBooleanType(schema: JSONSchema): boolean
```

Returns `true` if `schema.type === 'boolean'`.

### isObjectType

```typescript
function isObjectType(schema: JSONSchema): boolean
```

Returns `true` if `schema.type === 'object'`.

### isArrayType

```typescript
function isArrayType(schema: JSONSchema): boolean
```

Returns `true` if `schema.type === 'array'`.

### isNullType

```typescript
function isNullType(schema: JSONSchema): boolean
```

Returns `true` if `schema.type === 'null'`.

### isEnumType

```typescript
function isEnumType(schema: JSONSchema): boolean
```

Returns `true` if schema has `enum` property.

---

## Format Testers

Check the JSON Schema `format` property.

### hasFormat

```typescript
function hasFormat(format?: string): (schema: JSONSchema) => boolean
```

Returns predicate that checks if schema has a specific format.

**Examples:**

```typescript
import { hasFormat } from '@quickflo/quickforms-vue'

// Check for specific format
const isEmail = hasFormat('email')
console.log(isEmail({ type: 'string', format: 'email' }))  // true

// Check for any format
const hasAnyFormat = hasFormat()
console.log(hasAnyFormat({ type: 'string', format: 'email' }))  // true
console.log(hasAnyFormat({ type: 'string' }))  // false
```

### isEmailFormat

```typescript
function isEmailFormat(schema: JSONSchema): boolean
```

Returns `true` if `schema.format === 'email'`.

### isDateFormat

```typescript
function isDateFormat(schema: JSONSchema): boolean
```

Returns `true` if `schema.format === 'date'`.

### isTimeFormat

```typescript
function isTimeFormat(schema: JSONSchema): boolean
```

Returns `true` if `schema.format === 'time'`.

### isDateTimeFormat

```typescript
function isDateTimeFormat(schema: JSONSchema): boolean
```

Returns `true` if `schema.format === 'date-time'`.

### isUrlFormat

```typescript
function isUrlFormat(schema: JSONSchema): boolean
```

Returns `true` if `schema.format === 'url'` or `'uri'`.

---

## Composition Testers

Check for schema composition keywords.

### hasOneOf

```typescript
function hasOneOf(schema: JSONSchema): boolean
```

Returns `true` if schema has `oneOf` property.

### hasAnyOf

```typescript
function hasAnyOf(schema: JSONSchema): boolean
```

Returns `true` if schema has `anyOf` property.

### hasAllOf

```typescript
function hasAllOf(schema: JSONSchema): boolean
```

Returns `true` if schema has `allOf` property.

### hasConst

```typescript
function hasConst(schema: JSONSchema): boolean
```

Returns `true` if schema has `const` property.

### hasConditional

```typescript
function hasConditional(schema: JSONSchema): boolean
```

Returns `true` if schema has `if/then/else` conditional.

### isDiscriminatedUnion

```typescript
function isDiscriminatedUnion(schema: JSONSchema): boolean
```

Returns `true` if schema is a discriminated union (oneOf with discriminator).

---

## Extension Testers

Check for custom schema extensions.

### hasExtension

```typescript
function hasExtension(
  key: string,
  value?: any
): (schema: JSONSchema) => boolean
```

Returns predicate that checks for custom `x-*` properties.

**Examples:**

```typescript
import { hasExtension } from '@quickflo/quickforms-vue'

// Check if extension exists
const hasWidget = hasExtension('x-widget')
console.log(hasWidget({ type: 'string', 'x-widget': 'color' }))  // true

// Check if extension has specific value
const isColorWidget = hasExtension('x-widget', 'color')
console.log(isColorWidget({ type: 'string', 'x-widget': 'color' }))  // true
console.log(isColorWidget({ type: 'string', 'x-widget': 'slider' }))  // false
```

---

## Logical Combinators

Combine multiple testers with logical operators.

### and

```typescript
function and(
  ...predicates: Array<(schema: JSONSchema) => boolean>
): (schema: JSONSchema) => boolean
```

Returns `true` if ALL predicates match.

**Example:**

```typescript
import { and, isStringType, hasFormat } from '@quickflo/quickforms-vue'

// Must be string AND have email format
const isEmailString = and(
  isStringType,
  hasFormat('email')
)

console.log(isEmailString({ type: 'string', format: 'email' }))  // true
console.log(isEmailString({ type: 'string' }))  // false
```

### or

```typescript
function or(
  ...predicates: Array<(schema: JSONSchema) => boolean>
): (schema: JSONSchema) => boolean
```

Returns `true` if ANY predicate matches.

**Example:**

```typescript
import { or, hasFormat } from '@quickflo/quickforms-vue'

// Email OR URL format
const isEmailOrUrl = or(
  hasFormat('email'),
  hasFormat('url')
)

console.log(isEmailOrUrl({ type: 'string', format: 'email' }))  // true
console.log(isEmailOrUrl({ type: 'string', format: 'url' }))    // true
console.log(isEmailOrUrl({ type: 'string' }))                   // false
```

### not

```typescript
function not(
  predicate: (schema: JSONSchema) => boolean
): (schema: JSONSchema) => boolean
```

Inverts a predicate.

**Example:**

```typescript
import { not, hasFormat } from '@quickflo/quickforms-vue'

// String without a format
const isPlainString = not(hasFormat())

console.log(isPlainString({ type: 'string' }))                // true
console.log(isPlainString({ type: 'string', format: 'email' }))  // false
```

---

## Complete Examples

### Example 1: Custom Phone Input

```typescript
import { rankWith, and, isStringType, hasFormat } from '@quickflo/quickforms-vue'
import PhoneInput from './PhoneInput.vue'

// Priority 10 for strings with phone format
const isPhoneField = rankWith(10, and(
  isStringType,
  hasFormat('phone')
))

registry.register('phone', PhoneInput, isPhoneField)

// Use in schema
const schema = {
  phone: {
    type: 'string',
    format: 'phone',  // Triggers PhoneInput
    title: 'Phone Number'
  }
}
```

### Example 2: Custom Widget Selector

```typescript
import { rankWith, hasExtension } from '@quickflo/quickforms-vue'
import ColorPicker from './ColorPicker.vue'
import SliderInput from './SliderInput.vue'

// High priority for x-widget
const isColorWidget = rankWith(15, hasExtension('x-widget', 'color'))
const isSliderWidget = rankWith(15, hasExtension('x-widget', 'slider'))

registry.register('color-picker', ColorPicker, isColorWidget)
registry.register('slider', SliderInput, isSliderWidget)

// Use in schema
const schema = {
  color: {
    type: 'string',
    'x-widget': 'color',  // Triggers ColorPicker
    title: 'Theme Color'
  },
  volume: {
    type: 'number',
    'x-widget': 'slider',  // Triggers SliderInput
    title: 'Volume'
  }
}
```

### Example 3: Override Built-in Component

```typescript
import { rankWith, isStringType } from '@quickflo/quickforms-vue'
import CustomStringField from './CustomStringField.vue'

// Built-in StringField has priority 2
// Use priority 20 to override
const isCustomString = rankWith(20, isStringType)

registry.register('custom-string', CustomStringField, isCustomString)

// Now ALL string fields use CustomStringField
```

### Example 4: Conditional Component

```typescript
import { rankWith, and, isNumberType } from '@quickflo/quickforms-vue'
import RangeSlider from './RangeSlider.vue'

// Use slider for numbers with min/max
const isRangeNumber = rankWith(12, (schema) =>
  isNumberType(schema) &&
  schema.minimum !== undefined &&
  schema.maximum !== undefined
)

registry.register('range-slider', RangeSlider, isRangeNumber)

// Triggers RangeSlider
const schema = {
  age: {
    type: 'number',
    minimum: 0,
    maximum: 120
  }
}
```

---

## Built-in Component Priorities

Reference for built-in component priorities:

| Component | Tester | Priority |
|-----------|--------|----------|
| HiddenField | `x-hidden: true` | 100 |
| OneOfField | `hasOneOf` | 10 |
| AllOfField | `hasAllOf` | 10 |
| ArrayField | `isArrayType` | 5 |
| ObjectField | `isObjectType` | 5 |
| EnumField | `isEnumType` | 4 |
| DateField | `isDateFormat \| isTimeFormat \| isDateTimeFormat` | 3 |
| BooleanField | `isBooleanType` | 2 |
| NumberField | `isNumberType \| isIntegerType` | 2 |
| StringField | `isStringType` | 2 |

**Strategy:**
- Use priority 1-5 for generic fallbacks
- Use priority 10-15 for specific overrides
- Use priority 20+ to override built-ins completely
- Use priority 100+ for critical components (hidden fields)

---

## Best Practices

1. **Start with high priority** - Use 10+ to ensure your component is selected
2. **Be specific** - Combine multiple predicates for precise targeting
3. **Test thoroughly** - Verify your tester matches only intended schemas
4. **Document behavior** - Comment why you're using specific priorities
5. **Avoid conflicts** - Two components at same priority = undefined behavior
6. **Use extensions** - Custom `x-*` properties are cleaner than complex predicates

---

## Debugging

Check which component will render:

```typescript
const schema = { type: 'string', format: 'email' }
const component = registry.getComponent(schema)
console.log(component?.__name)  // Component name
```

List all registered components:

```typescript
// Access internal registry (not officially exposed)
console.log(registry._components)
```

---

## Next Steps

- [Custom Components](/guide/custom-components) - Build and register custom components
- [Schema Extensions](/guide/schema-extensions) - Use `x-*` properties with testers
- [Components API](/guide/components) - All built-in components
