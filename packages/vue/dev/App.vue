<script setup lang="ts">
import { ref, shallowRef, computed } from "vue";
import DynamicForm from "../src/components/DynamicForm.vue";
import CustomRegistryExample from "./CustomRegistryExample.vue";
import ThemeExample from "./ThemeExample.vue";
import WorkflowsTheme from "./WorkflowsTheme.vue";
import Showcase from "./Showcase.vue";
import type { JSONSchema } from "@quickflo/quickforms";

const currentView = ref("showcase");

// Simple schema for basic testing
const simpleSchema: JSONSchema = {
  type: "object",
  properties: {
    firstName: {
      type: "string",
      title: "First Name",
      minLength: 2,
    },
    lastName: {
      type: "string",
      title: "Last Name",
      minLength: 2,
    },
    email: {
      type: "string",
      format: "email",
      title: "Email",
    },
    age: {
      type: "number",
      title: "Age",
      minimum: 18,
    },
  },
  required: ["firstName", "lastName", "email"],
};

// Conditional schema for testing oneOf switching
const conditionalSchema: JSONSchema = {
  type: "object",
  properties: {
    accountType: {
      type: "object",
      title: "Account Type",
      oneOf: [
        {
          title: "Individual",
          properties: {
            type: { const: "individual" },
            firstName: { type: "string", title: "First Name" },
            lastName: { type: "string", title: "Last Name" },
            ssn: {
              type: "string",
              title: "SSN",
              pattern: "^\\d{3}-\\d{2}-\\d{4}$",
            },
          },
          required: ["firstName", "lastName", "ssn"],
        },
        {
          title: "Business",
          properties: {
            type: { const: "business" },
            companyName: { type: "string", title: "Company Name" },
            ein: { type: "string", title: "EIN", pattern: "^\\d{2}-\\d{7}$" },
            numberOfEmployees: { type: "number", title: "Number of Employees" },
          },
          required: ["companyName", "ein"],
        },
      ],
    },
    contactEmail: {
      type: "string",
      format: "email",
      title: "Contact Email",
    },
  },
  required: ["accountType", "contactEmail"],
};

