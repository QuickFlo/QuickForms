# Nested Objects Example

Working with nested object structures in QuickForms.

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    personalInfo: {
      type: 'object',
      title: 'Personal Information',
      properties: {
        firstName: {
          type: 'string',
          title: 'First Name',
          minLength: 2
        },
        lastName: {
          type: 'string',
          title: 'Last Name',
          minLength: 2
        },
        dateOfBirth: {
          type: 'string',
          format: 'date',
          title: 'Date of Birth'
        }
      },
      required: ['firstName', 'lastName']
    },
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        street: {
          type: 'string',
          title: 'Street Address'
        },
        city: {
          type: 'string',
          title: 'City'
        },
        state: {
          type: 'string',
          title: 'State',
          enum: ['CA', 'NY', 'TX', 'FL', 'WA']
        },
        zipCode: {
          type: 'string',
          title: 'ZIP Code',
          pattern: '^\\d{5}$',
          'x-error-messages': {
            pattern: 'Must be a 5-digit ZIP code'
          }
        }
      },
      required: ['street', 'city', 'state', 'zipCode']
    },
    employment: {
      type: 'object',
      title: 'Employment',
      properties: {
        company: {
          type: 'string',
          title: 'Company Name'
        },
        position: {
          type: 'string',
          title: 'Position'
        },
        salary: {
          type: 'number',
          title: 'Annual Salary',
          minimum: 0
        }
      }
    }
  },
  required: ['personalInfo', 'address']
}

const formData = ref({})
</script>

<template>
  <div class="example-container">
    <h1>User Profile Form</h1>
    
    <DynamicForm
      :schema="schema"
      v-model="formData"
      :options="{ useDefaults: true }"
    />
    
    <div class="form-output">
      <h3>Form Data Structure:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.example-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-output {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.form-output pre {
  font-size: 0.875rem;
  overflow-x: auto;
}
</style>
```

## Quasar Version

With Quasar, nested objects are rendered in expandable cards:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'
import type { JSONSchema } from '@quickflo/quickforms'

const registry = createQuasarRegistry()

const schema: JSONSchema = {
  // Same schema as above
}

const formData = ref({})

const options = {
  registry,
  componentDefaults: {
    global: {
      outlined: true,
      dense: true
    }
  }
}
</script>

<template>
  <q-page padding>
    <div class="q-gutter-md" style="max-width: 800px">
      <h4>User Profile</h4>
      
      <DynamicForm
        :schema="schema"
        v-model="formData"
        :options="options"
      />
      
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Form Data</div>
          <pre class="text-caption">{{ JSON.stringify(formData, null, 2) }}</pre>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
```

## Key Concepts

### Nested Structure

The form data mirrors the schema structure:

```typescript
{
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01'
  },
  address: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105'
  },
  employment: {
    company: 'Acme Corp',
    position: 'Developer',
    salary: 100000
  }
}
```

### Validation Paths

VeeValidate handles nested paths automatically:
- `personalInfo.firstName`
- `address.zipCode`
- `employment.salary`

### Required Nested Objects

```typescript
required: ['personalInfo', 'address']
```

This makes the entire nested object required. To make individual fields optional within a required object:

```typescript
{
  address: {
    type: 'object',
    properties: {
      street: { type: 'string' },  // Required
      apt: { type: 'string' }      // Optional
    },
    required: ['street']  // Only street is required
  }
}
```

### Custom Error Messages

Use `x-error-messages` for better UX:

```typescript
{
  zipCode: {
    type: 'string',
    pattern: '^\\d{5}$',
    'x-error-messages': {
      pattern: 'Must be a 5-digit ZIP code',
      required: 'ZIP code is required'
    }
  }
}
```

## Deeply Nested Example

You can nest objects as deep as needed:

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'object',
      title: 'Company',
      properties: {
        name: { type: 'string', title: 'Company Name' },
        headquarters: {
          type: 'object',
          title: 'Headquarters',
          properties: {
            address: {
              type: 'object',
              title: 'Address',
              properties: {
                street: { type: 'string', title: 'Street' },
                coordinates: {
                  type: 'object',
                  title: 'GPS Coordinates',
                  properties: {
                    lat: { type: 'number', title: 'Latitude' },
                    lng: { type: 'number', title: 'Longitude' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Resulting data structure:
// {
//   company: {
//     name: '...',
//     headquarters: {
//       address: {
//         street: '...',
//         coordinates: {
//           lat: 37.7749,
//           lng: -122.4194
//         }
//       }
//     }
//   }
// }
```

## Accessing Nested Data

```vue
<script setup lang="ts">
const formData = ref({})

// Access nested values
const firstName = computed(() => formData.value.personalInfo?.firstName)
const zipCode = computed(() => formData.value.address?.zipCode)

// Watch nested changes
watch(() => formData.value.address?.state, (newState) => {
  console.log('State changed:', newState)
})

// Programmatically set nested values
const prefillData = () => {
  formData.value = {
    personalInfo: {
      firstName: 'Jane',
      lastName: 'Smith'
    },
    address: {
      street: '456 Oak Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701'
    }
  }
}
</script>
```

## Tips

1. **Grouping**: Use nested objects to logically group related fields
2. **Validation**: Each nested object can have its own `required` array
3. **UI Grouping**: Quasar automatically creates expandable sections for nested objects
4. **Deep Access**: Use optional chaining (`?.`) when accessing nested values
5. **Prefilling**: Set entire nested structures at once

## Next Steps

- [Arrays](/guide/guide/examples/arrays) - Dynamic lists of items
- [Conditional Fields](/guide/guide/examples/conditional-fields) - Fields that depend on other fields
- [Complex Types](/guide/complex-types) - Advanced schema features
