<script setup lang="ts">
import { ref } from "vue";
import { DynamicForm, JSONSchema } from "@quickflo/quickforms-vue";
import { createQuasarRegistry, QuasarFormOptions } from "../src/index";

const registry = createQuasarRegistry();

// Global Quasar defaults applied to all components
const formOptions: QuasarFormOptions = {
  registry,
  componentDefaults: {
    global: {
      outlined: true, // Apply outlined style to ALL Quasar components
      dense: false, // Apply dense mode to ALL components
    },
    input: {
      // Add clearable button to all inputs
      clearable: true,
    },
    select: {
      // Use chips for enum fields
      useChips: true, // Uncomment to enable
    },
    checkbox: {
      color: "green",
    },
  },
};

const formData = ref({});

const schema: JSONSchema = {
  type: "object",
  title: "Comprehensive Form Demo",
  description: "Demonstrating all QuickForms Quasar features",
  properties: {
    name: {
      type: "string",
      title: "Full Name",
      description: "Enter your full name",
      minLength: 2,
      // dense and outlined come from global defaults
    },
    email: {
      type: "string",
      format: "email",
      title: "Email Address",
      "x-quasar-props": {
        outlined: true,
        color: "primary",
      },
    },
    age: {
      type: "number",
      title: "Age",
      minimum: 0,
      maximum: 120,
      "x-quasar-props": {
        dense: false,
        outlined: true,
        suffix: "years",
      },
    },
    bio: {
      type: "string",
      title: "Biography",
      format: "textarea",
      description: "Tell us about yourself",
      maxLength: 500,
      "x-quasar-props": {
        rows: 4,
        dense: false,
      },
    },
    country: {
      type: "string",
      enum: ["USA", "Canada", "UK", "Germany", "France", "Japan"],
      title: "Country",
      "x-quasar-props": {
        dense: false,
        color: "secondary",
      },
    },
    notifications: {
      type: "boolean",
      title: "Enable email notifications",
      "x-quasar-props": {
        color: "primary",
      },
    },
    birthdate: {
      type: "string",
      format: "date",
      title: "Birth Date",
      "x-quasar-props": {
        dense: false,
      },
    },
    appointmentTime: {
      type: "string",
      format: "time",
      title: "Appointment Time",
      "x-quasar-props": {
        dense: false,
      },
    },
    eventDateTime: {
      type: "string",
      format: "date-time",
      title: "Event Date & Time",
      description: "ISO 8601 format (YYYY-MM-DDTHH:mm:ss)",
      "x-quasar-props": {
        dense: true,
        // Customize format if needed:
        // mask: 'YYYY-MM-DD hh:mm A',  // 12-hour with AM/PM
        // format24h: false,            // Enable 12-hour mode
      },
    },
    priority: {
      type: "string",
      enum: ["low", "medium", "high"],
      title: "Priority Level",
      "x-enum-labels": {
        low: "Low Priority",
        medium: "Medium Priority",
        high: "High Priority",
      },
      "x-quasar-props": {
        dense: false,
      },
    },
    tags: {
      type: "array",
      title: "Tags",
      description: "Add relevant tags",
      items: {
        type: "string",
        title: "Tag",
      },
      "x-quasar-props": {
        dense: false,
      },
    },
    // === CONST FIELD (HIDDEN) ===
    credentialType: {
      const: "gcp_service_account",
      title: "Credential Type",
      description: "This field is automatically hidden and set!",
      // User never sees or interacts with this
    },

    // === ENUM WITH AUTOCOMPLETE ===
    framework: {
      type: "string",
      title: "Preferred Framework",
      description: "Many options - autocomplete automatically enabled",
      enum: [
        "Vue.js",
        "React",
        "Angular",
        "Svelte",
        "SolidJS",
        "Qwik",
        "Alpine.js",
        "Lit",
        "Preact",
        "Ember.js",
      ],
      "x-enum-labels": {
        "Vue.js": "🟢 Vue.js - Progressive Framework",
        React: "⚛️ React - UI Library",
        Angular: "🔴 Angular - Full Framework",
        Svelte: "🧡 Svelte - Compiler",
        SolidJS: "🔵 SolidJS - Fine-Grained Reactivity",
        Qwik: "⚡ Qwik - Resumable",
        "Alpine.js": "🏔️ Alpine.js - Minimal",
        Lit: "🔥 Lit - Web Components",
        Preact: "💜 Preact - Lightweight React",
        "Ember.js": "🐹 Ember.js - Convention over Config",
      },
    },

    // === PASSWORD FIELD ===
    password: {
      type: "string",
      format: "password",
      title: "Password",
      description: "Password field with show/hide toggle",
      minLength: 8,
      "x-quasar-props": {
        dense: false,
      },
    },

    // === URL FIELD ===
    website: {
      type: "string",
      format: "url",
      title: "Website",
      description: "URL validation",
      "x-quasar-props": {
        dense: false,
      },
    },

    // === NUMBER WITH PREFIX/SUFFIX ===
    salary: {
      type: "number",
      title: "Annual Salary",
      minimum: 0,
      maximum: 1000000,
      "x-quasar-props": {
        dense: false,
        prefix: "$",
        suffix: "USD",
      },
    },

    // === TEXTAREA ===
    comments: {
      type: "string",
      format: "textarea",
      title: "Additional Comments",
      maxLength: 500,
      "x-quasar-props": {
        dense: false,
        rows: 3,
        counter: true,
      },
    },
    // === MULTI-SELECT (Array with enum) ===
    skills: {
      type: "array",
      title: "Skills",
      description: "Select multiple skills - autocomplete enabled with chips",
      items: {
        enum: [
          "JavaScript",
          "TypeScript",
          "Vue.js",
          "React",
          "Node.js",
          "Python",
          "Go",
          "Rust",
          "Docker",
          "Kubernetes",
        ],
        "x-enum-labels": { JavaScript: "JS" },
      },
      uniqueItems: true,
      minItems: 1,
      maxItems: 5,
    },

    // === NESTED OBJECT ===
    address: {
      type: "object",
      title: "Address Information",
      description: "Nested object fields",
      properties: {
        street: {
          type: "string",
          title: "Street Address",
          "x-quasar-props": {
            dense: false,
          },
        },
        city: {
          type: "string",
          title: "City",
          "x-quasar-props": {
            dense: false,
          },
        },
        zip: {
          type: "string",
          title: "ZIP Code",
          pattern: "^[0-9]{5}$",
          "x-quasar-props": {
            dense: false,
            mask: "#####",
          },
        },
      },
    },

    // === ONEOF (CONDITIONAL) ===
    paymentMethod: {
      type: "object",
      title: "Payment Method",
      oneOf: [
        {
          title: "Credit Card",
          properties: {
            type: { const: "credit_card" },
            cardNumber: {
              type: "string",
              title: "Card Number",
              pattern: "^[0-9]{16}$",
            },
            cvv: {
              type: "string",
              title: "CVV",
              pattern: "^[0-9]{3}$",
            },
          },
          required: ["cardNumber", "cvv"],
        },
        {
          title: "Bank Transfer",
          properties: {
            type: { const: "bank_transfer" },
            accountNumber: {
              type: "string",
              title: "Account Number",
            },
            routingNumber: {
              type: "string",
              title: "Routing Number",
            },
          },
          required: ["accountNumber", "routingNumber"],
        },
        {
          title: "PayPal",
          properties: {
            type: { const: "paypal" },
            email: {
              type: "string",
              format: "email",
              title: "PayPal Email",
            },
          },
          required: ["email"],
        },
      ],
    },
  },
  required: ["name", "email"],
};

