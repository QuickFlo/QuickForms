<script setup lang="ts">
import { useFormField } from "../src/composables/useFormField.js";
import { generateFieldId } from "../src/composables/utils.js";
import type { FieldProps } from "../src/types/index.js";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, errorMessage, label, hint } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const fieldId = generateFieldId(props.path);

// Format phone number as user types
const formatPhoneNumber = (event: Event) => {
  const input = event.target as any;
  const cleaned = input.value.replace(/\D/g, "");

  let formatted = "";
  if (cleaned.length > 0) {
    formatted = "(" + cleaned.substring(0, 3);
  }
  if (cleaned.length > 3) {
    formatted += ") " + cleaned.substring(3, 6);
  }
  if (cleaned.length > 6) {
    formatted += "-" + cleaned.substring(6, 10);
  }

  value.value = formatted;
};
</script>

<template>
  <div class="quickform-field custom-phone-field">
    <label :for="fieldId" class="quickform-label">
      📞 {{ label }}
      <span v-if="props.schema.required" class="quickform-required">*</span>
    </label>

    <div class="phone-input-wrapper">
      <span class="phone-prefix">+1</span>
      <input
        :id="fieldId"
        :value="value"
        type="tel"
        class="quickform-input phone-input"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="hint || '(555) 123-4567'"
        maxlength="14"
        @input="formatPhoneNumber"
        :aria-describedby="hint ? `${fieldId}-hint` : undefined"
        :aria-invalid="!!errorMessage"
      />
    </div>

    <div
      v-if="hint && !errorMessage"
      :id="`${fieldId}-hint`"
      class="quickform-hint"
    >
      {{ hint }}
    </div>

    <div v-if="errorMessage" class="quickform-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.custom-phone-field {
  margin-bottom: 1rem;
}

.quickform-label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #1f2937;
}

.quickform-required {
  color: #dc2626;
  margin-left: 0.125rem;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.phone-prefix {
  padding: 0.5rem 0.75rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem 0 0 0.375rem;
  font-weight: 500;
  color: #6b7280;
}

.phone-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0 0.375rem 0.375rem 0;
  font-size: 1rem;
  font-family: monospace;
  letter-spacing: 0.05em;
}

.phone-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.phone-input[aria-invalid="true"] {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.quickform-hint {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.quickform-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}
</style>
