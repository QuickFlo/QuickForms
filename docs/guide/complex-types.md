# Complex Types

Learn how to work with nested objects, arrays, and conditional schemas in QuickForms.

## Nested Objects

Use `type: 'object'` with `properties` to create nested structures.

### Basic Example

```typescript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      title: 'User Information',
      properties: {
        firstName: { type: 'string', title: 'First Name' },
        lastName: { type: 'string', title: 'Last Name' },
        email: { type: 'string', format: 'email', title: 'Email' }
      },
      required: ['firstName', 'lastName', 'email']
    },
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        street: { type: 'string', title: 'Street' },
        city: { type: 'string', title: 'City' },
        state: { type: 'string', title: 'State' },
        zip: { type: 'string', pattern: '^\\d{5}$', title: 'ZIP Code' }
      },
      required: ['street', 'city', 'state', 'zip']
    }
  }
}
```

### Deep Nesting

Objects can be nested to any depth:

```typescript
{
  company: {
    type: 'object',
    properties: {
      info: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          founded: { type: 'number' }
        }
      },
      address: {
        type: 'object',
        properties: {
          headquarters: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' }
            }
          }
        }
      }
    }
  }
}
```

## Arrays

Use `type: 'array'` with `items` to define repeatable fields.

### Array of Primitives

```typescript
const schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      items: {
        type: 'string',
        title: 'Tag'
      },
      minItems: 1,
      maxItems: 10
    },
    scores: {
      type: 'array',
      title: 'Scores',
      items: {
        type: 'number',
        minimum: 0,
        maximum: 100
      }
    }
  }
}
```

### Array of Objects

```typescript
const schema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      title: 'Contacts',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', format: 'email', title: 'Email' },
          phone: { type: 'string', title: 'Phone' }
        },
        required: ['name', 'email']
      }
    }
  }
}
```

### Custom Array Item Labels

