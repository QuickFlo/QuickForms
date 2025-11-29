<script setup lang="ts">
import { computed } from "vue";
import { QExpansionItem } from "quasar";
import { useFormField } from "@quickflo/quickforms-vue";
import { useQuasarFormContext } from "../composables/useQuasarFormContext";
import { generateFieldId } from "@quickflo/quickforms-vue";
import { FieldRenderer } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { getFieldGapStyle } from "../utils";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const formContext = useQuasarFormContext();

const { label, hint, errorMessage, required } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

// Determine default expanded state
const defaultOpened = computed(() => {
  // 1. Check x-default-expanded schema override first
  const xDefaultExpanded = (props.schema as any)["x-default-expanded"];
  if (xDefaultExpanded !== undefined) {
    return xDefaultExpanded;
  }

  // 2. Check componentDefaults.object.defaultExpanded
  const objectDefaults = formContext?.componentDefaults?.object;
  const defaultExpandedMode =
    objectDefaults?.defaultExpanded ?? "required-only";

  if (defaultExpandedMode === "all") {
    return true;
  }
  if (defaultExpandedMode === "none") {
    return false;
  }
  // 'required-only': expand required fields, collapse optional
  return required.value;
});

// Show "(optional)" indicator
const showOptionalIndicator = computed(() => {
  const objectDefaults = formContext?.componentDefaults?.object;
  return objectDefaults?.showOptionalIndicator ?? true;
});

const fieldId = generateFieldId(props.path);

const quasarProps = computed(() => {
  const xQuasarProps = (props.schema as any)["x-quasar-props"] || {};
  const xComponentProps = (props.schema as any)["x-component-props"] || {};
  return { ...xComponentProps, ...xQuasarProps };
});

// Get properties to render
const properties = computed(() => {
  if (!props.schema.properties) return [];

  return Object.entries(props.schema.properties).map(([key, schema]) => ({
    key,
    schema,
    path: props.path ? `${props.path}.${key}` : key,
  }));
});

const fieldGap = computed(() =>
  getFieldGapStyle(formContext?.componentDefaults)
);
</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <QExpansionItem
      :id="fieldId"
      :label="label"
      :caption="hint"
      :default-opened="defaultOpened"
      v-bind="quasarProps"
    >
      <template #header>
        <div class="text-subtitle1">
          {{ label }}
          <span v-if="required" style="color: red; margin-left: 0.25rem"
            >*</span
          >
          <span
            v-if="!required && showOptionalIndicator"
            style="color: #888; font-size: 0.75rem; margin-left: 0.5rem"
            >(optional)</span
          >
        </div>
      </template>

      <div style="padding: 1rem">
        <FieldRenderer
          v-for="prop in properties"
          :key="prop.key"
          :schema="prop.schema"
          :path="prop.path"
          :disabled="disabled"
          :readonly="readonly"
        />

        <div
          v-if="errorMessage"
          style="color: red; font-size: 0.875rem; margin-top: 0.5rem"
        >
          {{ errorMessage }}
        </div>
      </div>
    </QExpansionItem>
  </div>
</template>
