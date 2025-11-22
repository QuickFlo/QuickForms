# Schema Extensions

QuickForms extends JSON Schema with custom `x-*` attributes to provide escape hatches for common customization needs.

::: tip
All `x-*` attributes are optional. QuickForms works perfectly with standard JSON Schema—use extensions only when you need them.
:::

## `x-hidden`

**Purpose:** Completely hide a field from rendering

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
- Verbose descriptions for enum values

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

**Related:** [Quasar Package Docs](/guide/quasar#quickforms-convenience-features)

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

## `x-render`

**Purpose:** Force a specific renderer for a field

**Type:** `string`

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
- `'jsoneditor'` - JSON textarea editor with formatting support

**Use Cases:**
- Force JSON editor for object fields that would normally render as nested fields
- Override automatic component selection

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
