<script setup lang="ts">
import { computed } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import FieldRenderer from './FieldRenderer.vue';
import type { FieldProps } from '../types/index.js';
import { schemaUtils } from '../schema-utils-singleton.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { label, hint, errorMessage } = useFormField(props.path, props.schema, { label: props.label });
const fieldId = generateFieldId(props.path);

// Merge all schemas in allOf
const mergedSchema = computed(() => {
  if (!props.schema.allOf) return props.schema;
  
  // Start with base schema (excluding allOf to avoid infinite recursion if we were to use it again, 
  // but here we are creating a new merged schema)
  const baseSchema = { ...props.schema };
  delete baseSchema.allOf;
  
  return schemaUtils.mergeSchemas(baseSchema, ...props.schema.allOf);
});
</script>

<template>
  <div class="quickform-field quickform-allof-field">
    <!-- If the merged result is an object, ObjectField might be better, but FieldRenderer will dispatch correctly -->
    <FieldRenderer
      :schema="mergedSchema"
      :path="path"
      :disabled="disabled"
      :readonly="readonly"
      :label="label"
    />
  </div>
</template>

<style scoped>
.quickform-field {
  margin-bottom: var(--quickform-field-margin-bottom, 1rem);
}
</style>
