<script setup lang="ts">
import { ref } from "vue";
import { DynamicForm, JSONSchema } from "@quickflo/quickforms-vue";
import { createQuasarRegistry, QuasarFormOptions } from "../src/index";
import Showcase from "./Showcase.vue";

const showShowcase = ref(true);

const registry = createQuasarRegistry();

// Global Quasar defaults applied to all components
const formOptions: QuasarFormOptions = {
  registry,
  validateOnMount: false,

  componentDefaults: {
    // Layout options - control spacing between fields
    layout: {
      // Quasar sizes: 'xs' (4px), 'sm' (8px), 'md' (16px), 'lg' (24px), 'xl' (32px)
      // Or any CSS value: '1.5rem', '20px', etc.
      fieldGap: "lg", // More spacious form layout
    },
    // Object field behavior
    object: {
      // 'required-only' = required expanded, optional collapsed (default)
      // 'all' = all objects expanded
      // 'none' = all objects collapsed
      defaultExpanded: "required-only",
      showOptionalIndicator: true, // Show "(optional)" on optional objects
    },
    global: {
      outlined: true, // Apply outlined style to ALL Quasar components
      dense: false, // Apply dense mode to ALL components
    },
    input: {
      // Add clearable button to all inputs
      clearable: false,
    },
    select: {
      clearable: true,
    },
    checkbox: {
      color: "green",
    },
  },
  // QuickForms convenience features
  quickformsDefaults: {
    input: {
      iconColor: "grey-7",
      iconSize: "sm",
    },

    array: {
      // Global defaults for all arrays (can be overridden per-field)
      addButtonPosition: "bottom-left",
      addButton: {
        // Full QBtn props supported!
        color: "primary",
        outline: true,
      },
      removeButton: {
        color: "negative",
      },
      sectionStyle: "card",
    },
    keyvalue: {
      addButton: {},
    },
    jsoneditor: {},
    jsonlogicbuilder: {
      operatorDisplayMode: "icon",
      leftPlaceholder: "{{ field }}",
      rightPlaceholder: "value or {{ expression }}",
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
      description: "Simple array with custom add button",
      items: {
        type: "string",
        title: "Tag",
        minLength: 1,
      },
      "x-quickforms-quasar": {
        addButtonPosition: "top-right",
        addButton: {
          label: "Add Tag",
          icon: "add_circle",
          color: "secondary",
        },
        removeButton: {
          icon: "delete",
        },
      },
    },

    // === TAGS INPUT (CHIPS) ===
    emailRecipients: {
      type: "array",
      title: "Email Recipients",
      description:
        "Chip-based tags input for emails. Type and press Enter, or paste multiple comma-separated values.",
      "x-render": "tags",
      items: {
        type: "string",
        format: "email",
      },
      minItems: 1,
      "x-quickforms-quasar": {
        chip: {
          color: "primary",
          textColor: "white",
          icon: "email",
        },
      },
    },

    // === TAGS INPUT (CUSTOM STYLING) ===
    keywords: {
      type: "array",
      title: "Keywords",
      description:
        "Tags with custom chip styling - try pasting: vue, react, angular",
      "x-render": "tags",
      items: {
        type: "string",
      },
      "x-placeholder": "Add keywords...",
      "x-quickforms-quasar": {
        chip: {
          color: "secondary",
          outline: true,
          dense: true,
        },
        separator: /[,;\n]+/, // Only split on comma, semicolon, newline (not spaces)
      },
    },

    // === ARRAY OF OBJECTS ===
    teamMembers: {
      type: "array",
      title: "Team Members",
      description: "Array of objects with custom labels and positioning",
      items: {
        type: "object",
        title: "Team Member",
        properties: {
          name: {
            type: "string",
            title: "Name",
            minLength: 2,
          },
          role: {
            type: "string",
            title: "Role",
            enum: ["Developer", "Designer", "Manager", "QA"],
          },
          email: {
            type: "string",
            format: "email",
            title: "Email",
          },
          startDate: {
            type: "string",
            format: "date",
            title: "Start Date",
          },
        },
        required: ["name", "role"],
      },
      minItems: 0,
      maxItems: 5,
      "x-item-label": "{{name}} - {{role}}",
      "x-quickforms-quasar": {
        addButtonPosition: "bottom-right",
        addButton: {
          label: "Add Team Member",
          icon: "person_add",
          color: "positive",

          // Can use ANY QBtn prop: size, fab, push, unelevated, etc.
        },
        removeButton: {
          icon: "person_remove",
          color: "negative",
        },
      },
    },

    // === ARRAY WITH DIFFERENT BUTTON POSITIONS ===
    todos: {
      type: "array",
      title: "Todo List (Add button: bottom-left)",
      items: {
        type: "object",
        properties: {
          task: {
            type: "string",
            title: "Task",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            title: "Priority",
          },
          completed: {
            type: "boolean",
            title: "Completed",
          },
        },
      },
      "x-item-label": "{{task}}",
      "x-quickforms-quasar": {
        addButtonPosition: "bottom-left",
        addButton: {
          label: "Add Todo",
        },
      },
    },

    // === ARRAY WITH TOP-LEFT BUTTON ===
    notes: {
      type: "array",
      title: "Notes (Add button: top-left)",
      description: "Demonstrates top-left button positioning",
      items: {
        type: "string",
        title: "Note",
      },
      "x-quickforms-quasar": {
        addButtonPosition: "top-left",
        addButton: {
          label: "New Note",
          icon: "note_add",
        },
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

    // === PASSWORD FIELD WITH ICON ===
    password: {
      type: "string",
      format: "password",
      title: "Password",
      description: "Password field with show/hide toggle and prepend icon",
      minLength: 8,
      "x-quasar-props": {
        dense: false,
      },
      "x-quickforms-quasar": {
        prependIcon: "lock",
        iconColor: "grey-7",
      },
    },

    // === TEXT FIELD WITH ICONS ===
    username: {
      type: "string",
      title: "Username",
      description: "Input field with prepend icon",
      minLength: 3,
      "x-quickforms-quasar": {
        prependIcon: "person",
        iconColor: "primary",
      },
    },

    // === SEARCH FIELD WITH APPEND ICON ===
    search: {
      type: "string",
      title: "Search",
      description: "Input with append icon",
      "x-quickforms-quasar": {
        appendIcon: "search",
        iconColor: "grey-6",
        iconSize: "md",
      },
    },

    // === JSON EDITOR (AUTO-DETECTED) ===
    customConfig: {
      type: "object",
      title: "Custom Configuration",
      description:
        "Freeform JSON object (auto-detected via additionalProperties)",
      additionalProperties: {},
      "x-rows": 8,
    },

    // === JSON EDITOR (EXPLICIT WITH CUSTOMIZATION) ===
    metadata: {
      type: "object",
      title: "Metadata",
      description:
        "Explicit JSON editor via x-render extension with custom props",
      "x-render": "jsoneditor",
      "x-rows": 6,
      "x-quasar-props": {
        dense: false,
        color: "secondary",
      },
      "x-quickforms-quasar": {
        prependIcon: "settings",
        iconColor: "primary",
      },
    },

    // === KEY-VALUE EDITOR (RECORD TYPE) ===
    additionalParams: {
      type: "object",
      title: "Additional Parameters",
      description: "Dynamic key-value pairs (Record<string, string>)",
      additionalProperties: {
        type: "string",
      },
    },

    // === KEY-VALUE EDITOR (DEFAULT POSITION) ===
    oauthHeaders: {
      type: "object",
      title: "OAuth Headers (bottom-left)",
      description: "Default button position",
      additionalProperties: {
        type: "string",
      },
    },

    // === KEY-VALUE EDITOR (TOP-RIGHT) ===
    apiHeaders: {
      type: "object",
      title: "API Headers (top-right)",
      description: "Button on same line as label",
      additionalProperties: {
        type: "string",
      },
      "x-quickforms-quasar": {
        addButtonPosition: "top-right",
        addButton: {
          icon: "add_circle",
          label: "Add Header",
        },
      },
    },

    // === KEY-VALUE EDITOR (BOTTOM-CENTER) ===
    envVars: {
      type: "object",
      title: "Environment Variables (bottom-center)",
      description: "Full-width centered button",
      additionalProperties: {
        type: "string",
      },
      "x-quickforms-quasar": {
        addButtonPosition: "bottom-center",
        addButton: {
          icon: "add",
          label: "Add Environment Variable",
          color: "secondary",
          style: "height: 40px;",
        },
      },
    },

    // === KEY-VALUE EDITOR (BOTTOM-RIGHT) ===
    metadata2: {
      type: "object",
      title: "Custom Metadata (bottom-right)",
      description: "Right-aligned button",
      additionalProperties: {
        type: "string",
      },
      "x-quickforms-quasar": {
        addButtonPosition: "bottom-right",
        addButton: {
          icon: "add",
          label: "Add Field",
        },
      },
    },

    // === KEY-VALUE EDITOR (CUSTOM INPUT STYLING) ===
    styledParams: {
      type: "object",
      title: "Styled Parameters",
      description: "Custom QInput props applied to key/value inputs",
      additionalProperties: {
        type: "string",
      },
      "x-quasar-props": {
        filled: true,
        color: "purple",
        labelColor: "purple",
      },
    },

    // === KEY-VALUE EDITOR (CUSTOM BUTTON STYLING) ===
    customButtonParams: {
      type: "object",
      title: "Custom Button Styling",
      description: "Using class and style on buttons",
      additionalProperties: {
        type: "string",
      },
      "x-quickforms-quasar": {
        addButton: {
          label: "Add Custom",
          icon: "add_circle",
          unelevated: true,
          style: { borderRadius: "20px" },
          class: "text-weight-bold",
        },
        removeButton: {
          style: { opacity: 0.7 },
        },
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

    // === ONEOF WITH SHARED FIELD NAMES (Discriminated Union) ===
    // This tests that switching tabs properly re-renders fields with the same key
    // but different labels. Without proper key handling, Vue reuses components
    // and shows stale labels from the previous tab.
    connectionConfig: {
      type: "object",
      title: "Connection Configuration",
      description:
        "Switch between tabs - each has a 'connection' field with different labels",
      "x-oneof-style": "tabs",
      oneOf: [
        {
          title: "GCP",
          properties: {
            provider: { const: "gcp" },
            connection: {
              type: "string",
              title: "GCP Connection",
              description: "Reference to a GCP service account",
            },
            projectId: {
              type: "string",
              title: "GCP Project ID",
            },
          },
          required: ["connection"],
        },
        {
          title: "AWS",
          properties: {
            provider: { const: "aws" },
            connection: {
              type: "string",
              title: "AWS Connection",
              description: "Reference to AWS credentials",
            },
            region: {
              type: "string",
              title: "AWS Region",
              enum: ["us-east-1", "us-west-2", "eu-west-1"],
            },
          },
          required: ["connection"],
        },
        {
          title: "SFTP",
          properties: {
            provider: { const: "sftp" },
            connection: {
              type: "string",
              title: "SFTP Connection",
              description: "Reference to SFTP server credentials",
            },
            remotePath: {
              type: "string",
              title: "Remote Path",
              default: "/",
            },
          },
          required: ["connection"],
        },
      ],
    },

    // === ONEOF (CONDITIONAL) WITH TABS AND CUSTOM LABELS ===
    paymentMethod: {
      type: "object",
      title: "Payment Method",
      // Custom labels for tabs (overrides option titles)
      "x-oneof-labels": ["💳 Credit Card", "🏦 Bank Transfer", "📧 PayPal"],
      // Force tabs display (default for 2-4 options anyway)
      "x-oneof-style": "tabs",
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

    // === JSONLOGIC CONDITION BUILDER ===
    triggerCondition: {
      type: "object",
      title: "Trigger Condition",
      description:
        "Visual JSONLogic condition builder with AND/OR support. Use x-render: 'condition-builder' or 'jsonlogic-builder'",
      "x-render": "condition-builder",
    },

    // === JSONLOGIC CONDITION BUILDER (Complex Example) ===
    filterRules: {
      type: "object",
      title: "Filter Rules",
      description:
        "Complex filtering with multiple conditions. Try adding nested AND/OR groups!",
      "x-render": "jsonlogic-builder",
    },

    // === ONEOF WITH DESCRIPTIONS (Discriminated Union style) ===
    dateOperation: {
      title: "",
      description: "",
      "x-oneof-style": "dropdown",
      "x-oneof-select-label": "Operation",
      "x-oneof-labels": {
        now: "Get Current Time",
        format: "Format Date",
        add: "Add Time",
      },
      "x-oneof-descriptions": {
        now: "Returns the current date and time in the specified timezone",
        format:
          "Convert a date/time value to a formatted string (e.g., 'Jan 1, 2025')",
        add: "Add a duration to a date (e.g., +5 days, +2 hours)",
      },
      anyOf: [
        {
          type: "object",
          properties: {
            operation: { type: "string", const: "now" },
            timezone: { type: "string", title: "Timezone", default: "UTC" },
          },
          required: ["operation"],
        },
        {
          type: "object",
          properties: {
            operation: { type: "string", const: "format" },
            dateTime: { type: "string", title: "Date/Time Input" },
            outputFormat: {
              type: "string",
              title: "Output Format",
              default: "yyyy-MM-dd",
            },
          },
          required: ["operation"],
        },
        {
          type: "object",
          properties: {
            operation: { type: "string", const: "add" },
            dateTime: { type: "string", title: "Date/Time Input" },
            amount: { type: "number", title: "Amount" },
            unit: {
              type: "string",
              title: "Unit",
              enum: ["days", "hours", "minutes"],
            },
          },
          required: ["operation"],
        },
      ],
    },

    // === ONEOF WITH DROPDOWN (Many options) ===
    shippingMethod: {
      type: "object",
      title: "Shipping Method",
      // Force dropdown mode (useful for many options)
      "x-oneof-style": "dropdown",
      "x-oneof-select-label": "Choose shipping option",
      "x-oneof-labels": [
        "Standard (5-7 days)",
        "Express (2-3 days)",
        "Overnight",
        "Store Pickup",
        "International",
      ],
      oneOf: [
        {
          title: "Standard",
          properties: {
            method: { const: "standard" },
            address: { type: "string", title: "Shipping Address" },
          },
        },
        {
          title: "Express",
          properties: {
            method: { const: "express" },
            address: { type: "string", title: "Shipping Address" },
            signature: { type: "boolean", title: "Require Signature" },
          },
        },
        {
          title: "Overnight",
          properties: {
            method: { const: "overnight" },
            address: { type: "string", title: "Shipping Address" },
            deliveryTime: {
              type: "string",
              title: "Preferred Delivery Time",
              enum: ["Morning", "Afternoon", "Evening"],
            },
          },
        },
        {
          title: "Store Pickup",
          properties: {
            method: { const: "pickup" },
            storeId: {
              type: "string",
              title: "Store Location",
              enum: ["store-1", "store-2", "store-3"],
            },
          },
        },
        {
          title: "International",
          properties: {
            method: { const: "international" },
            address: { type: "string", title: "International Address" },
            customsInfo: {
              type: "string",
              title: "Customs Declaration",
              format: "textarea",
            },
          },
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
  <Showcase v-if="showShowcase" @back="showShowcase = false" />
  <q-layout v-else view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title> QuickForms Quasar Demo </q-toolbar-title>
        <q-btn
          flat
          label="View Showcase"
          @click="showShowcase = true"
          icon="visibility"
        />
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
                    <strong>Features shown:</strong>
                    <strong>Layout:</strong> fieldGap spacing (lg = 24px) |
                    <strong>Objects:</strong> optional fields collapse with
                    "(optional)" indicator | <strong>OneOf:</strong> tabs with
                    custom labels (x-oneof-labels), dropdown mode |
                    <strong>Icons:</strong> prepend/append |
                    <strong>Arrays:</strong> button positioning, custom labels |
                    <strong>JSONLogic:</strong> visual condition builder with
                    AND/OR groups | <strong>And more:</strong> date/time
                    pickers, password toggle, autocomplete, nested objects
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
