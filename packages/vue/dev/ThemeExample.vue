<script setup lang="ts">
import { ref } from "vue";
import DynamicForm from "../src/components/DynamicForm.vue";
import type { JSONSchema } from "@quickflo/forms-core";

const schema: JSONSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
      minLength: 2,
    },
    email: {
      type: "string",
      format: "email",
      title: "Email",
    },
    password: {
      type: "string",
      format: "password",
      title: "Password",
      minLength: 8,
    },
  },
  required: ["name", "email", "password"],
};

const formData = ref({});
</script>

<template>
  <div class="theme-demo">
    <h1>🎨 Theme Customization Examples</h1>

    <div class="theme-grid">
      <!-- Default Theme -->
      <div class="theme-section">
        <h2>Default Theme</h2>
        <DynamicForm :schema="schema" v-model="formData" />
      </div>

      <!-- Purple Theme -->
      <div class="theme-section purple-theme">
        <h2>Purple Theme</h2>
        <DynamicForm :schema="schema" v-model="formData" />
      </div>

      <!-- Dark Theme -->
      <div class="theme-section dark-theme">
        <h2>Dark Theme</h2>
        <DynamicForm :schema="schema" v-model="formData" />
      </div>

      <!-- Minimal Theme -->
      <div class="theme-section minimal-theme">
        <h2>Minimal/Brutalist</h2>
        <DynamicForm :schema="schema" v-model="formData" />
      </div>
    </div>

    <!-- Code Examples -->
    <div class="code-section">
      <h2>How to Customize</h2>
      <pre>
/* Override CSS variables in your app's CSS */
:root {
  --quickform-color-primary: #8b5cf6;
  --quickform-radius-md: 0.75rem;
  --quickform-input-padding-x: 1rem;
}</pre
      >
    </div>
  </div>
</template>

<style scoped>
.theme-demo {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.theme-section {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.theme-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

/* Purple Theme */
.purple-theme {
  --quickform-color-primary: #8b5cf6;
  --quickform-color-primary-hover: #7c3aed;
  --quickform-color-primary-light: rgba(139, 92, 246, 0.1);
  --quickform-color-border-focus: #8b5cf6;
  --quickform-radius-md: 0.75rem;
  --quickform-submit-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Dark Theme */
.dark-theme {
  background: #1f2937;
  color: #f3f4f6;

  --quickform-color-primary: #60a5fa;
  --quickform-color-primary-hover: #3b82f6;
  --quickform-color-primary-light: rgba(96, 165, 250, 0.1);
  --quickform-color-text: #f3f4f6;
  --quickform-color-text-secondary: #9ca3af;
  --quickform-color-bg: #374151;
  --quickform-color-bg-disabled: #4b5563;
  --quickform-color-border: #4b5563;
  --quickform-color-border-focus: #60a5fa;
  --quickform-label-color: #f3f4f6;
}

.dark-theme h2 {
  color: #f3f4f6;
}

/* Minimal/Brutalist Theme */
.minimal-theme {
  --quickform-color-primary: #000000;
  --quickform-color-primary-hover: #000000;
  --quickform-color-border: #000000;
  --quickform-color-border-focus: #000000;
  --quickform-input-border-width: 2px;
  --quickform-radius-md: 0;
  --quickform-submit-border-radius: 0;
  --quickform-font-family: monospace;
  --quickform-label-font-weight: 700;
  --quickform-shadow-focus: none;
}

.code-section {
  background: #1f2937;
  color: #f3f4f6;
  padding: 2rem;
  border-radius: 0.5rem;
}

.code-section h2 {
  margin: 0 0 1rem 0;
  color: #f3f4f6;
}

pre {
  margin: 0;
  padding: 1rem;
  background: #111827;
  border-radius: 0.375rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
