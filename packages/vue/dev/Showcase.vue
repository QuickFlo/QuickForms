<script setup lang="ts">
import { ref } from "vue";
import DynamicForm from "../src/components/DynamicForm.vue";
import type { JSONSchema } from "@quickflo/quickforms";

const emit = defineEmits(["back"]);

const formData = ref({});

// Single comprehensive schema
const schema: JSONSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Full Name",
      minLength: 2,
    },
    email: {
      type: "string",
      format: "email",
      title: "Email Address",
    },
    age: {
      type: "number",
      title: "Age",
      minimum: 18,
      maximum: 120,
    },
    bio: {
      type: "string",
      format: "textarea",
      title: "About You",
      maxLength: 200,
    },
    role: {
      type: "string",
      enum: ["developer", "designer", "manager", "other"],
      title: "Role",
      "x-enum-labels": {
        developer: "💻 Developer",
        designer: "🎨 Designer",
        manager: "📊 Manager",
        other: "👤 Other",
      },
    },
    skills: {
      type: "array",
      title: "Skills",
      items: {
        type: "string",
      },
      minItems: 1,
      maxItems: 5,
    },
    subscribe: {
      type: "boolean",
      title: "Subscribe to newsletter",
      default: true,
    },
  },
  required: ["name", "email", "age", "role"],
};
</script>

<template>
  <div
    style="
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 3rem 1rem;
    "
  >
    <div style="max-width: 1200px; margin: 0 auto">
      <!-- Back Button -->
      <div style="margin-bottom: 2rem">
        <button
          @click="emit('back')"
          style="
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid white;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            backdrop-filter: blur(10px);
          "
        >
          ← Back to Development Test
        </button>
      </div>

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 3rem">
        <h1
          style="
            color: white;
            font-size: 3rem;
            margin: 0 0 1rem 0;
            font-weight: 700;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          "
        >
          QuickForms X Vue
        </h1>
        <p
          style="color: rgba(255, 255, 255, 0.9); font-size: 1.25rem; margin: 0"
        >
          Beautiful, powerful forms from JSON Schema
        </p>
      </div>

      <!-- Main Content -->
      <div
        style="
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        "
      >
        <!-- Form Panel -->
        <div
          style="
            background: white;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          "
        >
          <DynamicForm
            :schema="schema"
            v-model="formData"
            :options="{ useDefaults: true }"
          />
        </div>

        <!-- Info Panel -->
        <div>
          <div
            style="
              background: white;
              padding: 1.5rem;
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
              margin-bottom: 1.5rem;
            "
          >
            <h3
              style="
                margin: 0 0 1rem 0;
                color: #1f2937;
                font-size: 1.25rem;
                font-weight: 600;
              "
            >
              📋 JSON Schema
            </h3>
            <pre
              style="
                margin: 0;
                color: #374151;
                font-size: 0.75rem;
                line-height: 1.4;
                max-height: 400px;
                overflow-y: auto;
                background: #f5f5f5;
                padding: 1rem;
                border-radius: 8px;
                white-space: pre-wrap;
                word-wrap: break-word;
              "
              >{{ JSON.stringify(schema, null, 2) }}</pre
            >
          </div>

          <div
            style="
              background: #1f2937;
              padding: 1.5rem;
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            "
          >
            <h3
              style="
                margin: 0 0 1rem 0;
                color: white;
                font-size: 1rem;
                font-weight: 600;
              "
            >
              📊 Form Data
            </h3>
            <pre
              style="
                margin: 0;
                color: #f3f4f6;
                font-size: 0.75rem;
                line-height: 1.4;
                max-height: 300px;
                overflow-y: auto;
              "
              >{{ JSON.stringify(formData, null, 2) }}</pre
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
