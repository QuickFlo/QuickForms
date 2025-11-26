<script setup lang="ts">
import { computed } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import FieldRenderer from './FieldRenderer.vue';
import type { FieldProps } from '../types/index.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { label, hint, errorMessage } = useFormField(props.path, props.schema, { label: props.label });
const fieldId = generateFieldId(props.path);

// Get properties to render
const properties = computed(() => {
  if (!props.schema.properties) return [];
  
  return Object.entries(props.schema.properties).map(([key, schema]) => ({
    key,
    schema,
    path: props.path ? `${props.path}.${key}` : key
  }));
});
</script>

<template>
  <div class="quickform-field quickform-object-field">
    <fieldset :id="fieldId" class="quickform-fieldset" :aria-describedby="hint ? `${fieldId}-hint` : undefined">
      <legend v-if="label" class="quickform-legend">
        {{ label }}
        <span v-if="props.schema.required" class="quickform-required">*</span>
      </legend>
      
      <div v-if="hint" :id="`${fieldId}-hint`" class="quickform-hint quickform-object-hint">
        <span v-html="hint"></span>
      </div>

      <div class="quickform-object-content">
        <FieldRenderer
          v-for="prop in properties"
          :key="prop.key"
          :schema="prop.schema"
          :path="prop.path"
          :disabled="disabled"
          :readonly="readonly"
        />
        
      </div>

      <div v-if="errorMessage" class="quickform-error">
        {{ errorMessage }}
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.quickform-field {
  margin-bottom: var(--quickform-field-margin-bottom, 1rem);
}

.quickform-fieldset {
  border: 1px solid var(--quickform-color-border);
  border-radius: var(--quickform-radius-md);
  padding: var(--quickform-spacing-lg);
  margin: 0;
  background-color: var(--quickform-object-bg, transparent);
}

.quickform-legend {
  font-weight: var(--quickform-label-font-weight);
  font-size: var(--quickform-label-font-size);
  color: var(--quickform-label-color);
  padding: 0 var(--quickform-spacing-sm);
}

.quickform-object-content {
  display: flex;
  flex-direction: column;
  gap: var(--quickform-spacing-md);
  margin-top: var(--quickform-spacing-md);
}

.quickform-object-hint {
  margin-bottom: var(--quickform-spacing-md);
  margin-top: 0;
}

.quickform-required {
  color: var(--quickform-required-color);
  margin-left: var(--quickform-required-margin-left);
}

.quickform-hint {
  font-size: var(--quickform-hint-font-size);
  color: var(--quickform-hint-color);
}

.quickform-error {
  margin-top: var(--quickform-spacing-sm);
  font-size: var(--quickform-error-font-size);
  color: var(--quickform-error-color);
}
</style>
