# Conditional Fields Example

Create dynamic forms where fields appear based on other field values using `oneOf`.

## Simple Conditional Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    accountType: {
      type: 'string',
      title: 'Account Type',
      enum: ['personal', 'business'],
      default: 'personal'
    }
  },
  required: ['accountType'],
  // Conditional fields based on accountType
  oneOf: [
    {
      properties: {
        accountType: { const: 'personal' },
        firstName: {
          type: 'string',
          title: 'First Name'
        },
        lastName: {
          type: 'string',
          title: 'Last Name'
        },
        dateOfBirth: {
          type: 'string',
          format: 'date',
          title: 'Date of Birth'
        }
      },
      required: ['firstName', 'lastName']
    },
    {
      properties: {
        accountType: { const: 'business' },
        companyName: {
          type: 'string',
          title: 'Company Name'
        },
        ein: {
          type: 'string',
          title: 'EIN',
          pattern: '^\\d{2}-\\d{7}$'
        },
        industry: {
          type: 'string',
          title: 'Industry',
          enum: ['tech', 'finance', 'healthcare', 'retail', 'other']
        }
      },
      required: ['companyName', 'ein']
    }
  ]
}

const formData = ref({ accountType: 'personal' })
</script>

<template>
  <DynamicForm :schema="schema" v-model="formData" />
</template>
```

## Payment Method Selector

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    paymentMethod: {
      type: 'string',
      title: 'Payment Method',
      enum: ['credit_card', 'bank_transfer', 'paypal']
    }
  },
  oneOf: [
    {
      title: 'Credit Card',
      properties: {
        paymentMethod: { const: 'credit_card' },
        cardNumber: {
          type: 'string',
          title: 'Card Number',
          pattern: '^\\d{16}$'
        },
        expiryDate: {
          type: 'string',
          title: 'Expiry (MM/YY)',
          pattern: '^\\d{2}/\\d{2}$'
        },
        cvv: {
          type: 'string',
          title: 'CVV',
          pattern: '^\\d{3,4}$'
        }
      }
    },
    {
      title: 'Bank Transfer',
      properties: {
        paymentMethod: { const: 'bank_transfer' },
        accountNumber: {
          type: 'string',
          title: 'Account Number'
        },
        routingNumber: {
          type: 'string',
          title: 'Routing Number',
          pattern: '^\\d{9}$'
        }
      }
    },
    {
      title: 'PayPal',
      properties: {
        paymentMethod: { const: 'paypal' },
        email: {
          type: 'string',
          format: 'email',
          title: 'PayPal Email'
        }
      }
    }
  ]
}
```

