<script setup lang="ts">
import { ref } from "vue";
import DynamicForm from "../src/components/DynamicForm.vue";
import type { JSONSchema } from "@quickflo/quickforms";

// Comprehensive schema to test all field types with workflows styling
const schema: JSONSchema = {
  type: "object",
  properties: {
    workflowName: {
      type: "string",
      title: "Workflow Name",
      description: "Enter a unique name for your workflow",
      minLength: 3,
    },
    description: {
      type: "string",
      format: "textarea",
      title: "Description",
      description: "Provide details about what this workflow does",
    },
    status: {
      type: "string",
      enum: ["draft", "active", "paused", "archived"],
      title: "Status",
      default: "draft",
      // Custom labels for enum values
      "x-enum-labels": {
        draft: "📝 Draft",
        active: "✅ Active",
        paused: "⏸️ Paused",
        archived: "📦 Archived",
      },
    },
    priority: {
      type: "number",
      title: "Priority",
      description: "Set workflow priority (1-10)",
      minimum: 1,
      maximum: 10,
      default: 5,
    },
    enabled: {
      type: "boolean",
      title: "Enable workflow",
      default: true,
    },
    triggerType: {
      type: "object",
      title: "Trigger Configuration",
      oneOf: [
        {
          title: "Schedule",
          properties: {
            type: { const: "schedule" },
            cronExpression: {
              type: "string",
              title: "Cron Expression",
              description: "e.g., 0 0 * * * for daily at midnight",
            },
          },
          required: ["cronExpression"],
        },
        {
          title: "Webhook",
          properties: {
            type: { const: "webhook" },
            url: {
              type: "string",
              format: "url",
              title: "Webhook URL",
            },
            method: {
              type: "string",
              enum: ["GET", "POST", "PUT", "DELETE"],
              title: "HTTP Method",
              default: "POST",
              // Custom labels with descriptions
              "x-enum-labels": {
                GET: "GET - Retrieve data",
                POST: "POST - Create resource",
                PUT: "PUT - Update resource",
                DELETE: "DELETE - Remove resource",
              },
              // Enable autocomplete for this field specifically
              "x-component-props": {
                autocomplete: true,
              },
            },
          },
          required: ["url", "method"],
        },
      ],
    },
    tags: {
      type: "array",
      title: "Tags",
      description: "Add tags to organize your workflows",
      "x-item-label": "none",
      items: {
        type: "string",
        title: "Tag",
      },
    },
    steps: {
      type: "array",
      title: "Workflow Steps",
      description: "Define the steps in your workflow",
      "x-item-label": "{{name}}",
      items: {
        type: "object",
        title: "Step",
        properties: {
          name: { type: "string", title: "Step Name" },
          action: {
            type: "string",
            enum: [
              "api_call",
              "send_email",
              "transform_data",
              "wait",
              "conditional",
              "loop",
              "parallel",
            ],
            title: "Action Type",
            // Many options - autocomplete enabled automatically via threshold
            "x-enum-labels": {
              api_call: "🌐 API Call",
              send_email: "📧 Send Email",
              transform_data: "🔄 Transform Data",
              wait: "⏱️ Wait",
              conditional: "🔀 Conditional",
              loop: "🔁 Loop",
              parallel: "⚡ Parallel Execution",
            },
          },
          timeout: {
            type: "number",
            title: "Timeout (seconds)",
            minimum: 1,
            default: 30,
          },
        },
        required: ["name", "action"],
      },
    },
  },
  required: ["workflowName", "status"],
};

const formData = ref({});

// Customized labels for Spanish localization example
const customLabels = {
  selectPlaceholder: "Seleccionar una opción...",
  addItem: "Agregar elemento",
  removeItem: "Eliminar",
  showPassword: "Mostrar contraseña",
  hidePassword: "Ocultar contraseña",
};

// Component-specific defaults
const componentDefaults = {
  select: {
    // Auto-enable autocomplete for selects with 5+ options
    autocomplete: false,
    autocompleteThreshold: 5,
  },
};

const handleSubmit = (data: any) => {
  console.log("Workflow configuration submitted:", data);
  alert("Workflow saved! Check console for data.");
};
</script>

