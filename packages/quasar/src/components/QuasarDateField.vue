<script setup lang="ts">
import { computed } from "vue";
import { QInput, QPopupProxy, QDate } from "quasar";
import { useFormField } from "@quickflo/quickforms-vue";
import { useQuasarFormContext } from "../composables/useQuasarFormContext";
import { generateFieldId } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { mergeQuasarProps, getFieldGapStyle } from "../utils";

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

const formContext = useQuasarFormContext();
const fieldId = generateFieldId(props.path);

const quasarProps = computed(() => {
  return mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults,
    "datetime"
  );
});

const fieldGap = computed(() =>
  getFieldGapStyle(formContext?.componentDefaults)
);
</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <QInput
      :id="fieldId"
      v-model="value"
      :label="label"
      :hint="hint"
      :error="!!errorMessage"
      :error-message="errorMessage || undefined"
      :disable="disabled"
      :readonly="readonly"
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
  </div>
</template>
