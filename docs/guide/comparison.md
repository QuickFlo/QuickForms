# Comparison with JSONForms

QuickForms takes inspiration from [JSONForms](https://jsonforms.io/)' excellent architecture but makes different trade-offs for modern Vue development.

## Feature Comparison

| Feature | QuickForms | JSONForms |
|---------|------------|-----------|
| **UI Schema** | Optional | Required for layouts |
| **Theming** | CSS variables (60+) | Framework-dependent |
| **Custom Validators** | Built-in (sync + async) | Not built-in |
| **Vue Version** | Vue 3 Composition API | Vue 2/3 Options API |
| **Bundle Size** | ~56KB gzipped | Varies by renderers |
| **TypeScript** | First-class support | Supported |
| **Role-Based Access** | Built-in | Custom implementation |
| **i18n Support** | Built-in label system | Via i18n library |
| **Validation Modes** | 3 modes (show/hide/none) | Single mode |
| **Status** | Early Stage | Mature & Battle-tested |

## Philosophy Differences

### JSONForms: Separation of Concerns
JSONForms strictly separates data schema (JSON Schema) from presentation (UI Schema). This is powerful for complex layouts but requires maintaining two schemas.

```json
// JSONForms approach
{
  "schema": { /* data structure */ },
  "uischema": {  // Required for layout
    "type": "VerticalLayout",
    "elements": [/* ... */]
  }
}
```

### QuickForms: Sensible Defaults with Escape Hatches
QuickForms works without UI schemas, generating sensible layouts automatically. When you need customization, escape hatches are built into the data schema via `x-*` attributes.

```typescript
// QuickForms approach
{
  "type": "object",
  "properties": {
    "status": {
      "enum": ["draft", "active"],
      "x-enum-labels": {  // Escape hatch
        "draft": "📝 Draft",
        "active": "✅ Active"
      }
    }
  }
}
```

## When to Choose JSONForms

Choose JSONForms if you:
- Need battle-tested production reliability
- Require complex custom layouts (multi-column, tabs, etc.)
- Are working with React or Angular
- Need the UI Schema abstraction for design-dev separation
- Want a mature ecosystem with extensive documentation

## When to Choose QuickForms

Choose QuickForms if you:
- Use Vue 3 and want Composition API patterns
- Prefer rapid development with minimal configuration
- Need built-in RBAC and custom validation
- Want CSS variable theming without design system lock-in
- Prefer escape hatches over separate UI schemas
- Are building workflow engines or admin panels

## Migration from JSONForms

The core concepts translate well:

### Component Registration
Both use a tester-based system for component selection.

**JSONForms:**
```typescript
import { rankWith, isStringControl } from '@jsonforms/core'

const tester = rankWith(10, isStringControl)
```

**QuickForms:**
```typescript
import { rankWith, isStringType } from '@quickflo/quickforms-vue'

const tester = rankWith(10, isStringType)
```

### Custom Renderers
Both allow custom component registration.

**JSONForms:**
```typescript
cells: [
  { tester: customTester, cell: CustomComponent }
]
```

**QuickForms:**
```typescript
registry.register('custom', CustomComponent, customTester)
```

### Validation
JSONForms relies purely on JSON Schema validation. QuickForms extends this with custom validators.

**QuickForms:**
```vue
<DynamicForm
  :schema="schema"
  v-model="formData"
  :options="{
    validators: {
      username: async (value) => {
        // Custom async validation
        return await checkAvailability(value)
      }
    }
  }"
/>
```

## Can I Use Both?

Yes! The core concepts are compatible:
- Both use JSON Schema for data structure
- Both use tester-based component selection
- Schemas are largely interchangeable

You could even use the same JSON Schema with both libraries, adjusting only the UI Schema (JSONForms) or `x-*` attributes (QuickForms) as needed.

## Acknowledgments

QuickForms owes a great debt to JSONForms for pioneering the tester-based component registry system. We're standing on the shoulders of giants.
