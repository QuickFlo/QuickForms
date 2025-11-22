# Arrays Example

Working with dynamic arrays in QuickForms - add, remove, and reorder items.

## Simple Array Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      items: {
        type: 'string'
      },
      minItems: 1,
      maxItems: 10,
      description: 'Add tags for categorization'
    },
    scores: {
      type: 'array',
      title: 'Test Scores',
      items: {
        type: 'number',
        minimum: 0,
        maximum: 100
      }
    }
  }
}

const formData = ref({
  tags: ['javascript', 'vue'],
  scores: [95, 87, 92]
})
</script>

<template>
  <DynamicForm :schema="schema" v-model="formData" />
</template>
```

## Array of Objects

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import type { JSONSchema } from '@quickflo/quickforms'

const schema: JSONSchema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      title: 'Contacts',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Name',
            minLength: 2
          },
          email: {
            type: 'string',
            format: 'email',
            title: 'Email'
          },
          phone: {
            type: 'string',
            title: 'Phone',
            pattern: '^\\d{3}-\\d{3}-\\d{4}$',
            'x-hint': 'Format: 555-123-4567'
          },
          relationship: {
            type: 'string',
            title: 'Relationship',
            enum: ['family', 'friend', 'colleague', 'other']
          }
        },
        required: ['name']
      },
      minItems: 1,
      maxItems: 5
    }
  },
  required: ['contacts']
}

const formData = ref({
  contacts: [
    {
      name: 'Jane Doe',
      email: 'jane@example.com',
      relationship: 'friend'
    }
  ]
})
</script>

<template>
  <div class="example-container">
    <h1>Contact List</h1>
    
    <DynamicForm
      :schema="schema"
      v-model="formData"
    />
    
    <div class="output">
      <h3>Contacts Data:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>
```

## Quasar Array with Custom Buttons

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'
import { createQuasarRegistry } from '@quickflo/quickforms-quasar'
import type { JSONSchema } from '@quickflo/quickforms'

const registry = createQuasarRegistry()

const schema: JSONSchema = {
  type: 'object',
  properties: {
    teamMembers: {
      type: 'array',
      title: 'Team Members',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Full Name'
          },
          role: {
            type: 'string',
            title: 'Role',
            enum: ['developer', 'designer', 'manager', 'qa']
          },
          skills: {
            type: 'array',
            title: 'Skills',
            items: {
              type: 'string',
              enum: ['javascript', 'typescript', 'vue', 'react', 'python', 'design']
            },
            uniqueItems: true
          }
        }
      },
      // Customize add/remove buttons
      'x-quickforms-quasar': {
        addButtonPosition: 'top-right',
        addButton: {
          label: 'Add Team Member',
          icon: 'person_add',
          color: 'primary',
          push: true
        },
        removeButton: {
          icon: 'delete',
          color: 'negative',
          flat: true,
          round: true
        }
      }
    }
  }
}

const formData = ref({
  teamMembers: []
})

const options = {
  registry,
  componentDefaults: {
    global: {
      outlined: true
    }
  }
}
</script>

<template>
  <q-page padding>
    <div style="max-width: 900px">
      <h4>Team Management</h4>
      
      <DynamicForm
        :schema="schema"
        v-model="formData"
        :options="options"
      />
    </div>
  </q-page>
