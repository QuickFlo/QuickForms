<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormField } from "../composables/useFormField.js";
import { generateFieldId, getLabel, getHint } from "../composables/utils.js";
import type { FieldProps } from "../types/index.js";
import { useFormContext } from "../composables/useFormContext.js";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const formContext = useFormContext();
const validationMode = formContext?.validationMode || "ValidateAndShow";

const { value, errorMessage, label, hint, hintMode } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const fieldId = generateFieldId(props.path);
const showPassword = ref(false);
const isFocused = ref(false);
const isHovered = ref(false);

const isPassword = computed(() => props.schema.format === "password");

const inputType = computed(() => {
  // Determine input type based on format
  if (props.schema.format === "email") return "email";
  if (props.schema.format === "url" || props.schema.format === "uri")
    return "url";
  if (props.schema.format === "password") {
    return showPassword.value ? "text" : "password";
  }
  return "text";
});

const isTextarea = computed(() => {
  // Use textarea for multiline or if maxLength > 200
  return (
    props.schema.format === "textarea" ||
    (props.schema.maxLength && props.schema.maxLength > 200)
  );
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Determine if hint should be shown based on mode
const showHint = computed(() => {
  if (!hint.value || errorMessage.value) return false;
  if (hintMode.value === "always") return true;
  if (hintMode.value === "focus") return isFocused.value;
  if (hintMode.value === "hover") return isHovered.value;
  return true;
});
</script>

<template>
  <div class="quickform-field quickform-string-field">
    <label :for="fieldId" class="quickform-label">
      {{ label }}
      <span v-if="props.schema.required" class="quickform-required">*</span>
    </label>

    <textarea
      v-if="isTextarea"
      :id="fieldId"
      v-model="value as string"
      class="quickform-input quickform-textarea"
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="hint"
      :minlength="
        validationMode !== 'NoValidation' ? schema.minLength : undefined
      "
      :maxlength="
        validationMode !== 'NoValidation' ? schema.maxLength : undefined
      "
      :aria-describedby="hint ? `${fieldId}-hint` : undefined"
      :aria-invalid="!!errorMessage"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    />

    <div v-else class="quickform-input-wrapper">
      <input
        :id="fieldId"
        v-model="value"
        :type="inputType"
        class="quickform-input"
        :class="{ 'quickform-input-with-icon': isPassword }"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="hint"
        :minlength="
          validationMode !== 'NoValidation' ? schema.minLength : undefined
        "
        :maxlength="
          validationMode !== 'NoValidation' ? schema.maxLength : undefined
        "
        :pattern="
          validationMode !== 'NoValidation' ? schema.pattern : undefined
        "
        :aria-describedby="hint ? `${fieldId}-hint` : undefined"
        :aria-invalid="!!errorMessage"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      />
      <button
        v-if="isPassword"
        type="button"
        class="quickform-password-toggle"
        :aria-label="
          showPassword
            ? formContext?.labels.hidePassword
            : formContext?.labels.showPassword
        "
        @click="togglePasswordVisibility"
      >
        <svg
          v-if="showPassword"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>

    <div v-if="showHint" :id="`${fieldId}-hint`" class="quickform-hint">
      <span v-html="hint"></span>
    </div>

    <div v-if="errorMessage" class="quickform-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
@import "../styles/variables.css";

.quickform-field {
  margin-bottom: var(--quickform-field-margin-bottom);
}

.quickform-label {
  display: block;
  margin-bottom: var(--quickform-label-margin-bottom);
  font-weight: var(--quickform-label-font-weight);
  font-size: var(--quickform-label-font-size);
  color: var(--quickform-label-color);
  font-family: var(--quickform-font-family);
}

.quickform-required {
  color: var(--quickform-required-color);
  margin-left: var(--quickform-required-margin-left);
}

.quickform-input,
.quickform-textarea {
  width: 100%;
  padding: var(--quickform-input-padding-y) var(--quickform-input-padding-x);
  border: var(--quickform-input-border-width)
    var(--quickform-input-border-style) var(--quickform-color-border);
  border-radius: var(--quickform-radius-md);
  font-size: var(--quickform-input-font-size);
  font-family: var(--quickform-font-family);
  line-height: var(--quickform-input-line-height);
  background-color: var(--quickform-color-bg);
  color: var(--quickform-color-text);
  box-sizing: border-box;
  transition: border-color var(--quickform-transition-base)
      var(--quickform-transition-timing),
    box-shadow var(--quickform-transition-base)
      var(--quickform-transition-timing);
}

.quickform-input:focus,
.quickform-textarea:focus {
  outline: none;
  border-color: var(--quickform-color-border-focus);
  box-shadow: var(--quickform-shadow-focus);
}

.quickform-input[aria-invalid="true"],
.quickform-textarea[aria-invalid="true"] {
  border-color: var(--quickform-color-error);
  background-color: var(--quickform-color-error-bg);
}

.quickform-textarea {
  min-height: var(--quickform-textarea-min-height);
  resize: var(--quickform-textarea-resize);
}

.quickform-hint {
  margin-top: var(--quickform-hint-margin-top);
  font-size: var(--quickform-hint-font-size);
  color: var(--quickform-hint-color);
}

.quickform-error {
  margin-top: var(--quickform-error-margin-top);
  font-size: var(--quickform-error-font-size);
  color: var(--quickform-error-color);
  font-weight: var(--quickform-font-weight-medium);
}

.quickform-input:disabled,
.quickform-textarea:disabled {
  background-color: var(--quickform-color-bg-disabled);
  color: var(--quickform-color-text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.quickform-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.quickform-input-with-icon {
  padding-right: var(--quickform-password-toggle-size);
}

.quickform-password-toggle {
  position: absolute;
  right: var(--quickform-spacing-md);
  background: none;
  border: none;
  padding: var(--quickform-spacing-sm);
  cursor: pointer;
  color: var(--quickform-password-toggle-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--quickform-transition-base)
    var(--quickform-transition-timing);
  border-radius: var(--quickform-radius-sm);
}

.quickform-password-toggle:hover {
  color: var(--quickform-password-toggle-hover-color);
}

.quickform-password-toggle:focus {
  outline: 2px solid var(--quickform-color-border-focus);
  outline-offset: 2px;
}
</style>
