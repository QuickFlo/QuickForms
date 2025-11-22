<script setup lang="ts">
import { ref } from "vue";
import DynamicForm from "../src/components/DynamicForm.vue";
import {
  createDefaultRegistry,
  rankWith,
  and,
  isStringType,
  hasFormat,
} from "../src/index.js";
import type { JSONSchema } from "@quickflo/quickforms";
import CustomPhoneField from "./CustomPhoneField.vue";

// Create default registry
const customRegistry = createDefaultRegistry();

// Register custom phone component with high priority
// It will match any string field with format: 'phone'
customRegistry.register("phone", CustomPhoneField, (schema) =>
  rankWith(10, and(isStringType, hasFormat("phone"))(schema))
);

const schema: JSONSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Full Name",
      minLength: 2,
    },
    phone: {
      type: "string",
      format: "phone",
      title: "Phone Number",
      description: "Enter your US phone number",
      pattern: "^\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$",
    },
    email: {
      type: "string",
      format: "email",
      title: "Email Address",
    },
  },
  required: ["name", "phone", "email"],
};

const formData = ref({});

const handleSubmit = (data: any) => {
  console.log("✅ Form with custom component submitted!", data);
};
</script>

<template>
  <div class="custom-registry-demo">
    <h1>🎨 Custom Component Registry Example</h1>
    <p class="description">
      This demonstrates how to register custom components. The phone field uses
      a custom component with auto-formatting!
    </p>

    <div class="demo-grid">
      <div class="form-panel">
        <h2>Form with Custom Phone Component</h2>
        <DynamicForm
          :schema="schema"
          v-model="formData"
          :options="{ registry: customRegistry }"
          @submit="handleSubmit"
        />
      </div>

      <div class="info-panel">
        <div class="data-display">
          <h2>Form Data</h2>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>

        <div class="code-display">
          <h2>How It Works</h2>
          <pre>
import { createDefaultRegistry, rankWith } from '@quickforms/vue';
import CustomPhoneField from './CustomPhoneField.vue';

// Create registry with defaults
const registry = createDefaultRegistry();

// Register custom component
registry.register('phone', CustomPhoneField, (schema) =>
  rankWith(10, 
    isStringType(schema) && 
    schema.format === 'phone'
  )
);

// Use in form
&lt;DynamicForm 
  :schema="schema" 
  v-model="data"
  :options="{ registry }"
/></pre
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-registry-demo {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 0.5rem;
}

.description {
  color: #6b7280;
  margin-bottom: 2rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-panel,
.data-display,
.code-display {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3b82f6;
}

pre {
  margin: 0;
  padding: 1rem;
  background: #1f2937;
  color: #f3f4f6;
  border-radius: 0.375rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
