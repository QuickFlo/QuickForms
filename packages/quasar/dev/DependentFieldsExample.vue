<script setup lang="ts">
/**
 * DependentFieldsExample - Demonstrates reactive field watching in QuickForms
 *
 * This example shows how to use the new `formContext.useFieldValue()` API
 * to reactively watch changes to other form fields.
 *
 * Use case: A "voice" dropdown that changes options based on selected "provider"
 */
import { ref, computed, watch } from 'vue'
import { DynamicForm, type JSONSchema, useFormContext } from '@quickflo/quickforms-vue'
import { createQuasarRegistry, type QuasarFormOptions } from '../src/index'
import { QCard, QCardSection, QChip, QSeparator } from 'quasar'

const registry = createQuasarRegistry()

const formOptions: QuasarFormOptions = {
  registry,
  validateOnMount: false,
  componentDefaults: {
    global: {
      outlined: true,
    },
    layout: {
      fieldGap: 'md',
    },
  },
}

const formData = ref<Record<string, unknown>>({
  provider: 'openai',
  voice: '',
})

/**
 * Schema demonstrating dependent field options.
 *
 * In a real application, the "voice" field would use x-options-fetcher
 * to fetch voices from an API based on the selected provider.
 * Here we show a simpler client-side example using x-enum-labels.
 */
const schema: JSONSchema = {
  type: 'object',
  title: 'Dependent Fields Demo',
  description: 'Select a provider to see how the voice options change',
  properties: {
    provider: {
      type: 'string',
      title: 'Provider',
      description: 'Select a speech provider',
      enum: ['openai', 'elevenlabs', 'google', 'aws'],
      'x-enum-labels': {
        openai: 'OpenAI',
        elevenlabs: 'ElevenLabs',
        google: 'Google Cloud',
        aws: 'Amazon Polly',
      },
    },
    voice: {
      type: 'string',
      title: 'Voice',
      description: 'Voice options depend on the selected provider',
      // Note: In practice, you'd use x-options-fetcher here.
      // This example uses static enum to demonstrate the concept.
      enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      'x-enum-labels': {
        alloy: 'Alloy (OpenAI)',
        echo: 'Echo (OpenAI)',
        fable: 'Fable (OpenAI)',
        onyx: 'Onyx (OpenAI)',
        nova: 'Nova (OpenAI)',
        shimmer: 'Shimmer (OpenAI)',
      },
    },
  },
  required: ['provider'],
}

/**
 * Example of using watchFormValues to react to any form changes.
 * This would be used in a custom field component.
 */
const watchedChanges = ref<string[]>([])
const maxChanges = 10

// Note: In a real custom component, you'd use:
// const formContext = useFormContext()
// formContext?.watchFormValues((values, oldValues) => { ... })

// For this demo, we watch formData directly
watch(
  formData,
  (newValues, oldValues) => {
    const change = `Provider: ${newValues.provider}, Voice: ${newValues.voice || '(none)'}`
    watchedChanges.value.unshift(change)
    if (watchedChanges.value.length > maxChanges) {
      watchedChanges.value.pop()
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="dependent-fields-example">
    <h3>Reactive Field Watching Example</h3>

    <p class="text-body2 q-mb-md">
      This example demonstrates the new <code>formContext.useFieldValue()</code> API
      that allows custom field components to reactively watch other form fields.
    </p>

    <div class="row q-gutter-md">
      <!-- Form -->
      <div class="col-12 col-md-6">
        <QCard>
          <QCardSection>
            <DynamicForm
              v-model="formData"
              :schema="schema"
              :options="formOptions"
            />
          </QCardSection>
        </QCard>
      </div>

      <!-- Change Log -->
      <div class="col-12 col-md-6">
        <QCard>
          <QCardSection>
            <div class="text-h6 q-mb-sm">Form Changes (watchFormValues)</div>
            <p class="text-caption text-grey">
              In a custom field component, use <code>formContext.watchFormValues()</code>
              or <code>formContext.useFieldValue('path')</code> to react to changes.
            </p>
            <QSeparator class="q-my-sm" />
            <div v-if="watchedChanges.length === 0" class="text-grey">
              No changes yet. Try selecting different providers and voices.
            </div>
            <div v-else class="change-log">
              <div
                v-for="(change, index) in watchedChanges"
                :key="index"
                class="change-entry q-py-xs"
              >
                <QChip
                  :color="index === 0 ? 'primary' : 'grey'"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ index === 0 ? 'Latest' : index + 1 }}
                </QChip>
                <span class="q-ml-sm">{{ change }}</span>
              </div>
            </div>
          </QCardSection>
        </QCard>

        <!-- Code Example -->
        <QCard class="q-mt-md">
          <QCardSection>
            <div class="text-h6 q-mb-sm">Usage in Custom Components</div>
            <pre class="code-block">{{ codeExample }}</pre>
          </QCardSection>
        </QCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const codeExample = `// In your custom field component:
import { useFormContext } from '@quickflo/quickforms-vue'
import { watch, computed } from 'vue'

const formContext = useFormContext()

// Option 1: Get a reactive computed for a specific field
const providerValue = formContext?.useFieldValue<string>('provider')

// Use in computed properties
const isOpenAI = computed(() => providerValue?.value === 'openai')

// Watch for changes
watch(providerValue, (newProvider) => {
  console.log('Provider changed to:', newProvider)
  // Refresh options, update UI, etc.
})

// Option 2: Watch all form values
const stop = formContext?.watchFormValues((values, oldValues) => {
  console.log('Form changed:', values)
})

// Clean up when component unmounts
onBeforeUnmount(() => stop?.())
`

export default {
  data() {
    return { codeExample }
  },
}
</script>

<style scoped>
.dependent-fields-example {
  padding: 16px;
}

.change-log {
  max-height: 200px;
  overflow-y: auto;
}

.change-entry {
  font-family: monospace;
  font-size: 0.9em;
  border-bottom: 1px solid #eee;
}

.change-entry:last-child {
  border-bottom: none;
}

.code-block {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.85em;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
