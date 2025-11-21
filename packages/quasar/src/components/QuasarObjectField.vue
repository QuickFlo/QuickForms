<script setup lang="ts">
import { computed } from 'vue';
import { QExpansionItem } from 'quasar';
import { useFormField } from '@quickflo/quickforms-vue';
import { generateFieldId } from '@quickflo/quickforms-vue';
import { FieldRenderer } from '@quickflo/quickforms-vue';
import type { FieldProps } from '@quickflo/quickforms-vue';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { label, hint, errorMessage } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const fieldId = generateFieldId(props.path);

const quasarProps = computed(() => {
  const xQuasarProps = (props.schema as any)['x-quasar-props'] || {};
  const xComponentProps = (props.schema as any)['x-component-props'] || {};
  return { ...xComponentProps, ...xQuasarProps };
});

// Get properties to render
const properties = computed(() => {
  if (!props.schema.properties) return [];

  return Object.entries(props.schema.properties).map(([key, schema]) => ({
    key,
    schema,
    path: props.path ? `${props.path}.${key}` : key,
  }));
});
</script>

<template>
  <QExpansionItem
    :id="fieldId"
    :label="label"
    :caption="hint"
    default-opened
    v-bind="quasarProps"
  >
    <template #header>
      <div class="text-subtitle1">
        {{ label }}
        <span v-if="schema.required" style="color: red; margin-left: 0.25rem">*</span>
      </div>
    </template>

    <div style="padding: 1rem">
      <FieldRenderer
        v-for="prop in properties"
        :key="prop.key"
        :schema="prop.schema"
        :path="prop.path"
        :disabled="disabled"
        :readonly="readonly"
      />

      <div v-if="errorMessage" style="color: red; font-size: 0.875rem; margin-top: 0.5rem">
        {{ errorMessage }}
      </div>
    </div>
  </QExpansionItem>
</template>
