<script setup lang="ts">
import { QInput, QPopupProxy, QDate } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const {
  value,
  label,
  hint,
  errorMessage,
  fieldId,
  quasarProps,
  fieldGap,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'datetime',
});

// Initialize undefined to null for Quasar compatibility
if (value.value === undefined) {
  value.value = null;
}
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