const handleSubmit = () => {
  console.log("Form Data:", formData.value);
};
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title> QuickForms Quasar Demo </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row justify-center">
          <div class="col-12 col-md-8 col-lg-6">
            <q-card>
              <q-card-section>
                <div class="text-h5">QuickForms Feature Showcase</div>
                <div class="text-subtitle2 text-grey q-mb-sm">
                  Comprehensive examples of all QuickForms Quasar features
                </div>
                <q-banner dense class="bg-blue-1 text-blue-9" rounded>
                  <template #avatar>
                    <q-icon name="info" color="blue" />
                  </template>
                  <div class="text-caption">
                    <strong>Features shown:</strong> Const fields (hidden),
                    autocomplete, password, URL, textarea, numbers with
                    prefix/suffix, nested objects, arrays, oneOf (conditional),
                    date/time pickers, and more!
                  </div>
                </q-banner>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <DynamicForm
                  v-model="formData"
                  class="q-pa-md q-gutter-md"
                  :schema="schema"
                  :options="formOptions"
                />
              </q-card-section>

              <q-separator />
            </q-card>

            <q-card class="q-mt-md">
              <q-card-section>
                <div class="text-h6">Form Data (JSON)</div>
              </q-card-section>
              <q-card-section>
                <pre class="text-caption">{{
                  JSON.stringify(formData, null, 2)
                }}</pre>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