<template>
  <div class="workflows-theme-wrapper">
    <!-- Header matching workflows app style -->
    <div class="workflows-header">
      <div class="header-content">
        <h1 class="header-title">QuickForms with Workflows UI Theme</h1>
        <p class="header-subtitle">
          Testing CSS variable overrides to match workflows app styling without
          Quasar components
        </p>
      </div>
    </div>

    <div class="workflows-container">
      <div class="workflows-card">
        <div class="card-header">
          <h2 class="card-title">Create New Workflow</h2>
          <p class="card-description">
            Configure your workflow settings and triggers
          </p>
        </div>

        <div class="card-content">
          <DynamicForm
            :schema="schema"
            v-model="formData"
            :options="{
              useDefaults: true,
              labels: customLabels,
              componentDefaults: componentDefaults,
            }"
            @submit="handleSubmit"
          >
            <template #actions="{ isValid }">
              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!isValid"
                >
                  Save Workflow
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="formData = {}"
                >
                  Reset
                </button>
              </div>
            </template>
          </DynamicForm>
        </div>
      </div>

      <!-- Data preview panel -->
      <div class="workflows-card">
        <div class="card-header">
          <h2 class="card-title">Configuration Preview</h2>
          <p class="card-description">Current workflow configuration</p>
        </div>
        <div class="card-content">
          <pre class="data-preview">{{
            JSON.stringify(formData, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 
  Workflows UI Theme - Overriding QuickForms CSS Variables
  Goal: Match the styling from /workflows/apps/ui without using Quasar
*/

.workflows-theme-wrapper {
  /* Override QuickForms CSS variables to match workflows theme */
  --quickform-font-family: "Inter", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;

  /* Colors from workflows/ui/src/css/quasar.variables.scss */
  --quickform-color-primary: #4a3aff;
  --quickform-color-primary-hover: #6d5fff;
  --quickform-color-primary-light: rgba(74, 58, 255, 0.1);

  /* Greys with subtle purple tint */
  --quickform-color-text: #1f2937;
  --quickform-color-text-secondary: #6b7280;
  --quickform-color-text-disabled: #9ca3af;

  /* Backgrounds */
  --quickform-color-bg: #ffffff;
  --quickform-color-bg-disabled: #f3f4f7;
  --quickform-color-bg-hover: #f9f9fb;

  /* Borders */
  --quickform-color-border: #e0e2e9;
  --quickform-color-border-hover: #d1d3dc;
  --quickform-color-border-focus: #4a3aff;

  /* States */
  --quickform-color-error: #c10015;
  --quickform-color-error-bg: #fef2f2;
  --quickform-color-success: #21ba45;
  --quickform-color-warning: #f2c037;

  /* Spacing - tighter like workflows */
  --quickform-spacing-sm: 0.25rem;
  --quickform-spacing-md: 0.5rem;
  --quickform-spacing-lg: 0.75rem;
  --quickform-spacing-xl: 1rem;

  /* Border radius - more rounded like workflows */
  --quickform-radius-sm: 0.375rem;
  --quickform-radius-md: 0.5rem;
  --quickform-radius-lg: 0.75rem;

  /* Typography */
  --quickform-font-size-base: 0.875rem;
  --quickform-font-size-sm: 0.8125rem;
  --quickform-font-size-xs: 0.75rem;
  --quickform-font-weight-normal: 500;
  --quickform-font-weight-medium: 600;
  --quickform-font-weight-semibold: 700;

  /* Input fields - match workflows style */
  --quickform-input-padding-x: 0.75rem;
  --quickform-input-padding-y: 0.625rem;
  --quickform-input-border-width: 1px;
  --quickform-input-font-size: 0.875rem;

  /* Labels */
  --quickform-label-font-size: 0.8125rem;
  --quickform-label-font-weight: 600;
  --quickform-label-margin-bottom: 0.375rem;
  --quickform-label-color: #374151;

  /* Hints & Errors */
  --quickform-hint-font-size: 0.75rem;
  --quickform-hint-color: #6b7280;
  --quickform-error-font-size: 0.75rem;

  /* Field spacing */
  --quickform-field-margin-bottom: 1.25rem;

  /* Focus ring */
  --quickform-focus-ring-width: 2px;
  --quickform-focus-ring-color: rgba(74, 58, 255, 0.15);

  /* Shadows - subtle like workflows */
  --quickform-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --quickform-shadow-md: 0 2px 4px rgba(0, 0, 0, 0.06);

  /* Nested objects/arrays */
  --quickform-object-bg: #f9f9fb;
  --quickform-object-border-color: #eaebf0;
  --quickform-object-padding: 1rem;

  --quickform-array-bg: transparent;
  --quickform-array-item-bg: #f9f9fb;
  --quickform-array-border-color: #eaebf0;

  min-height: 100vh;
  background: #f8f8f8;
  font-family: var(--quickform-font-family);
}

/* Header styling matching workflows app */
.workflows-header {
  background: linear-gradient(135deg, #16161f 0%, #1a1a24 100%);
  border-bottom: 1px solid #2a2a3a;
  padding: 2rem 1.5rem;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.header-subtitle {
  font-size: 0.9375rem;
  color: #d1d3dc;
  margin: 0;
  font-weight: 500;
}

/* Container */
.workflows-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Card styling matching workflows */
.workflows-card {
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #eaebf0;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eaebf0;
  background: #fafafa;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.375rem 0;
  letter-spacing: -0.015em;
}

.card-description {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.card-content {
  padding: 1.5rem;
}

/* Form actions */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eaebf0;
}

/* Buttons matching workflows style */
.btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 150ms ease;
  font-family: inherit;
  letter-spacing: -0.01em;
}

.btn-primary {
  background: #4a3aff;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(74, 58, 255, 0.15);
}

.btn-primary:hover:not(:disabled) {
  background: #6d5fff;
  box-shadow: 0 2px 4px rgba(74, 58, 255, 0.25);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f7;
  color: #374151;
  border-color: #e0e2e9;
}

.btn-secondary:hover {
  background: #eaebf0;
  border-color: #d1d3dc;
}

/* Data preview */
.data-preview {
  background: #1a1a24;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.8125rem;
  margin: 0;
  font-family: "SF Mono", Monaco, "Cascadia Code", "Courier New", monospace;
  line-height: 1.6;
  border: 1px solid #2a2a3a;
}

/* Responsive */
@media (max-width: 1024px) {
  .workflows-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .workflows-header {
    padding: 1.5rem 1rem;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.875rem;
  }

  .workflows-container {
    padding: 0 1rem 1.5rem;
  }

  .card-header,
  .card-content {
    padding: 1rem;
  }
}
</style>
