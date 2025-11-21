<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import DynamicForm from '../src/components/DynamicForm.vue';
import CustomRegistryExample from './CustomRegistryExample.vue';
import ThemeExample from './ThemeExample.vue';
import type { JSONSchema } from '@quickforms/core';

const currentView = ref('default');

// Test schema with all field types
const testSchema: JSONSchema = {
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
      type: 'string',
      enum: ['user', 'admin', 'moderator', 'guest'],
      title: 'Role',
      description: 'Select your role',
      default: 'user'
    },
    subscribe: {
      type: 'boolean',
      title: 'Subscribe to newsletter',
      description: 'Receive updates and news',
      default: true
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
    appointmentDateTime: {
      type: "string",
      format: "date-time",
      title: "Appointment Date & Time",
    },
  },
  required: ["name", "email", "password", "age", "role", "acceptTerms"],
};

const formData = ref({});

const handleSubmit = (data: any) => {
  console.log("✅ Form submitted successfully!", data);
  alert("Form submitted! Check console for data.");
};
</script>

<template>
  <div v-if="currentView !== 'default'">
    <div style="padding: 1rem; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; gap: 1rem; justify-content: center;">
      <button @click="currentView = 'default'" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Back to Main Test</button>
      <button @click="currentView = 'custom'" :style="{ opacity: currentView === 'custom' ? 1 : 0.5, cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '0.25rem' }">Custom Registry</button>
      <button @click="currentView = 'theme'" :style="{ opacity: currentView === 'theme' ? 1 : 0.5, cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '0.25rem' }">Theme Example</button>
    </div>
    <CustomRegistryExample v-if="currentView === 'custom'" />
    <ThemeExample v-if="currentView === 'theme'" />
  </div>

  <div v-else style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin-bottom: 0.5rem;">🚀 QuickForms Vue - Development Test</h1>
        <p style="color: #6b7280;">Testing all field types with validation</p>
      </div>
      <div style="display: flex; gap: 1rem;">
        <button @click="currentView = 'custom'" style="padding: 0.5rem 1rem; background: white; border: 1px solid #d1d5db; border-radius: 0.25rem; cursor: pointer;">View Custom Registry Demo</button>
        <button @click="currentView = 'theme'" style="padding: 0.5rem 1rem; background: white; border: 1px solid #d1d5db; border-radius: 0.25rem; cursor: pointer;">View Theme Demo</button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
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

        <DynamicForm
          :schema="testSchema"
          v-model="formData"
          :options="{ useDefaults: true }"
          @submit="handleSubmit"
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
            <li>✅ Field validation</li>
            <li>✅ Error messages</li>
            <li>✅ Help text (descriptions)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
