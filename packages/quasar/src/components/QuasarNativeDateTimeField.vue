<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { QInput, QIcon, QTooltip } from "quasar";
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
  tooltip,
  tooltipPlacement,
  errorMessage,
  fieldId,
  fieldGap,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: 'datetime',
});

// Split the combined value into date and time parts
const dateValue = ref('');
const timeValue = ref('');

// Detect user's timezone for display
const userTimezone = computed(() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return '';
  }
});

// Build the hint: show timezone, plus any schema-defined hint
const effectiveHint = computed(() => {
  const parts: string[] = [];
  if (hint.value) parts.push(hint.value);
  if (userTimezone.value) parts.push(`Timezone: ${userTimezone.value}`);
  return parts.join(' · ');
});

// Parse combined value "YYYY-MM-DD HH:mm" or "YYYY-MM-DDTHH:mm" into date+time
function parseValue(v: unknown) {
  if (!v || typeof v !== 'string') {
    dateValue.value = '';
    timeValue.value = '';
    return;
  }
  // Handle "YYYY-MM-DDTHH:mm", "YYYY-MM-DD HH:mm", or just "YYYY-MM-DD"
  const normalized = v.replace('T', ' ');
  const [datePart, timePart] = normalized.split(' ');
  dateValue.value = datePart || '';
  timeValue.value = timePart || '';
}

// Initialize from current value
parseValue(value.value);

// Watch for external changes to the combined value
watch(() => value.value, (newVal) => {
  parseValue(newVal);
});

// Update combined value when date or time changes
function updateValue() {
  if (!dateValue.value) {
    value.value = '';
    return;
  }
  if (timeValue.value) {
    value.value = `${dateValue.value} ${timeValue.value}`;
  } else {
    value.value = dateValue.value;
  }
}
</script>

<template>
  <div :style="{ marginBottom: fieldGap }">
    <div class="native-datetime-label q-mb-xs" v-if="label">
      <span class="text-body2 text-grey-8">{{ label }}</span>
      <span v-if="schema.required" style="color: red"> *</span>
      <QIcon
        v-if="tooltip"
        name="info"
        size="xs"
        color="grey-6"
        class="cursor-help q-ml-xs"
      >
        <QTooltip><span v-html="tooltip"></span></QTooltip>
      </QIcon>
    </div>
    <div class="native-datetime-row">
      <QInput
        :id="fieldId"
        v-model="dateValue"
        type="date"
        outlined
        dense
        class="native-datetime-date"
        :disable="disabled"
        :readonly="readonly"
        :error="!!errorMessage"
        hide-bottom-space
        @update:model-value="updateValue"
      />
      <QInput
        v-model="timeValue"
        type="time"
        outlined
        dense
        class="native-datetime-time"
        :disable="disabled"
        :readonly="readonly"
        :error="!!errorMessage"
        hide-bottom-space
        @update:model-value="updateValue"
      />
    </div>
    <div v-if="errorMessage" class="text-negative text-caption q-mt-xs">
      {{ errorMessage }}
    </div>
    <div v-if="effectiveHint" class="text-caption text-grey-6 q-mt-xs">
      {{ effectiveHint }}
    </div>
  </div>
</template>

<style scoped>
.native-datetime-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.native-datetime-date {
  flex: 1;
}

.native-datetime-time {
  width: 140px;
  flex-shrink: 0;
}
</style>
