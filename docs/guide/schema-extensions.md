# Schema Extensions

QuickForms extends JSON Schema with custom `x-*` attributes to provide escape hatches for common customization needs.

::: tip
All `x-*` attributes are optional. QuickForms works perfectly with standard JSON Schema—use extensions only when you need them.
:::

## `x-visible-when`

**Purpose:** Conditionally show/hide a field based on another field's value

**Type:** `{ field: string, operator: string, value?: any }`

**Example:**
```typescript
{
  provider: {
    type: 'string',
    enum: ['aws', 'gcp', 'azure']
  },
  // Only visible when AWS is selected
  awsRegion: {
    type: 'string',
    title: 'AWS Region',
    enum: ['us-east-1', 'us-west-2', 'eu-west-1'],
    'x-visible-when': {
      field: 'provider',
      operator: 'eq',
      value: 'aws'
    }
  },
  // Visible for multiple providers
  enableEncryption: {
    type: 'boolean',
    title: 'Enable Encryption',
    'x-visible-when': {
      field: 'provider',
      operator: 'in',
      value: ['aws', 'gcp']
    }
  }
}
```

**Supported Operators:**

| Operator | Aliases | Description |
|----------|---------|-------------|
| `eq` | `==`, `===` | Equals |
| `neq` | `!=`, `!==` | Not equals |
| `in` | | Value is in array |
| `notIn` | `!in` | Value is not in array |
| `gt` | `>` | Greater than (numbers) |
| `gte` | `>=` | Greater than or equal (numbers) |
| `lt` | `<` | Less than (numbers) |
| `lte` | `<=` | Less than or equal (numbers) |
| `truthy` | | Value is truthy (no `value` needed) |
| `falsy` | | Value is falsy (no `value` needed) |
| `like` | | Case-sensitive pattern match (`%` = any chars, `_` = single char) |
| `ilike` | | Case-insensitive pattern match |

**Nested Field Paths:**

You can reference fields nested within objects using dot notation:

```typescript
{
  connectionConfig: {
    type: 'object',
    oneOf: [
      { properties: { provider: { const: 'aws' }, /* ... */ } },
      { properties: { provider: { const: 'gcp' }, /* ... */ } }
    ]
  },
  // Reference the nested discriminator field
  cloudSpecificOption: {
    type: 'string',
    'x-visible-when': {
      field: 'connectionConfig.provider',  // Dot notation for nested path
      operator: 'eq',
      value: 'aws'
    }
  }
}
```

**Pattern Matching with `like`/`ilike`:**

```typescript
{
  // Visible for providers starting with 'cloud-'
  cloudFeature: {
    type: 'boolean',
    'x-visible-when': {
      field: 'provider',
      operator: 'ilike',
      value: 'cloud-%'  // % matches any characters
    }
  }
}
```

**Use Cases:**
- Show provider-specific fields
- Progressive disclosure based on user choices
- Simpler alternative to `oneOf` for basic conditional visibility