</template>
```

## Nested Arrays

Arrays can contain other arrays:

```typescript
const schema: JSONSchema = {
  type: 'object',
  properties: {
    departments: {
      type: 'array',
      title: 'Departments',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Department Name'
          },
          projects: {
            type: 'array',
            title: 'Projects',
            items: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  title: 'Project Name'
                },
                tasks: {
                  type: 'array',
                  title: 'Tasks',
                  items: {
                    type: 'string'
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

// Resulting structure:
// {
//   departments: [
//     {
//       name: 'Engineering',
//       projects: [
//         {
//           projectName: 'Website Redesign',
//           tasks: ['Design mockups', 'Build components', 'Testing']
//         }
//       ]
//     }
//   ]
// }
```

## Array Validation

### minItems / maxItems

```typescript
{
  tags: {
    type: 'array',
    items: { type: 'string' },
    minItems: 2,  // Must have at least 2 items
    maxItems: 10  // Cannot have more than 10 items
  }
}
```

### uniqueItems

Ensure all items are unique:

```typescript
{
  selectedOptions: {
    type: 'array',
    items: {
      type: 'string',
      enum: ['option1', 'option2', 'option3']
    },
    uniqueItems: true  // No duplicates allowed
  }
}
```

### Item Validation

Each item is validated according to its schema:

```typescript
{
  ages: {
    type: 'array',
    items: {
      type: 'number',
      minimum: 0,
      maximum: 120
    }
  }
}
```

## Working with Array Data

### Programmatic Access

```vue
<script setup lang="ts">
const formData = ref({ contacts: [] })

// Add item
const addContact = () => {
  formData.value.contacts.push({
    name: '',
    email: ''
  })
}

// Remove item by index
const removeContact = (index: number) => {
  formData.value.contacts.splice(index, 1)
}

// Update specific item
const updateContact = (index: number, updates: any) => {
  formData.value.contacts[index] = {
    ...formData.value.contacts[index],
    ...updates
  }
}

// Check array length
const contactCount = computed(() => formData.value.contacts?.length || 0)

// Watch array changes
watch(() => formData.value.contacts, (newContacts) => {
  console.log(`Contact count: ${newContacts?.length}`)
}, { deep: true })
</script>
```

### Prefill Array Data

```typescript
const formData = ref({
  contacts: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' }
  ]
})
```

## Multi-Select Enum Arrays

For multiple selection from a list:

```typescript
{
  interests: {
    type: 'array',
    title: 'Interests',
    items: {
      type: 'string',
      enum: ['sports', 'music', 'reading', 'gaming', 'cooking', 'travel']
    },
    uniqueItems: true,
    'x-enum-labels': {
      sports: 'Sports & Fitness',
      music: 'Music & Concerts',
      reading: 'Reading & Books',
      gaming: 'Video Games',
      cooking: 'Cooking & Food',
      travel: 'Travel & Adventure'
    }
  }
}
```

With Quasar, this renders as a multi-select dropdown with chips.

## Tips

1. **Default Values**: Always provide initial array in `formData` (empty or with defaults)
2. **Min/Max Items**: Use `minItems`/`maxItems` to enforce array size constraints
3. **Unique Items**: Use `uniqueItems: true` for multi-select scenarios
4. **Custom Buttons**: In Quasar, use `x-quickforms-quasar` to customize add/remove buttons
5. **Deep Watch**: Use `{ deep: true }` when watching arrays for changes
6. **Reordering**: Array items can be reordered (drag-and-drop support varies by package)

## Common Patterns

### Todo List

```typescript
{
  todos: {
    type: 'array',
    title: 'To-Do Items',
    items: {
      type: 'object',
      properties: {
        task: { type: 'string', title: 'Task' },
        completed: { type: 'boolean', title: 'Completed', default: false },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          default: 'medium'
        }
      }
    }
  }
}
```

### Education History

```typescript
{
  education: {
    type: 'array',
    title: 'Education',
    items: {
      type: 'object',
      properties: {
        institution: { type: 'string', title: 'School/University' },
        degree: { type: 'string', title: 'Degree' },
        major: { type: 'string', title: 'Major' },
        startDate: { type: 'string', format: 'date', title: 'Start Date' },
        endDate: { type: 'string', format: 'date', title: 'End Date' },
        gpa: { type: 'number', minimum: 0, maximum: 4, title: 'GPA' }
      }
    }
  }
}
```

## Next Steps

- [Conditional Fields](/guide/guide/examples/conditional-fields) - Dynamic forms based on user input
- [Custom Validation](/guide/guide/examples/custom-validation) - Add custom validation logic
- [Complex Types](/guide/complex-types) - Advanced schema features
