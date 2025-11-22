<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { QInput, QBtn, QIcon } from 'quasar';
import { useFormField, generateFieldId, useFormContext } from '@quickflo/quickforms-vue';
import type { FieldProps } from '@quickflo/quickforms-vue';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, setValue, label, hint, errorMessage, required } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const formContext = useFormContext();
const fieldId = generateFieldId(props.path);

// Merge QuickForms convenience features for button customization
const quickformsFeatures = computed(() => {
  const globalDefaults = (formContext as any)?.quickformsDefaults?.keyvalue || {};
  const schemaFeatures = (props.schema as any)["x-quickforms-quasar"] || {};

  // Merge QBtn props: defaults -> global -> schema (schema has highest priority)
  const addButtonDefaults = {
    outline: true,
    color: "primary",
    icon: "add",
    label: formContext?.labels?.addItem || "Add Parameter",
    size: "sm",
  };

  const removeButtonDefaults = {
    flat: true,
    round: true,
    dense: true,
    size: "sm",
    icon: "close",
    color: "negative",
  };

  const addButton = {
    ...addButtonDefaults,
    ...(globalDefaults.addButton || {}),
    ...(schemaFeatures.addButton || {}),
  };

  const removeButton = {
    ...removeButtonDefaults,
    ...(globalDefaults.removeButton || {}),
    ...(schemaFeatures.removeButton || {}),
  };

  return {
    addButton,
    removeButton,
  };
});

// Convert object to array of key-value pairs for editing
interface KeyValuePair {
  key: string;
  value: string;
  id: number;
}

let nextId = 0;
const pairs = ref<KeyValuePair[]>([]);
const isInternalUpdate = ref(false);

// Initialize from value
watch(
  () => value.value,
  (newValue) => {
    if (isInternalUpdate.value) {
      isInternalUpdate.value = false;
      return;
    }
    
    if (newValue && typeof newValue === 'object' && !Array.isArray(newValue)) {
      pairs.value = Object.entries(newValue).map(([key, val]) => ({
        key,
        value: String(val),
        id: nextId++
      }));
    } else if (!pairs.value.length) {
      pairs.value = [];
    }
  },
  { immediate: true }
);

// Update value when pairs change
watch(
  pairs,
  (newPairs) => {
    const obj: Record<string, string> = {};
    newPairs.forEach(pair => {
      if (pair.key.trim()) {
        obj[pair.key] = pair.value;
      }
    });
    isInternalUpdate.value = true;
    setValue(obj);
  },
  { deep: true }
);

function addPair() {
  pairs.value.push({ key: '', value: '', id: nextId++ });
}

function removePair(id: number) {
  pairs.value = pairs.value.filter(p => p.id !== id);
}
</script>

<template>
  <div class="quickform-keyvalue-field">
    <div v-if="label" class="text-subtitle2 q-mb-xs">
      {{ label }}
      <span v-if="required" style="color: red; margin-left: 0.25rem">*</span>
    </div>

    <div v-if="hint" class="text-caption text-grey-7 q-mb-sm">
      {{ hint }}
    </div>

    <div class="q-pa-md rounded-borders">
      <div v-if="pairs.length" class="row items-center q-gutter-sm q-mb-sm">
        <div class="col text-weight-medium text-caption">Key</div>
        <div class="col text-weight-medium text-caption">Value</div>
        <div style="width: 40px"></div>
      </div>

      <div
        v-for="pair in pairs"
        :key="pair.id"
        class="row items-center q-gutter-sm q-mb-sm"
      >
        <QInput
          v-model="pair.key"
          outlined
          dense
          placeholder="key"
          class="col"
          :disable="disabled"
          :readonly="readonly"
        />
        <QInput
          v-model="pair.value"
          outlined
          dense
          placeholder="value"
          class="col"
          :disable="disabled"
          :readonly="readonly"
        />
        <QBtn
          v-bind="quickformsFeatures.removeButton"
          :disable="disabled || readonly"
          @click="removePair(pair.id)"
          :title="formContext?.labels?.removeItem || 'Remove'"
        >
          <q-tooltip>{{
            formContext?.labels?.removeItem || "Remove"
          }}</q-tooltip>
        </QBtn>
      </div>

      <QBtn
        v-bind="quickformsFeatures.addButton"
        class="full-width"
        :disable="disabled || readonly"
        @click="addPair"
      />
    </div>

    <div v-if="errorMessage" class="text-negative text-caption q-mt-xs">
      {{ errorMessage }}
    </div>
  </div>
</template>
