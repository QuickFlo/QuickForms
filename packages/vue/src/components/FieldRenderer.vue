<script setup lang="ts">
import { computed } from 'vue';
import type { JSONSchema, UISchemaElement } from '@quickflo/forms-core';
import { useFormContext } from '../composables/useFormContext.js';

interface Props {
  schema: JSONSchema;
  uischema?: UISchemaElement;
  path: string;
  disabled?: boolean;
  readonly?: boolean;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false
});

// Get registry from context
const context = useFormContext();
if (!context) {
  throw new Error('FieldRenderer must be used within a DynamicForm');
}

// Calculate visibility based on x-hidden and x-roles
const isVisible = computed(() => {
  const schema = props.schema as any;
  
  // x-hidden check
  if (schema['x-hidden'] === true) return false;
  
  // x-roles check
  if (schema['x-roles']) {
    const userRoles = context.context.roles || [];
    const roleConfig = schema['x-roles'];
    
    // If user has no roles but field requires roles, hide
    if (!Array.isArray(userRoles) || userRoles.length === 0) return false;
    
    // Check if any user role has 'view' permission
    const hasView = userRoles.some((role: string) => 
      roleConfig[role] && roleConfig[role].includes('view')
    );
    
    if (!hasView) return false;
  }
  
  return true;
});

// Calculate effective readonly state
const isFieldReadonly = computed(() => {
  // Explicit prop or form context overrides
  if (props.readonly || context.readonly) return true;
  
  const schema = props.schema as any;
  // x-readonly check
  if (schema['x-readonly'] === true) return true;
  
  // x-roles check
  if (schema['x-roles']) {
    const userRoles = context.context.roles || [];
    const roleConfig = schema['x-roles'];
    
    // Check if any user role has 'edit' permission
    const hasEdit = userRoles.some((role: string) => 
      roleConfig[role] && roleConfig[role].includes('edit')
    );
    
    if (!hasEdit) return true; // Readonly if no edit permission
  }
  
  return false;
});

// Get the appropriate component for this schema from registry
const component = computed(() => {
  if (!isVisible.value) return null;
  
  const comp = context.registry.getComponent(props.schema, props.uischema);
  if (!comp) {
    console.warn('No renderer found for schema:', props.schema);
    return null;
  }
  return comp;
});
</script>

<template>
  <!-- Only render if visible -->
  <template v-if="isVisible">
    <component
      :is="component"
      v-if="component"
      :schema="schema"
      :uischema="uischema"
      :path="path"
      :label="label"
      :disabled="disabled || context.disabled"
      :readonly="isFieldReadonly"
    />
    <div v-else class="quickform-no-renderer">
      <p>No renderer available for field: {{ path }}</p>
      <pre>{{ JSON.stringify(schema, null, 2) }}</pre>
    </div>
  </template>
</template>

<style scoped>
.quickform-no-renderer {
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  color: #991b1b;
}

.quickform-no-renderer pre {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 0.25rem;
  overflow-x: auto;
  font-size: 0.75rem;
}
</style>