// Full test schema with all field types
const fullTestSchema: JSONSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Full Name",
      description: "Enter your full name",
      minLength: 2,
    },
    email: {
      type: "string",
      format: "email",
      title: "Email Address",
      description: "Your email address for contact",
    },
    password: {
      type: "string",
      format: "password",
      title: "Password",
      description: "Choose a secure password (min 8 characters)",
      minLength: 8,
      "x-error-messages": {
        required: "Password is required for security",
        minLength: "Password must be at least 8 characters for your security",
      },
    },
    confirmPassword: {
      type: "string",
      format: "password",
      title: "Confirm Password",
      description: "Re-enter your password (validated with custom validator)",
    },
    website: {
      type: "string",
      format: "url",
      title: "Website",
      description: "Your personal or company website",
    },
    age: {
      type: "number",
      title: "Age",
      description: "Must be 18 or older",
      minimum: 18,
      maximum: 120,
      "x-error-messages": {
        required: "We need to know your age",
        minimum: "You must be at least 18 years old to use this service",
        maximum: "Please enter a valid age",
      },
    },
    score: {
      type: "integer",
      title: "Score",
      description: "Integer value between 0 and 100",
      minimum: 0,
      maximum: 100,
    },
    bio: {
      type: "string",
      format: "textarea",
      title: "Bio",
      description: "Tell us about yourself (this becomes a textarea)",
      maxLength: 500,
    },
    role: {
      type: "string",
      enum: ["user", "admin", "moderator", "guest"],
      title: "Role",
      description: "Select your role",
      default: "user",
    },
    subscribe: {
      type: "boolean",
      title: "Subscribe to newsletter",
      description: "Receive updates and news",
      default: true,
    },
    acceptTerms: {
      type: "boolean",
      title: "Accept terms and conditions",
    },
    birthdate: {
      type: "string",
      format: "date",
      title: "Birth Date",
      description: "When were you born?",
    },
    meetingTime: {
      type: "string",
      format: "time",
      title: "Preferred Meeting Time",
    },
    address: {
      type: "object",
      title: "Address",
      description: "Where do you live?",
      properties: {
        street: {
          type: "string",
          title: "Street Address",
          minLength: 5,
        },
        city: {
          type: "string",
          title: "City",
        },
        zip: {
          type: "string",
          title: "Zip Code",
          pattern: "^\\d{5}$",
          "x-error-messages": {
            pattern: "Zip code must be exactly 5 digits (e.g., 94102)",
          },
        },
        state: {
          type: "string",
          enum: ["CA", "NY", "TX", "FL", "WA", "OR"],
          title: "State",
        },
      },
      required: ["street", "city", "zip", "state"],
    },
    hobbies: {
      type: "array",
      title: "Hobbies",
      description: "List your hobbies (min 2)",
      "x-item-label": "none",
      items: {
        type: "string",
        title: "Hobby",
      },
      minItems: 2,
    },
    workHistory: {
      type: "array",
      title: "Work History",
      description: "Add your previous jobs",
      "x-item-label": "{{company}} - {{position}}",
      items: {
        type: "object",
        title: "Job Entry",
        properties: {
          company: { type: "string", title: "Company" },
          position: { type: "string", title: "Position" },
          years: { type: "number", title: "Years", minimum: 0 },
        },
        required: ["company", "position"],
      },
    },
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
              pattern: "^\\d{16}$",
            },
            expiry: {
              type: "string",
              title: "Expiry Date",
              placeholder: "MM/YY",
            },
            cvv: { type: "string", title: "CVV", pattern: "^\\d{3}$" },
          },
          required: ["cardNumber", "expiry", "cvv"],
        },
        {
          title: "PayPal",
          properties: {
            type: { const: "paypal" },
            email: { type: "string", format: "email", title: "PayPal Email" },
          },
          required: ["email"],
        },
        {
          title: "Bank Transfer",
          properties: {
            type: { const: "bank_transfer" },
            accountNumber: { type: "string", title: "Account Number" },
            routingNumber: { type: "string", title: "Routing Number" },
          },
          required: ["accountNumber", "routingNumber"],
        },
      ],
    },
    systemId: {
      type: "string",
      title: "System ID",
      description: "Hidden system field",
      "x-hidden": true,
      default: "SYS-12345",
    },
    adminOnlyField: {
      type: "string",
      title: "Admin Only Field",
      description: "Only visible to admins",
      "x-roles": {
        admin: ["view", "edit"],
        user: [],
        guest: [],
      },
    },
    readOnlyForUsers: {
      type: "string",
      title: "Read-Only for Users",
      description: "Admins can edit, users can view, guests cannot see",
      default: "Editable by admin only",
      "x-roles": {
        admin: ["view", "edit"],
        user: ["view"],
        guest: [],
      },
    },
    appointmentDateTime: {
      type: "string",
      format: "date-time",
      title: "Appointment Date & Time",
    },
  },
  required: ["name", "email", "password", "age", "role", "acceptTerms"],
};

const formData = ref({});
const validationState = ref<{
  valid: boolean;
  errors: Record<string, string | undefined>;
}>({ valid: true, errors: {} });

// Schema switcher for reactivity testing
const currentSchema = ref<"simple" | "conditional" | "full">("full");

const activeSchema = computed(() => {
  switch (currentSchema.value) {
    case "simple":
      return simpleSchema;
    case "conditional":
      return conditionalSchema;
    case "full":
      return fullTestSchema;
  }
});

// Mock API for async validation
const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800));
  const takenUsernames = ["admin", "test", "user", "demo"];
  return !takenUsernames.includes(username.toLowerCase());
};

// Validation mode for testing
const validationMode = ref<
  "ValidateAndShow" | "ValidateAndHide" | "NoValidation"
>("ValidateAndShow");

// Role switcher for testing x-roles
const currentRole = ref<"admin" | "user" | "guest">("user");

const formOptions = computed(() => ({
  context: {
    roles: [currentRole.value],
  },
  validationMode: validationMode.value,
  errorMessages: {
    name: {
      required: "Hey! We really need your name here.",
      minLength: "Come on, your name is longer than that!",
    },
    email: {
      required: "Email is mandatory, friend.",
      format: "That doesn't look like a real email address.",
    },
  },
  validators: {
    // Sync validator - password confirmation
    password: (value, allValues) => {
      if (allValues.confirmPassword && value !== allValues.confirmPassword) {
        return "Passwords must match";
      }
      return true;
    },
    confirmPassword: (value, allValues) => {
      if (value !== allValues.password) {
        return "Passwords must match";
      }
      return true;
    },
    // Async validator - username availability (only for simple schema)
    ...(currentSchema.value === "simple"
      ? {
          firstName: async (value) => {
            if (!value || value.length < 3) return true; // Let JSON Schema handle this
            const available = await checkUsernameAvailable(value);
            return (
              available ||
              "This username is already taken (try something other than: admin, test, user, demo)"
            );
          },
        }
      : {}),
  },
  // Debounce async validators
  validatorDebounce: {
    firstName: 500, // Wait 500ms after user stops typing
  },
}));

