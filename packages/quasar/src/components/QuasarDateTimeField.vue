<script setup lang="ts">
import { computed } from "vue";
import {
  QInput,
  QPopupProxy,
  QDate,
  QTime,
  QCard,
  QCardActions,
  QSeparator,
} from "quasar";
import { useFormField, useFormContext } from "@quickflo/quickforms-vue";
import { generateFieldId } from "@quickflo/quickforms-vue";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { mergeQuasarProps } from "../utils";

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
    "datetime"
  );
});

// Allow customization of mask via x-quasar-props or default to ISO-like format
const dateMask = computed(() => {
  return quasarProps.value.dateMask || "YYYY-MM-DD";
});

const timeMask = computed(() => {
  return quasarProps.value.timeMask || "hh:mm A"; // Human-readable 12-hour default
});

const fullMask = computed(() => {
  // Human-readable format for display (stored value will be different)
  return quasarProps.value.mask || `${dateMask.value} ${timeMask.value}`;
});

const use24Hour = computed(() => {
  return quasarProps.value.format24h || false;
});

const withSeconds = computed(() => {
  return quasarProps.value.withSeconds || false;
});


const setNow = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  if (use24Hour.value) {
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    value.value = `${year}-${month}-${day} ${hours}:${minutes}`;
  } else {
    let hours = now.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, "0");
    value.value = `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  }
};
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
    :required="schema.required"
    v-bind="quasarProps"
  >
    <template #prepend>
      <q-icon name="event" class="cursor-pointer">
        <QPopupProxy transition-show="scale" transition-hide="scale">
          <q-card flat class="datetime-picker-card">
            <div class="row no-wrap">
              <QDate
                v-model="value"
                :mask="fullMask"
                color="primary"
                flat
                class="datetime-date-picker"
              />

              <q-separator vertical />

              <QTime
                v-model="value"
                :mask="fullMask"
                :format24h="use24Hour"
                :with-seconds="withSeconds"
                color="primary"
                flat
                class="datetime-time-picker"
              />
            </div>

            <q-separator />

            <q-card-actions align="right" class="q-px-md">
              <q-btn label="Now" color="primary" flat dense @click="setNow" />
              <q-btn v-close-popup label="Done" color="primary" flat dense />
            </q-card-actions>
          </q-card>
        </QPopupProxy>
      </q-icon>
    </template>
    <template v-if="schema.required" #label>
      {{ label }} <span style="color: red">*</span>
    </template>
  </QInput>
</template>

<style scoped>
.datetime-picker-card {
  overflow: hidden;
}

/* Remove borders from date and time pickers */
:deep(.datetime-date-picker .q-date__view),
:deep(.datetime-time-picker .q-time) {
  border: none !important;
  box-shadow: none !important;
}

/* Make the pickers more compact */
:deep(.datetime-date-picker) {
  max-width: 290px;
}

:deep(.datetime-time-picker) {
  max-width: 290px;
}
</style>