Use `x-item-label` to customize how items are displayed:

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
        startDate: { type: 'string', format: 'date', title: 'Start Date' },
        endDate: { type: 'string', format: 'date', title: 'End Date' }
      }
    }
  }
}
```

### Array Validation

```typescript
{
  team: {
    type: 'array',
    title: 'Team Members',
    minItems: 2,        // At least 2 members
    maxItems: 10,       // At most 10 members
    uniqueItems: true,  // No duplicates
    items: {
      type: 'string'
    }
  }
}
```

## Conditional Schemas (oneOf)

Use `oneOf` when a field can match exactly one of several schemas.

### Payment Method Example

```typescript
const schema = {
  type: 'object',
  properties: {
    paymentMethod: {
      type: 'object',
      title: 'Payment Method',
      oneOf: [
        {
          title: 'Credit Card',
          properties: {
            type: { const: 'credit_card' },
            cardNumber: { 
              type: 'string', 
              pattern: '^\\d{16}$',
              title: 'Card Number'
            },
            cvv: { 
              type: 'string', 
              pattern: '^\\d{3}$',
              title: 'CVV'
            },
            expiryDate: {
              type: 'string',
              pattern: '^(0[1-9]|1[0-2])\\/\\d{2}$',
              title: 'Expiry (MM/YY)'
            }
          },
          required: ['cardNumber', 'cvv', 'expiryDate']
        },
        {
          title: 'PayPal',
          properties: {
            type: { const: 'paypal' },
            email: { 
              type: 'string', 
              format: 'email',
              title: 'PayPal Email'
            }
          },
          required: ['email']
        },
        {
          title: 'Bank Transfer',
          properties: {
            type: { const: 'bank_transfer' },
            accountNumber: { type: 'string', title: 'Account Number' },
            routingNumber: { type: 'string', title: 'Routing Number' }
          },
          required: ['accountNumber', 'routingNumber']
        }
      ]
    }
  }
}
```

### How oneOf Works

1. User selects which schema to use (dropdown or tabs)
2. Form displays only the fields for the selected schema
3. Validation ensures data matches exactly one schema

### Discriminator with `const`

Use `const` to create a type discriminator:

```typescript
{
  contact: {
    oneOf: [
      {
        title: 'Email Contact',
        properties: {
          method: { const: 'email' },  // Discriminator
          email: { type: 'string', format: 'email' }
        }
      },
      {
        title: 'Phone Contact',
        properties: {
          method: { const: 'phone' },  // Discriminator
          phone: { type: 'string' }
        }
      }
    ]
  }
}
```

## anyOf

Use `anyOf` when data can match one or more schemas.

```typescript
{
  notifications: {
    type: 'object',
    title: 'Notification Settings',
    anyOf: [
      {
        properties: {
          email: { type: 'boolean', title: 'Email Notifications' },
          emailAddress: { type: 'string', format: 'email' }
        }
      },
      {
        properties: {
          sms: { type: 'boolean', title: 'SMS Notifications' },
          phoneNumber: { type: 'string' }
        }
      }
    ]
  }
}
```

**Difference from oneOf:** With `anyOf`, multiple schemas can match simultaneously.

## allOf

Use `allOf` to merge multiple schemas into one.

```typescript
{
  user: {
    allOf: [
      {
        // Base user info
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' }
        },
        required: ['name', 'email']
      },
      {
        // Additional fields
        type: 'object',
        properties: {
          age: { type: 'number', minimum: 18 },
          country: { type: 'string' }
        }
      }
    ]
  }
}
```

**Use Cases:**
- Composition: Combine base schemas with extensions
- Inheritance: Add fields to a base type
- Mixins: Merge common field sets

## Combining Complex Types

You can combine nested objects, arrays, and conditional schemas:

```typescript
const schema = {
  type: 'object',
  properties: {
    projects: {
      type: 'array',
      title: 'Projects',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Project Name' },
          members: {
            type: 'array',
            title: 'Team Members',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                role: {
                  type: 'string',
                  enum: ['developer', 'designer', 'manager']
                },
                contact: {
                  oneOf: [
                    {
                      title: 'Email',
                      properties: {
                        type: { const: 'email' },
                        email: { type: 'string', format: 'email' }
                      }
                    },
                    {
                      title: 'Phone',
                      properties: {
                        type: { const: 'phone' },
                        phone: { type: 'string' }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
}
```

This creates: **Array of objects** → each with **array of objects** → each with **conditional field**.

## Default Values

Set default values for complex types:

```typescript
{
  preferences: {
    type: 'object',
    default: {
      theme: 'light',
      notifications: true
    },
    properties: {
      theme: { type: 'string', enum: ['light', 'dark'] },
      notifications: { type: 'boolean' }
    }
  },
  tags: {
    type: 'array',
    default: ['javascript', 'vue'],
    items: { type: 'string' }
  }
}
```

Enable defaults in form options:

```vue
<DynamicForm :options="{ useDefaults: true }" />
```

## Required Fields in Nested Objects

Each object level has its own `required` array:

```typescript
{
  user: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' }
    },
    required: ['name', 'email']  // Required at this level
  },
  address: {
    type: 'object',
    properties: {
      street: { type: 'string' },
      city: { type: 'string' }
    },
    required: ['city']  // Only city is required
  }
}
```

## Best Practices

1. **Keep nesting shallow** - Deeply nested forms are hard to use
2. **Use meaningful titles** - Help users understand structure
3. **Provide defaults** - Especially for nested objects
4. **Validate arrays** - Use minItems/maxItems appropriately
5. **Use oneOf sparingly** - Only when truly mutually exclusive
6. **Label array items** - Use `x-item-label` for better UX
7. **Test deeply nested forms** - Ensure validation works at all levels

## Next Steps

- [Schema Basics](/guide/schema-basics) - Fundamental schema concepts
- [Validation](/guide/validation) - Validation for complex types
- [Schema Extensions](/guide/schema-extensions) - `x-item-label` and more
- [Examples](/guide/examples/nested-objects) - Working examples
