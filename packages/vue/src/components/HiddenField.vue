<script setup lang="ts">
import { onMounted } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import type { FieldProps } from '../types/index.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value } = useFormField(props.path, props.schema, { label: props.label });

// Automatically set the const or default value on mount if not already set
// This ensures discriminator fields get their values in oneOf/anyOf schemas
onMounted(() => {
  if (value.value === undefined) {
    if (props.schema.const !== undefined) {
      value.value = props.schema.const;
    } else if (props.schema.default !== undefined) {
      value.value = props.schema.default;
    }
  }
});
</script>

<template>
  <!-- Hidden field - renders nothing visible to the user -->
  <input type="hidden" :value="value" />
</template>
