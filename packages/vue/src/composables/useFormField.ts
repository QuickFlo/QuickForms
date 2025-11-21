import { computed } from 'vue';
import { useField } from 'vee-validate';
import type { JSONSchema } from '@quickforms/core';

/**
 * Composable for individual form field with VeeValidate integration
 */
export function useFormField(path: string, schema: JSONSchema) {
  const {
    value,
    errorMessage,
    errors,
    setValue,
    setTouched,
    meta
  } = useField(path, undefined, {
    validateOnValueUpdate: true
  });

  // Computed label from schema
  const label = computed(() => schema.title || path);

  // Computed hint from schema
  const hint = computed(() => schema.description);

  // Check if field is required
  const required = computed(() => {
    // This will be enhanced based on parent schema's required array
    return false; // Placeholder
  });

  return {
    value,
    errorMessage,
    errors,
    setValue,
    setTouched,
    meta,
    label,
    hint,
    required
  };
}