## Shipping Options

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    shippingMethod: {
      type: 'string',
      title: 'Shipping Method',
      enum: ['standard', 'express', 'pickup'],
      'x-enum-labels': {
        standard: 'Standard Shipping (5-7 days)',
        express: 'Express Shipping (1-2 days)',
        pickup: 'In-Store Pickup'
      }
    }
  },
  oneOf: [
    {
      properties: {
        shippingMethod: { const: 'standard' },
        address: {
          type: 'object',
          title: 'Shipping Address',
          properties: {
            street: { type: 'string', title: 'Street' },
            city: { type: 'string', title: 'City' },
            state: { type: 'string', title: 'State' },
            zip: { type: 'string', title: 'ZIP' }
          }
        }
      }
    },
    {
      properties: {
        shippingMethod: { const: 'express' },
        address: {
          type: 'object',
          title: 'Shipping Address',
          properties: {
            street: { type: 'string', title: 'Street' },
            city: { type: 'string', title: 'City' },
            state: { type: 'string', title: 'State' },
            zip: { type: 'string', title: 'ZIP' }
          }
        },
        phoneNumber: {
          type: 'string',
          title: 'Phone Number',
          description: 'Required for express delivery'
        }
      }
    },
    {
      properties: {
        shippingMethod: { const: 'pickup' },
        store: {
          type: 'string',
          title: 'Pickup Location',
          enum: ['store1', 'store2', 'store3'],
          'x-enum-labels': {
            store1: 'Downtown Location',
            store2: 'Westside Mall',
            store3: 'North Plaza'
          }
        },
        pickupDate: {
          type: 'string',
          format: 'date',
          title: 'Pickup Date'
        }
      }
    }
  ]
}
```

## How It Works

### The Discriminator Field

The first field acts as the "discriminator" that controls which schema is active:

```typescript
{
  accountType: {
    type: 'string',
    enum: ['personal', 'business']
  }
}
```

### Conditional Schemas

Each schema in `oneOf` uses `const` to match the discriminator value:

```typescript
oneOf: [
  {
    properties: {
      accountType: { const: 'personal' },  // Match this value
      // ... personal fields
    }
  },
  {
    properties: {
      accountType: { const: 'business' },  // Match this value
      // ... business fields
    }
  }
]
```

### Form Behavior

1. User selects a value in the discriminator field
2. QuickForms finds matching `oneOf` schema
3. Only fields from that schema are rendered
4. Validation applies only to visible fields

## Complex Example: Survey Form

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    employmentStatus: {
      type: 'string',
      title: 'Employment Status',
      enum: ['employed', 'self-employed', 'unemployed', 'student', 'retired']
    }
  },
  oneOf: [
    {
      title: 'Employed',
      properties: {
        employmentStatus: { const: 'employed' },
        employer: { type: 'string', title: 'Employer' },
        jobTitle: { type: 'string', title: 'Job Title' },
        yearsEmployed: { type: 'number', title: 'Years at Current Job', minimum: 0 },
        annualIncome: {
          type: 'number',
          title: 'Annual Income',
          minimum: 0,
          'x-component-props': {
            prefix: '$'
          }
        }
      }
    },
    {
      title: 'Self-Employed',
      properties: {
        employmentStatus: { const: 'self-employed' },
        businessName: { type: 'string', title: 'Business Name' },
        businessType: {
          type: 'string',
          title: 'Business Type',
          enum: ['sole-proprietor', 'llc', 'corporation', 'partnership']
        },
        yearsInBusiness: { type: 'number', title: 'Years in Business', minimum: 0 },
        estimatedIncome: {
          type: 'number',
          title: 'Estimated Annual Income',
          minimum: 0
        }
      }
    },
    {
      title: 'Unemployed',
      properties: {
        employmentStatus: { const: 'unemployed' },
        lastEmployer: { type: 'string', title: 'Last Employer' },
        unemployedSince: {
          type: 'string',
          format: 'date',
          title: 'Unemployed Since'
        },
        seekingWork: {
          type: 'boolean',
          title: 'Actively Seeking Work',
          default: true
        }
      }
    },
    {
      title: 'Student',
      properties: {
        employmentStatus: { const: 'student' },
        school: { type: 'string', title: 'School/University' },
        degreeProgram: { type: 'string', title: 'Degree Program' },
        expectedGraduation: {
          type: 'string',
          format: 'date',
          title: 'Expected Graduation'
        },
        partTimeWork: {
          type: 'boolean',
          title: 'Work Part-Time',
          default: false
        }
      }
    },
    {
      title: 'Retired',
      properties: {
        employmentStatus: { const: 'retired' },
        retirementYear: {
          type: 'number',
          title: 'Year of Retirement',
          minimum: 1950,
          maximum: new Date().getFullYear()
        },
        lastOccupation: { type: 'string', title: 'Last Occupation' },
        pensionIncome: {
          type: 'number',
          title: 'Annual Pension/Retirement Income',
          minimum: 0
        }
      }
    }
  ]
}
```

## Tips

1. **Clear Labels**: Use descriptive `title` in each `oneOf` schema
2. **Default Values**: Set a default for the discriminator field
3. **Enum Labels**: Use `x-enum-labels` for better UX
4. **Validation**: Each `oneOf` schema can have its own `required` array
5. **Nested Objects**: Conditional schemas can include nested objects and arrays

## Next Steps

- [Custom Validation](/guide/guide/examples/custom-validation) - Add custom validation logic
- [Complex Types](/guide/complex-types) - More about oneOf, anyOf, allOf
- [Schema Extensions](/guide/schema-extensions) - Custom schema properties
