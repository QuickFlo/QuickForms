# Role-Based Access Control

Control field visibility and editability based on user roles.

## Basic Example

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name'
      // Visible to everyone
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email'
      // Visible to everyone
    },
    salary: {
      type: 'number',
      title: 'Salary',
      'x-roles': {
        admin: ['view', 'edit'],    // Admins can see and edit
        manager: ['view'],           // Managers can only view
        employee: []                 // Employees cannot see
      }
    },
    apiKey: {
      type: 'string',
      title: 'API Key',
      'x-roles': {
        admin: ['view', 'edit'],    // Only admins have access
        manager: [],
        employee: []
      }
    }
  }
}
```

## Setting User Roles

Pass the current user's roles via form options:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@quickflo/quickforms-vue'

const currentUser = {
  id: 123,
  roles: ['manager']  // Current user is a manager
}

const formData = ref({})

const options = {
  context: {
    roles: currentUser.roles
  }
}
</script>

<template>
  <DynamicForm
    :schema="schema"
    v-model="formData"
    :options="options"
  />
</template>
```

## Role Permissions

Each role can have these permissions:

- **`['view', 'edit']`** - Field is visible and editable
- **`['view']`** - Field is visible but read-only
- **`[]`** - Field is completely hidden

## Multiple Roles

Users can have multiple roles. QuickForms checks if the user has **any** role with the required permissions:

```typescript
const options = {
  context: {
    roles: ['employee', 'team-lead']  // User has multiple roles
  }
}

// In schema
'x-roles': {
  'employee': ['view'],
  'team-lead': ['view', 'edit'],  // This applies!
  'admin': ['view', 'edit']
}
```

If a user has multiple roles with different permissions, the **highest permission level** applies.

## Hide All Fields

Use `x-hidden` to completely hide a field from everyone:

```typescript
{
  systemId: {
    type: 'string',
    'x-hidden': true  // Never shown to any user
  }
}
```

## Common Patterns

### Admin-Only Fields

```typescript
{
  adminSettings: {
    type: 'object',
    'x-roles': {
      admin: ['view', 'edit'],
      user: []
    },
    properties: {
      // ... admin settings
    }
  }
}
```

### Read-Only for Most Users

```typescript
{
  createdBy: {
    type: 'string',
    title: 'Created By',
    'x-roles': {
      admin: ['view', 'edit'],  // Only admins can change
      user: ['view']            // Everyone else can only view
    }
  }
}
```

### Progressive Disclosure

```typescript
{
  basicInfo: {
    type: 'string',
    // No x-roles = visible to everyone
  },
  advancedSettings: {
    type: 'object',
    'x-roles': {
      powerUser: ['view', 'edit'],
      admin: ['view', 'edit'],
      basic: []
    }
  }
}
```

## Dynamic Roles from API

Fetch user roles from your API:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const userRoles = ref<string[]>([])

onMounted(async () => {
  const response = await fetch('/guide/user/roles')
  const data = await response.json()
  userRoles.value = data.roles
})

const options = computed(() => ({
  context: {
    roles: userRoles.value
  }
}))
</script>

<template>
  <DynamicForm v-if="userRoles.length" :options="options" />
</template>
```

## Conditional Logic with Roles

Combine with custom validators for role-based validation:

```typescript
const options = {
  context: {
    roles: ['user']
  },
  validators: {
    budget: (value, allValues, context) => {
      // Only admins can set budget over 10000
      if (value > 10000 && !context?.roles?.includes('admin')) {
        return 'Only admins can set budget over $10,000'
      }
      return true
    }
  }
}
```

## Nested Objects

Role controls apply to nested fields too:

```typescript
{
  userProfile: {
    type: 'object',
    properties: {
      publicInfo: {
        type: 'string'
        // Visible to all
      },
      privateInfo: {
        type: 'string',
        'x-roles': {
          admin: ['view', 'edit'],
          user: []
        }
      }
    }
  }
}
```

## Best Practices

1. **Always validate on the backend** - Client-side role checks are for UX only
2. **Use consistent role names** - Match your backend's role system
3. **Default to restrictive** - Fields without `x-roles` are visible to everyone
4. **Document role requirements** - Keep a list of all roles used in your schemas
5. **Test with different roles** - Verify the form looks correct for each role

## Next Steps

- [Form Options API](/guide/form-options) - Context options
- [Custom Validators](/guide/custom-validators) - Role-based validation
- [Schema Extensions](/guide/schema-extensions) - `x-roles` specification
