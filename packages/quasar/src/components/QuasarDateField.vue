<script setup lang="ts">
import { computed } from 'vue';
import { QInput, QPopupProxy, QDate } from 'quasar';
import { useFormField, useFormContext } from '@quickflo/quickforms-vue';
import { generateFieldId } from '@quickflo/quickforms-vue';
import type { FieldProps } from '@quickflo/quickforms-vue';
import { mergeQuasarProps } from '../utils';

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const { value, errorMessage, label, hint } = useFormField(
  props.path,
  props.schema,
  { label: props.label }
);

// Initialize undefined to null for Quasar compatibility
if (value.value === undefined) {
  value.value = null;
}

const formContext = useFormContext();
const fieldId = generateFieldId(props.path);

const quasarProps = computed(() => {
  return mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults as any,
    'datetime'
  );
});

const rules = computed(() => {
  const rulesList: any[] = [];
  if (props.schema.required) {
    rulesList.push((val: string) => (val && val.length > 0) || 'This field is required');
  }
  return rulesList;
});
</script>

<template>
  <QInput
    :id="fieldId"
    v-model="value"
    :label="label"
    :hint="hint"
    :error="!!errorMessage"
    :error-message="errorMessage || undefined"
    :disable="disabled"
    :readonly="readonly"
    :rules="rules"
    :required="schema.required"
    v-bind="quasarProps"
  >
    <template #prepend>
      <q-icon name="event" class="cursor-pointer">
        <QPopupProxy cover transition-show="scale" transition-hide="scale">
          <QDate v-model="value" mask="YYYY-MM-DD">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </QDate>
        </QPopupProxy>
      </q-icon>
    </template>
    <template v-if="schema.required" #label>
      {{ label }} <span style="color: red">*</span>
    </template>
  </QInput>
</template>
