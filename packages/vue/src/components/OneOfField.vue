<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useFormField } from '../composables/useFormField.js';
import { generateFieldId } from '../composables/utils.js';
import FieldRenderer from './FieldRenderer.vue';
import type { FieldProps } from '../types/index.js';
import { schemaUtils } from '../schema-utils-singleton.js';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false
});

const { value, label, hint, errorMessage } = useFormField(props.path, props.schema, { label: props.label });
const fieldId = generateFieldId(props.path);

// Get the sub-schemas
const options = computed(() => props.schema.oneOf || props.schema.anyOf || []);

// Selected option index
const selectedIndex = ref(0);

// Try to determine initial selection based on data
onMounted(() => {
  if (value.value) {
    // Find the first schema that validates the current data
    const index = options.value.findIndex(optionSchema => {
      const result = schemaUtils.validate(optionSchema, value.value);
      return result.valid;
    });
    
    if (index !== -1) {
      selectedIndex.value = index;
    }
  }
});

const activeSchema = computed(() => options.value[selectedIndex.value]);

// Compute display labels for the dropdown
const optionLabels = computed(() => {
  return options.value.map((option, index) => {
    return option.title || `Option ${index + 1}`;
  });
});

// Handle manual switch
const handleOptionChange = (event: Event) => {
  const newIndex = Number((event.target as any).value);
  selectedIndex.value = newIndex;
  
  // Optional: Clear value on switch? 
  // For now we keep it to allow common fields to persist, 
  // but in many cases you might want to value.value = {} or default
};
</script>

<template>
  <div class="quickform-field quickform-oneof-field">
    <fieldset :id="fieldId" class="quickform-fieldset" :aria-describedby="hint ? `${fieldId}-hint` : undefined">
      <legend v-if="label" class="quickform-legend">
        {{ label }}
        <span v-if="props.schema.required" class="quickform-required">*</span>
      </legend>
      
      <div v-if="hint" :id="`${fieldId}-hint`" class="quickform-hint quickform-oneof-hint">
        <span v-html="hint"></span>
      </div>

      <div class="quickform-oneof-selector">
        <select 
          :value="selectedIndex" 
          @change="handleOptionChange"
          class="quickform-select"
          :disabled="disabled || readonly"
        >
          <option v-for="(label, index) in optionLabels" :key="index" :value="index">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="quickform-oneof-content">
        <FieldRenderer
          v-if="activeSchema"
          :schema="activeSchema"
          :path="path"
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
  margin-bottom: 1rem;
}

.quickform-fieldset {
  border: 1px solid var(--quickform-color-border);
  border-radius: var(--quickform-radius-md);
  padding: var(--quickform-spacing-lg);
  margin: 0;
  background-color: var(--quickform-oneof-bg, transparent);
}

.quickform-legend {
  font-weight: var(--quickform-label-font-weight);
  font-size: var(--quickform-label-font-size);
  color: var(--quickform-label-color);
  padding: 0 var(--quickform-spacing-sm);
}

.quickform-oneof-hint {
  margin-bottom: var(--quickform-spacing-md);
  margin-top: 0;
}

.quickform-oneof-selector {
  margin-bottom: var(--quickform-spacing-md);
}

.quickform-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.quickform-oneof-content {
  margin-top: var(--quickform-spacing-md);
  border-top: 1px dashed var(--quickform-color-border);
  padding-top: var(--quickform-spacing-md);
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