**Related:** [Conditional Fields Example](/guide/examples/conditional-fields), [`x-readonly-when`](#x-readonly-when)

---

## `x-readonly-when`

**Purpose:** Conditionally make a field read-only based on another field's value

**Type:** `{ field: string, operator: string, value?: any }`

**Example:**
```typescript
{
  status: {
    type: 'string',
    enum: ['draft', 'published', 'archived']
  },
  // Readonly once published or archived
  title: {
    type: 'string',
    title: 'Title',
    'x-readonly-when': {
      field: 'status',
      operator: 'in',
      value: ['published', 'archived']
    }
  }
}
```

**Operators:** Same as [`x-visible-when`](#x-visible-when)

**Use Cases:**
- Lock fields after a certain status is reached
- Prevent editing based on user selections
- Conditional form protection

**Note:** `x-readonly-when` makes the field read-only when the condition is **TRUE**. This is the opposite of `x-visible-when` which shows the field when the condition is TRUE.

---

## `x-clear-on-hide`

**Purpose:** Control whether a field's value is cleared when it becomes hidden via `x-visible-when`

**Type:** `boolean`

**Default Behavior:** Fields with `x-visible-when` automatically clear their values when hidden. Use `x-clear-on-hide: false` to preserve values.

**Example:**
```typescript
{
  accountType: {
    type: 'string',
    enum: ['personal', 'business']
  },
  // Value is cleared when accountType changes away from 'business'
  taxId: {
    type: 'string',
    title: 'Tax ID',
    'x-visible-when': {
      field: 'accountType',
      operator: 'eq',
      value: 'business'
    }
    // x-clear-on-hide defaults to true when x-visible-when is present
  },
  // Value is preserved even when hidden
  internalNotes: {
    type: 'string',
    'x-visible-when': {
      field: 'accountType',
      operator: 'eq',
      value: 'business'
    },
    'x-clear-on-hide': false  // Preserve value when hidden
  }
}
```

**Use Cases:**
- Clear provider-specific settings when switching providers
- Preserve user input that shouldn't be lost on visibility changes
- Ensure stale data isn't submitted for hidden fields

**Why clear by default?**
When fields become hidden, their values typically become irrelevant. Clearing them:
- Prevents stale data from being submitted
- Ensures the form model matches the visible UI
- Avoids confusion when switching between options

**Note:** This only affects fields hidden via `x-visible-when`. Fields hidden with `x-hidden` or `x-roles` are not affected.

---

## `x-hidden`

**Purpose:** Completely hide a field from rendering (unconditionally)

**Type:** `boolean`

**Example:**
```typescript
{
  systemId: {
    type: 'string',
    'x-hidden': true  // Field is never shown
  }
}
```

**Use Cases:**
- Hidden system fields
- Internal tracking IDs
- Fields set programmatically

**See Also:** [`x-visible-when`](#x-visible-when) for conditional visibility

---

## `x-roles`

**Purpose:** Role-based access control for field visibility and editability

**Type:** `Record<string, ('view' | 'edit')[]>`

**Example:**
```typescript
{
  salary: {
    type: 'number',
    title: 'Salary',
    'x-roles': {
      admin: ['view', 'edit'],    // Admins can see and edit
      manager: ['view'],           // Managers can only view
      employee: []                 // Employees cannot see
    }
  }
}
```

**Permissions:**
- `['view', 'edit']` - Field is visible and editable
- `['view']` - Field is visible but read-only
- `[]` - Field is completely hidden

**Related:** [Role-Based Access Guide](/guide/rbac)

---

## `x-enum-labels`

**Purpose:** Custom display text for enum options while keeping underlying values

**Type:** `Record<string, string>`

**Example:**
```typescript
{
  status: {
    type: 'string',
    enum: ['draft', 'active', 'archived'],
    'x-enum-labels': {
      'draft': '📝 Draft',
      'active': '✅ Active',
      'archived': '📦 Archived'
    }
  }
}
```

**Use Cases:**
- User-friendly labels for technical values
- Internationalization of enum options
- Adding icons/emojis to options

---

## `x-enum-descriptions`

**Purpose:** Add descriptive help text below each enum option in the dropdown

**Type:** `Record<string, string>`

**Example:**
```typescript
{
  outputDetail: {
    type: 'string',
    enum: ['text', 'segments', 'full'],
    title: 'Output Detail',
    'x-enum-labels': {
      text: 'Text',
      segments: 'Segments',
      full: 'Full'
    },
    'x-enum-descriptions': {
      text: 'Only return speech text.',
      segments: 'Speech segments with their start and end times.',
      full: 'Includes text, speech segments, and VTT file.'
    }
  }
}
```

**Visual representation:**
```
[Output Detail ▼]
  Text
  Only return speech text.

  Segments
  Speech segments with their start and end times.

  Full
  Includes text, speech segments, and VTT file.
```

**Use Cases:**
- Explain what each option does
- Help users make informed choices
- Provide context for technical options

**Note:** Works best when combined with `x-enum-labels` for clear label/description separation. Descriptions are rendered as caption text below each option.

---

## `x-item-label`

**Purpose:** Custom labels for array items with template interpolation

**Type:** `string | "none" | false`

**Example:**
```typescript
{
  workHistory: {
    type: 'array',
    title: 'Work History',
    'x-item-label': '{{company}} - {{position}}',
    items: {
      type: 'object',
      properties: {
        company: { type: 'string', title: 'Company' },
        position: { type: 'string', title: 'Position' },
        years: { type: 'number', title: 'Years' }
      }
    }
  }
}
```

**Template Variables:**
- Use `{{propertyName}}` to interpolate item properties
- Set to `"none"` or `false` to hide labels entirely

---

## `x-error-messages`

**Purpose:** Custom validation error messages per rule type

**Type:** `Record<string, string>`

**Example:**
```typescript
{
  password: {
    type: 'string',
    minLength: 8,
    'x-error-messages': {
      required: 'Password is required for security',
      minLength: 'Password must be at least 8 characters long'
    }
  }
}
```

**Available Keys:**
- `required` - When field is required but empty
- `minLength` / `maxLength` - String length validation
- `minimum` / `maximum` - Number range validation
- `pattern` - Regex pattern validation
- `format` - Format validation (email, url, etc.)
- `minItems` / `maxItems` - Array length validation
- `uniqueItems` - Array uniqueness validation

**Alternative:** Use `errorMessages` in form options for app-level messages

---

## `x-component-props`

**Purpose:** Override component-specific behavior for a single field

**Type:** `Record<string, any>`

**Example:**

**Plain Vue:**
```typescript
{
  country: {
    type: 'string',
    enum: ['US', 'CA', 'UK', /* ...100+ countries */],
    'x-component-props': {
      autocomplete: true  // Enable autocomplete for this select
    }
  }
}
```

**Quasar:**
```typescript
{
  bio: {
    type: 'string',
    format: 'textarea',
    'x-component-props': {
      rows: 10,
      dense: true,
      outlined: true
    }
  }
}
```

**Use Cases:**
- Per-field component customization
- Override global component defaults
- Pass native component props

---

## `x-quasar-props`

**Purpose:** Pass native Quasar component props (Quasar package only)

**Type:** `Record<string, any>`

**Example:**
```typescript
{
  priority: {
    type: 'string',
    enum: ['low', 'medium', 'high'],
    'x-quasar-props': {
      color: 'secondary',
      dense: true,
      outlined: true,
      clearable: true
    }
  }
}
```

**Note:** This is an alias for `x-component-props` but makes it clear you're using Quasar-specific props.

**Related:** [Quasar Package Docs](/guide/quasar)

---

## `x-quickforms-quasar`

**Purpose:** QuickForms convenience features for Quasar (not native Quasar props)

**Type:** `Record<string, any>`

**Example:**

**Icons:**
```typescript
{
  email: {
    type: 'string',
    format: 'email',
    'x-quickforms-quasar': {
      prependIcon: 'mail',
      iconColor: 'primary',
      iconSize: 'md'
    }
  }
}
```

**Array Buttons:**
```typescript
{
  tags: {
    type: 'array',
    items: { type: 'string' },
    'x-quickforms-quasar': {
      addButtonPosition: 'top-right',
      addButton: {
        label: 'Add Tag',
        icon: 'add_circle',
        color: 'secondary'
      },
      removeButton: {
        icon: 'delete',
        color: 'negative'
      }
    }
  }
}
```

**Available Properties:**

**For Icons:**
- `prependIcon` - Icon on left side
- `appendIcon` - Icon on right side (not for password/select)
- `iconColor` - Quasar color
- `iconSize` - `'xs' | 'sm' | 'md' | 'lg' | 'xl'`

**For Arrays:**
- `addButtonPosition` - `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`
- `addButton` - Native QBtn props
- `removeButton` - Native QBtn props

**For Tags (arrays with `x-render: 'tags'`):**
- `chip` - Native QChip props (color, textColor, icon, outline, dense, etc.)
- `separator` - RegExp or string pattern for parsing pasted values (default: `/[,;\s]+/`)

**Related:** [Quasar Package Docs](/guide/quasar#quickforms-convenience-features), [TagsField](/guide/components#tagsfield-quasar)

---

## `x-hint`

**Purpose:** HTML-enabled hint text (takes precedence over `description`)

**Type:** `string`

**Example:**
```typescript
{
  email: {
    type: 'string',
    format: 'email',
    'x-hint': 'Read our <a href="/privacy">privacy policy</a>'
  }
}
```

**Difference from `description`:**
- `description` - Plain text only
- `x-hint` - Supports HTML for links, formatting, etc.

---

## `x-hint-mode`

**Purpose:** Control when hints are displayed

**Type:** `"always" | "focus" | "hover"`

**Default:** `"always"`

**Example:**
```typescript
{
  password: {
    type: 'string',
    format: 'password',
    description: 'Must be 8+ characters',
    'x-hint-mode': 'focus'  // Only show hint when field is focused
  }
}
```

---

## `x-oneof-labels`

**Purpose:** Custom display labels for each **option** in the `oneOf`/`anyOf` array

**Type:** `string[]`

**Example:**
```typescript
{
  paymentMethod: {
    oneOf: [
      { title: 'Credit Card', properties: { cardNumber: { type: 'string' } } },
      { title: 'Bank Transfer', properties: { accountNumber: { type: 'string' } } },
      { title: 'PayPal', properties: { email: { type: 'string' } } }
    ],
    // Customize the label shown for each option
    'x-oneof-labels': ['💳 Credit Card', '🏦 Bank Transfer', '📧 PayPal']
  }
}
```

**What it changes:**
- The text displayed for each selectable option in the dropdown or tabs
- Overrides the `title` property of each oneOf schema
- Falls back to `title` or "Option N" if not provided

**Use Cases:**
- Add icons or emojis to option labels
- Provide more descriptive labels than schema titles
- Localization/internationalization of option names

---

## `x-oneof-style`

**Purpose:** Control the display style for `oneOf`/`anyOf` selectors

**Type:** `'tabs' | 'dropdown'`

**Default:** `'tabs'` for 2-4 options, `'dropdown'` for more

**Example:**
```typescript
{
  configuration: {
    oneOf: [
      { type: 'object', title: 'Simple', properties: { ... } },
      { type: 'object', title: 'Advanced', properties: { ... } }
    ],
    'x-oneof-style': 'tabs'  // Force tabs display
  }
}
```

**Global Configuration via componentDefaults:**
```typescript
<DynamicForm
  :schema="schema"
  v-model="data"
  :options="{
    componentDefaults: {
      oneOf: {
        displayStyle: 'dropdown'  // Force all oneOf fields to use dropdown
      }
    }
  }"
/>
```

**Use Cases:**
- Force tabs for visual clarity even with many options
- Force dropdown for space-constrained layouts
- Set a consistent display style across all oneOf fields in a form

---

## `x-oneof-select-label`

**Purpose:** Customize the **label/placeholder** of the dropdown selector itself (not the options)

**Type:** `string`

**Default:** `'Select Option'`

**Important:** This is different from `x-oneof-labels`:
- `x-oneof-labels` - Customizes the labels for each **option** (e.g., "Credit Card", "PayPal")
- `x-oneof-select-label` - Customizes the **dropdown label** (e.g., "Choose payment method")

**Example:**
```typescript
{
  shippingMethod: {
    oneOf: [
      { properties: { method: { const: 'standard' } } },
      { properties: { method: { const: 'express' } } },
      { properties: { method: { const: 'overnight' } } }
    ],
    'x-oneof-style': 'dropdown',
    'x-oneof-select-label': 'Choose shipping option',  // Dropdown label
    'x-oneof-labels': ['Standard (5-7 days)', 'Express (2-3 days)', 'Overnight']  // Option labels
  }
}
```

**Visual representation:**
```
[Choose shipping option ▼]  ← x-oneof-select-label (was "Select Option")
  - Standard (5-7 days)     ← x-oneof-labels[0]
  - Express (2-3 days)      ← x-oneof-labels[1]
  - Overnight               ← x-oneof-labels[2]
```

**Global Configuration via componentDefaults:**
```typescript
<DynamicForm
  :schema="schema"
  v-model="data"
  :options="{
    componentDefaults: {
      oneOf: {
        selectLabel: 'Choose an option'  // Default for all oneOf dropdowns
      }
    }
  }"
/>
```

**Use Cases:**
- Context-specific guidance (e.g., "Select workflow type", "Choose payment method")
- Localization/internationalization
- More descriptive prompts than the generic "Select Option"

**Note:** Only applies when `x-oneof-style` is `'dropdown'` or defaults to dropdown (5+ options)

---

## `x-default-expanded`

**Purpose:** Control whether a specific object field starts expanded or collapsed

**Type:** `boolean`

**Default:** Determined by `componentDefaults.object.defaultExpanded` (see below)

**Example:**
```typescript
{
  advancedSettings: {
    type: 'object',
    title: 'Advanced Settings',
    'x-default-expanded': false,  // Start collapsed even if required
    properties: { ... }
  }
}
```

**Global Configuration via componentDefaults:**
```typescript
<DynamicForm
  :schema="schema"
  v-model="data"
  :options="{
    componentDefaults: {
      object: {
        // 'required-only' = required expanded, optional collapsed (default)
        // 'all' = all objects expanded
        // 'none' = all objects collapsed
        defaultExpanded: 'required-only',
        // Show "(optional)" label for optional objects
        showOptionalIndicator: true
      }
    }
  }"
/>
```

**Use Cases:**
- Keep forms clean by collapsing rarely-used sections
- Force expansion of important optional fields
- Progressive disclosure UX patterns

---

## `x-field-order`

**Purpose:** Control the display order of fields within an object

**Type:** `number` (on individual fields) or `string[]` (on parent object)

**Default:** `999` (fields without `x-field-order` appear last, sorted alphabetically)

QuickForms supports two approaches to field ordering:

### Approach 1: Numeric Order on Individual Fields

Assign a numeric `x-field-order` value to each field. Lower numbers appear first, and fields with the same order are sorted alphabetically by key.

**Example:**
```typescript
{
  type: 'object',
  properties: {
    // These fields will render in order: isActive, firstName, age, status
    // regardless of their order in the schema
    status: {
      type: 'string',
      enum: ['active', 'inactive'],
      'x-field-order': 400  // Enums: 400
    },
    firstName: {
      type: 'string',
      'x-field-order': 200  // Strings: 200
    },
    age: {
      type: 'number',
      'x-field-order': 300  // Numbers: 300
    },
    isActive: {
      type: 'boolean',
      'x-field-order': 100  // Booleans: 100 (appears first)
    }
  }
}
```

**Recommended Order Values for Type Grouping:**
| Field Type | Order Value |
|-----------|-------------|
| Boolean | 100 |
| String | 200 |
| Number | 300 |
| Enum | 400 |
| String Array | 500 |
| Object Array | 600 |
| Object | 700 |

### Approach 2: Array Order on Parent Object

Alternatively, specify an explicit field order array on the parent object's schema:

**Example:**
```typescript
{
  type: 'object',
  'x-field-order': ['firstName', 'lastName', 'email', 'age'],
  properties: {
    age: { type: 'number' },
    email: { type: 'string', format: 'email' },
    firstName: { type: 'string' },
    lastName: { type: 'string' }
  }
}
```

**Priority:** If both approaches are used, the array-based approach takes precedence.

### Nested Object Ordering

Field ordering works recursively. Nested objects respect their own `x-field-order` values:

```typescript
{
  type: 'object',
  properties: {
    settings: {
      type: 'object',
      'x-field-order': 700,  // Parent field order
      properties: {
        // Nested fields have their own ordering
        notifications: {
          type: 'boolean',
          'x-field-order': 100  // Boolean first in nested object
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark'],
          'x-field-order': 400  // Enum after strings/numbers
        },
        displayName: {
          type: 'string',
          'x-field-order': 200  // String second
        }
      }
    }
  }
}
```

**Use Cases:**
- Group similar field types together (all booleans, then strings, etc.)
- Ensure important fields appear first regardless of schema definition order
- Create consistent field ordering across forms generated from different schemas
- Automatic type-based ordering in schema enhancement pipelines

---

## `x-render`

**Purpose:** Force a specific renderer for a field

**Type:** `string`

**Priority:** 50 (higher than automatic type detection)

**Example:**
```typescript
{
  apiSettings: {
    type: 'object',
    title: 'API Settings',
    'x-render': 'jsoneditor'  // Force JSON editor
  }
}
```

**Available Renderers:**
- `'string'` - String field (QInput in Quasar)
- `'number'` - Number field
- `'boolean'` - Boolean field (checkbox)
- `'enum'` - Enum select field
- `'date'` - Date picker field
- `'time'` - Time picker field (Quasar only)
- `'datetime'` - Date/time picker field (Quasar only)
- `'object'` - Object field with nested properties
- `'array'` - Array field with add/remove items
- `'tags'` - Chip-based tags input for arrays (Quasar only) - ideal for emails, keywords
- `'keyvalue'` - Key-value pair editor
- `'json'` or `'jsoneditor'` - JSON code editor with syntax highlighting, linting, and formatting
- `'condition-builder'` or `'jsonlogic-builder'` - Visual JSONLogic condition builder (Quasar only)

**Use Cases:**
- **Override default renderers**: Force a string field even when a custom renderer would normally match
- **Simplify complex types**: Render a complex object as a simple string input
- **Explicit control**: Guarantee which component renders regardless of schema properties
- **Custom component scenarios**: Default all strings to a custom template editor, but selectively render some as plain strings

**Example: Custom Template Editor with String Override**
```typescript
import { createQuasarRegistry, hasXRender, rankWith, isStringType } from '@quickflo/quickforms-quasar';
import TemplateEditor from './TemplateEditor.vue';

const registry = createQuasarRegistry();

// Register custom template editor for ALL string fields (priority 60)
registry.register('template', TemplateEditor, (schema) =>
  rankWith(60, isStringType(schema))
);

// Use in schema:
const schema = {
  type: 'object',
  properties: {
    // This will use TemplateEditor (default for strings)
    emailBody: {
      type: 'string',
      title: 'Email Body'
    },
    
    // This will use regular StringField (override with x-render)
    subject: {
      type: 'string',
      title: 'Subject',
      'x-render': 'string'  // Force standard string input
    }
  }
};
```

**JSON Editor Customization:**
```typescript
{
  type: 'object',
  'x-render': 'jsoneditor',
  'x-json-height': '400px',
  'x-json-dark-theme': true,
  'x-json-line-numbers': true,
  'x-json-format-key': 'Ctrl-f'  // Custom format shortcut
}
```

**Related:** [JsonField Component](/guide/components#jsonfield)

---

## `x-rows`

**Purpose:** Control textarea height in rows

**Type:** `number`

**Default:** `8` (for JSON editor), varies by field type

**Example:**
```typescript
{
  config: {
    type: 'object',
    'x-render': 'jsoneditor',
    'x-rows': 12  // Taller editor
  }
}
```

**Applies to:**
- `format: 'textarea'` - String textarea fields
- `x-render: 'jsoneditor'` - JSON editor fields

---

## `x-show-format-hint`

**Purpose:** Show/hide the format hint icon in JSON editor (Vue package)

**Type:** `boolean`

**Default:** `true`

**Example:**
```typescript
{
  config: {
    type: 'object',
    'x-render': 'jsoneditor',
    'x-show-format-hint': false  // Hide the ⓘ icon
  }
}
```

**Note:** For Quasar, use `x-quickforms-quasar: { showFormatHint: false }` instead.

---

## Combining Extensions

Multiple extensions can be used together:

```typescript
{
  adminEmail: {
    type: 'string',
    format: 'email',
    title: 'Admin Email',
    
    // Role-based access
    'x-roles': {
      admin: ['view', 'edit'],
      user: ['view']
    },
    
    // Custom error messages
    'x-error-messages': {
      required: 'Admin email is required',
      format: 'Please enter a valid email address'
    },
    
    // Hint with HTML
    'x-hint': 'Will receive <strong>all notifications</strong>',
    
    // Quasar-specific
    'x-quickforms-quasar': {
      prependIcon: 'admin_panel_settings',
      iconColor: 'primary'
    }
  }
}
```

## Extension Priority

When multiple sources provide the same configuration:

1. **`x-*` attributes in schema** - Highest priority (field-specific)
2. **`options.componentDefaults`** - Component type defaults
3. **Built-in defaults** - Lowest priority

Example:
```typescript
// Global default
componentDefaults: {
  input: { clearable: true }
}

// Field override
'x-component-props': {
  clearable: false  // This wins
}
```

## Best Practices

1. **Use sparingly** - Extensions are escape hatches, not primary API
2. **Prefer standard JSON Schema** - Only use extensions when needed
3. **Document your extensions** - Comment why you're using them
4. **Validate your schema** - Extensions should not break standard JSON Schema validation
5. **Namespace custom extensions** - Use `x-yourapp-*` for app-specific extensions

## Standard JSON Schema Properties

Remember, many things don't need extensions:

```typescript
{
  // Standard JSON Schema (use these first!)
  title: 'Field Label',           // Display label
  description: 'Help text',       // Plain text hint
  default: 'default value',       // Default value
  examples: ['example1'],         // Example values
  enum: ['a', 'b', 'c'],         // Allowed values
  const: 'fixed-value',           // Constant value
  
  // Only add x-* when you need more control
  'x-enum-labels': { ... },       // When enum values need friendly labels
  'x-hint': '...',                // When you need HTML in hints
  'x-roles': { ... }              // When you need access control
}
```

## Next Steps

- [Form Options API](/guide/form-options) - Configure options at form level
- [Role-Based Access](/guide/rbac) - Using `x-roles`
- [Quasar Package](/guide/quasar) - Quasar-specific extensions
