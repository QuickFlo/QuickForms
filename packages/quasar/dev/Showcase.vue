<script setup lang="ts">
import { ref } from "vue";
import { DynamicForm, JSONSchema } from "@quickflo/quickforms-vue";
import { createQuasarRegistry, QuasarFormOptions } from "../src/index";

const emit = defineEmits(["back"]);

const registry = createQuasarRegistry();

const formOptions: QuasarFormOptions = {
  registry,
  componentDefaults: {
    global: {
      outlined: true,
      dense: false,
    },
    input: {
      clearable: true,
    },
  },
};

const formData = ref({});

const schema: JSONSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Full Name",
      minLength: 2,
      "x-quickforms-quasar": {
        prependIcon: "person",
        iconColor: "primary",
      },
    },
    email: {
      type: "string",
      format: "email",
      title: "Email Address",
      "x-quickforms-quasar": {
        prependIcon: "mail",
        iconColor: "primary",
      },
    },
    age: {
      type: "number",
      title: "Age",
      minimum: 18,
      maximum: 120,
      "x-quasar-props": {
        suffix: "years",
      },
    },
    bio: {
      type: "string",
      format: "textarea",
      title: "About You",
      maxLength: 200,
      "x-quasar-props": {
        rows: 3,
        counter: true,
      },
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
      "x-quickforms-quasar": {
        addButtonPosition: "top-right",
        addButton: {
          label: "Add Skill",
          icon: "add_circle",
          color: "primary",
        },
      },
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
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page
        class="row justify-center items-center"
        style="
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        "
      >
        <div style="width: 100%; max-width: 1100px">
          <!-- Back Button -->
          <div class="q-mb-md">
            <q-btn
              flat
              color="white"
              icon="arrow_back"
              label="Back to Dev Mode"
              @click="emit('back')"
              style="
                border: 2px solid white;
                backdrop-filter: blur(10px);
                background: rgba(255, 255, 255, 0.2);
              "
            />
          </div>

          <!-- Header -->
          <div class="text-center q-mb-xl">
            <div
              class="text-h2 text-white text-weight-bold"
              style="text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2)"
            >
              QuickForms × Quasar
            </div>
            <div
              class="text-h6 text-white"
              style="opacity: 0.9; margin-top: 0.5rem"
            >
              Beautiful forms from JSON Schema
            </div>
          </div>

          <div class="row q-col-gutter-lg">
            <!-- Form Panel -->
            <div class="col-8">
              <q-card style="border-radius: 16px">
                <q-card-section>
                  <DynamicForm
                    v-model="formData"
                    :schema="schema"
                    :options="formOptions"
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- Info Panel -->
            <div class="col-4">
              <q-card style="border-radius: 16px; margin-bottom: 1.5rem">
                <q-card-section>
                  <div class="text-h6 q-mb-md">📋 JSON Schema</div>
                  <pre
                    class="text-caption"
                    style="
                      margin: 0;
                      max-height: 400px;
                      overflow-y: auto;
                      line-height: 1.4;
                      background: #f5f5f5;
                      padding: 1rem;
                      border-radius: 8px;
                    "
                    >{{ JSON.stringify(schema, null, 2) }}</pre
                  >
                </q-card-section>
              </q-card>

              <q-card dark style="border-radius: 16px; background: #1f2937">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">📊 Form Data</div>
                  <pre
                    class="text-caption"
                    style="
                      margin: 0;
                      max-height: 300px;
                      overflow-y: auto;
                      line-height: 1.4;
                    "
                    >{{ JSON.stringify(formData, null, 2) }}</pre
                  >
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
