<script setup lang="ts">
import { computed } from 'vue';
import { QCard, QCardSection, QBtn, QSeparator } from 'quasar';
import { useFormField, useFormContext } from '@quickflo/quickforms-vue';
import { generateFieldId } from '@quickflo/quickforms-vue';
import { SchemaUtils } from '@quickflo/quickforms';
import { FieldRenderer } from '@quickflo/quickforms-vue';
import type { FieldProps } from '@quickflo/quickforms-vue';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, errorMessage, label, hint } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

const formContext = useFormContext();
const fieldId = generateFieldId(props.path);
const schemaUtils = new SchemaUtils();

const quasarProps = computed(() => {
  const xQuasarProps = (props.schema as any)['x-quasar-props'] || {};
  const xComponentProps = (props.schema as any)['x-component-props'] || {};
  return { ...xComponentProps, ...xQuasarProps };
});

// Ensure value is an array
const arrayValue = computed({
  get: () => (Array.isArray(value.value) ? value.value : []),
  set: (val) => (value.value = val),
});

const itemsSchema = computed(() => {
  if (Array.isArray(props.schema.items)) {
    return props.schema.items[0];
  }
  return props.schema.items;
});

const addItem = () => {
  if (!itemsSchema.value) return;

  const defaultValue = schemaUtils.getDefaultValue(itemsSchema.value);
  value.value = [...arrayValue.value, defaultValue];
};

const removeItem = (index: number) => {
  const newValue = [...arrayValue.value];
  newValue.splice(index, 1);
  value.value = newValue;
};

const moveItem = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index === 0) return;
  if (direction === 'down' && index === arrayValue.value.length - 1) return;

  const newValue = [...arrayValue.value];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  const temp = newValue[index];
  newValue[index] = newValue[targetIndex];
  newValue[targetIndex] = temp;
  value.value = newValue;
};

const canAdd = computed(() => {
  if (props.disabled || props.readonly) return false;
  if (props.schema.maxItems && arrayValue.value.length >= props.schema.maxItems)
    return false;
  return true;
});

const canRemove = computed(() => {
  if (props.disabled || props.readonly) return false;
  if (props.schema.minItems && arrayValue.value.length <= props.schema.minItems)
    return false;
  return true;
});

const getItemLabel = (index: number) => {
  const itemLabelPattern = (props.schema as any)['x-item-label'];

  if (itemLabelPattern === 'none' || itemLabelPattern === false) {
    return '';
  }

  if (typeof itemLabelPattern === 'string' && itemLabelPattern.includes('{{')) {
    const itemValue = arrayValue.value[index];
    if (typeof itemValue === 'object' && itemValue !== null) {
      let label = itemLabelPattern;
      let hasReplacement = false;

      label = label.replace(/\{\{([^}]+)\}\}/g, (_: string, key: string) => {
        const val = itemValue[key.trim()];
        if (val !== undefined && val !== null && val !== '') {
          hasReplacement = true;
          return String(val);
        }
        return '';
      });

      label = label.replace(/^\s*-\s*/, '').replace(/\s*-\s*$/, '');

      if (hasReplacement && label.trim()) {
        return label.trim();
      }
    }
  }

  const title = itemsSchema.value?.title || 'Item';
  return `${title} #${index + 1}`;
};
</script>

<template>
  <div :id="fieldId">
    <div v-if="label" style="font-weight: 500; margin-bottom: 0.5rem">
      {{ label }}
      <span v-if="schema.required" style="color: red; margin-left: 0.125rem">*</span>
    </div>

    <div v-if="hint" style="font-size: 0.875rem; color: #666; margin-bottom: 0.5rem">
      {{ hint }}
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      <QCard
        v-for="(item, index) in arrayValue"
        :key="index"
        flat
        bordered
        v-bind="quasarProps"
      >
        <QCardSection class="row items-start">
          <div class="col">
            <FieldRenderer
              :schema="itemsSchema!"
              :path="`${path}[${index}]`"
              :label="getItemLabel(index)"
              :disabled="disabled"
              :readonly="readonly"
            />
          </div>
          <div class="col-auto q-ml-sm row q-gutter-xs items-center">
            <QBtn
              flat
              round
              dense
              size="sm"
              icon="arrow_upward"
              :disable="index === 0 || disabled || readonly"
              @click="moveItem(index, 'up')"
              title="Move Up"
            >
              <q-tooltip>Move Up</q-tooltip>
            </QBtn>
            <QBtn
              flat
              round
              dense
              size="sm"
              icon="arrow_downward"
              :disable="index === arrayValue.length - 1 || disabled || readonly"
              @click="moveItem(index, 'down')"
              title="Move Down"
            >
              <q-tooltip>Move Down</q-tooltip>
            </QBtn>
            <QBtn
              flat
              round
              dense
              size="sm"
              icon="close"
              color="negative"
              :disable="!canRemove"
              @click="removeItem(index)"
              :title="formContext?.labels?.removeItem || 'Remove'"
            >
              <q-tooltip>Remove</q-tooltip>
            </QBtn>
          </div>
        </QCardSection>
      </QCard>

      <div v-if="arrayValue.length === 0" style="color: #999; font-style: italic">
        No items
      </div>

      <div>
        <QBtn
          outline
          color="primary"
          icon="add"
          :label="formContext?.labels?.addItem || 'Add item'"
          :disable="!canAdd"
          @click="addItem"
        />
      </div>

      <div v-if="errorMessage" style="color: red; font-size: 0.875rem">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>
