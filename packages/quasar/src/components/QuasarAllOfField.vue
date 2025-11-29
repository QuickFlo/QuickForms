<script setup lang="ts">
import { computed } from 'vue';
import { useFormField } from '@quickflo/quickforms-vue';
import { useQuasarFormContext } from '../composables/useQuasarFormContext';
import { SchemaUtils } from '@quickflo/quickforms';
import { FieldRenderer } from '@quickflo/quickforms-vue';
import { useQuasarFormContext } from '../composables/useQuasarFormContext';
import type { FieldProps } from '@quickflo/quickforms-vue';
import { useQuasarFormContext } from '../composables/useQuasarFormContext';
import { getFieldGapStyle } from '../utils';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const formContext = useQuasarFormContext();
const { label } = useFormField(props.path, props.schema, { label: props.label });
const schemaUtils = new SchemaUtils();

const fieldGap = computed(() => getFieldGapStyle(formContext?.componentDefaults));

// Merge all schemas in allOf
const mergedSchema = computed(() => {
  if (!props.schema.allOf) return props.schema;

  const baseSchema = { ...props.schema };
  delete baseSchema.allOf;

  return schemaUtils.mergeSchemas(baseSchema, ...props.schema.allOf);
});
</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <FieldRenderer
      :schema="mergedSchema"
      :path="path"
      :disabled="disabled"
      :readonly="readonly"
      :label="label"
    />
  </div>
</template>
