<script setup lang="ts">
import { onMounted } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import type { FieldProps } from '../types/index.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value } = useFormField(props.path, props.schema, { label: props.label });

// Automatically set the const value on mount if not already set
onMounted(() => {
  if (props.schema.const !== undefined && value.value === undefined) {
    value.value = props.schema.const;
  }
});
</script>

<template>
  <!-- Hidden field - renders nothing visible to the user -->
  <input type="hidden" :value="value" />
</template>