const handleValidation = (result: {
  valid: boolean;
  errors: Record<string, string | undefined>;
}) => {
  validationState.value = result;
  console.log("Validation state:", result);
};

const handleSubmit = (data: any) => {
  console.log("✅ Form submitted successfully!", data);
  alert("Form submitted! Check console for data.");
};
</script>

<template>
  <Showcase v-if="currentView === 'showcase'" @back="currentView = 'default'" />
  <div v-else-if="currentView !== 'default'">
    <div
      style="
        padding: 1rem;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        gap: 1rem;
        justify-content: center;
      "
    >
      <button
        @click="currentView = 'default'"
        style="
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
        "
      >
        Back to Main Test
      </button>
      <button
        @click="currentView = 'custom'"
        :style="{
          opacity: currentView === 'custom' ? 1 : 0.5,
          cursor: 'pointer',
          padding: '0.5rem 1rem',
          border: '1px solid #d1d5db',
          background: 'white',
          borderRadius: '0.25rem',
        }"
      >
        Custom Registry
      </button>
      <button
        @click="currentView = 'theme'"
        :style="{
          opacity: currentView === 'theme' ? 1 : 0.5,
          cursor: 'pointer',
          padding: '0.5rem 1rem',
          border: '1px solid #d1d5db',
          background: 'white',
          borderRadius: '0.25rem',
        }"
      >
        Theme Example
      </button>
      <button
        @click="currentView = 'workflows'"
        :style="{
          opacity: currentView === 'workflows' ? 1 : 0.5,
          cursor: 'pointer',
          padding: '0.5rem 1rem',
          border: '1px solid #d1d5db',
          background: 'white',
          borderRadius: '0.25rem',
        }"
      >
        Workflows Theme
      </button>
    </div>
    <CustomRegistryExample v-if="currentView === 'custom'" />
    <ThemeExample v-if="currentView === 'theme'" />
    <WorkflowsTheme v-if="currentView === 'workflows'" />
  </div>

  <div v-else style="max-width: 1400px; margin: 0 auto; padding: 2rem">
    <div
      style="
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <div>
        <h1 style="margin-bottom: 0.5rem">
          🚀 QuickForms Vue - Development Test
        </h1>
        <p style="color: #6b7280">Testing all field types with validation</p>
      </div>
      <div style="display: flex; gap: 1rem">
        <button
          @click="currentView = 'custom'"
          style="
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            cursor: pointer;
          "
        >
          View Custom Registry Demo
        </button>
        <button
          @click="currentView = 'theme'"
          style="
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            cursor: pointer;
          "
        >
          View Theme Demo
        </button>
        <button
          @click="currentView = 'workflows'"
          style="
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            cursor: pointer;
          "
        >
          View Workflows Theme
        </button>
        <button
          @click="currentView = 'showcase'"
          style="
            padding: 0.5rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
            font-weight: 600;
          "
        >
          🎨 View Showcase
        </button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem">
      <!-- Form Panel -->
      <div
        style="
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        "
      >
        <h2
          style="
            margin: 0 0 1.5rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #3b82f6;
          "
        >
          Form
        </h2>

        <div
          style="
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #f3f4f6;
            border-radius: 0.375rem;
          "
        >
          <label style="font-weight: 500; display: block; margin-bottom: 0.5rem"
            >Active Schema (Test Reactivity)</label
          >
          <select
            v-model="currentSchema"
            style="
              padding: 0.5rem;
              border: 1px solid #d1d5db;
              border-radius: 0.25rem;
              width: 100%;
              margin-bottom: 1rem;
            "
          >
            <option value="simple">Simple (4 fields)</option>
            <option value="conditional">Conditional (oneOf testing)</option>
            <option value="full">Full (All features)</option>
          </select>

          <label style="font-weight: 500; display: block; margin-bottom: 0.5rem"
            >Validation Mode</label
          >
          <select
            v-model="validationMode"
            style="
              padding: 0.5rem;
              border: 1px solid #d1d5db;
              border-radius: 0.25rem;
              width: 100%;
              margin-bottom: 1rem;
            "
          >
            <option value="ValidateAndShow">ValidateAndShow (default)</option>
            <option value="ValidateAndHide">ValidateAndHide (silent)</option>
            <option value="NoValidation">NoValidation (off)</option>
          </select>

          <label style="font-weight: 500; display: block; margin-bottom: 0.5rem"
            >Current Role (Test Access Control)</label
          >
          <select
            v-model="currentRole"
            style="
              padding: 0.5rem;
              border: 1px solid #d1d5db;
              border-radius: 0.25rem;
              width: 100%;
            "
          >
            <option value="admin">Admin (See all, Edit all)</option>
            <option value="user">User (Limited view, Limited edit)</option>
            <option value="guest">Guest (No access)</option>
          </select>
        </div>

        <DynamicForm
          :schema="activeSchema"
          v-model="formData"
          :options="{ ...formOptions, useDefaults: true }"
          @submit="handleSubmit"
          @validation="handleValidation"
        >
          <template #actions="{ isValid }">
            <div style="display: flex; gap: 0.5rem">
              <button
                type="submit"
                :disabled="!isValid"
                style="
                  padding: 0.75rem 1.5rem;
                  background: #3b82f6;
                  color: white;
                  border: none;
                  border-radius: 0.375rem;
                  font-weight: 500;
                  cursor: pointer;
                "
                :style="{
                  opacity: isValid ? 1 : 0.5,
                  cursor: isValid ? 'pointer' : 'not-allowed',
                }"
              >
                Submit Form
              </button>
              <button
                type="button"
                @click="formData = {}"
                style="
                  padding: 0.75rem 1.5rem;
                  background: #6b7280;
                  color: white;
                  border: none;
                  border-radius: 0.375rem;
                  font-weight: 500;
                  cursor: pointer;
                "
              >
                Reset
              </button>
            </div>
          </template>
        </DynamicForm>
      </div>

      <!-- Data Panel -->
      <div>
        <div
          v-if="
            Object.keys(validationState.errors).length > 0 &&
            validationMode === 'ValidateAndShow'
          "
          style="
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            border-left: 4px solid #ef4444;
          "
        >
          <h2
            style="
              margin: 0 0 1rem 0;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #ef4444;
              color: #ef4444;
            "
          >
            ⚠️ Validation Errors
          </h2>
          <ul style="margin: 0; padding-left: 1.5rem; line-height: 1.8">
            <li
              v-for="(error, field) in validationState.errors"
              :key="field"
              style="color: #dc2626"
            >
              <strong>{{ field }}:</strong> {{ error }}
            </li>
          </ul>
        </div>

        <div
          style="
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
          "
        >
          <h2
            style="
              margin: 0 0 1rem 0;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #10b981;
            "
          >
            Current Form Data
          </h2>
          <pre
            style="
              background: #1f2937;
              color: #f3f4f6;
              padding: 1rem;
              border-radius: 0.375rem;
              overflow-x: auto;
              font-size: 0.875rem;
              margin: 0;
            "
            >{{ JSON.stringify(formData, null, 2) }}</pre
          >
        </div>

        <div
          style="
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          "
        >
          <h2
            style="
              margin: 0 0 1rem 0;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #f59e0b;
            "
          >
            Field Types Tested
          </h2>
          <ul style="margin: 0; padding-left: 1.5rem; line-height: 1.8">
            <li>✅ String (text input)</li>
            <li>✅ String - email format</li>
            <li>✅ String - password format (with toggle)</li>
            <li>✅ String - url format</li>
            <li>✅ String - textarea format</li>
            <li>✅ Number (with min/max)</li>
            <li>✅ Integer (whole numbers)</li>
            <li>✅ Boolean (checkbox)</li>
            <li>✅ Enum (select dropdown)</li>
            <li>✅ Date</li>
            <li>✅ Time</li>
            <li>✅ Date-time</li>
            <li>✅ Required fields</li>
            <li>✅ Field validation (minLength, maxLength, pattern, etc.)</li>
            <li>✅ Custom error messages (x-error-messages)</li>
            <li>
              ✅ Validation modes (ValidateAndShow, ValidateAndHide,
              NoValidation)
            </li>
            <li>✅ Validation events</li>
            <li>✅ Custom validators (sync & async)</li>
            <li>✅ Validator debouncing</li>
            <li>✅ Cross-field validation (e.g., password confirmation)</li>
            <li>✅ Help text (descriptions)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
