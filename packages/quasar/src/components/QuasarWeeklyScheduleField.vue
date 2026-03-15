<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { QCheckbox, QBtn, QInput, QIcon, QTooltip, QSeparator } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";

interface Props extends FieldProps {
  hideLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  hideLabel: false,
});

// ── Day metadata ──────────────────────────────────────────────

const ALL_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type Day = (typeof ALL_DAYS)[number];

const DAY_META: Record<Day, { label: string; abbr: string; weekend: boolean }> =
  {
    monday: { label: "Monday", abbr: "Mon", weekend: false },
    tuesday: { label: "Tuesday", abbr: "Tue", weekend: false },
    wednesday: { label: "Wednesday", abbr: "Wed", weekend: false },
    thursday: { label: "Thursday", abbr: "Thu", weekend: false },
    friday: { label: "Friday", abbr: "Fri", weekend: false },
    saturday: { label: "Saturday", abbr: "Sat", weekend: true },
    sunday: { label: "Sunday", abbr: "Sun", weekend: true },
  };

// ── Value types ───────────────────────────────────────────────

interface ScheduleEntry {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface Shift {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  day: Day;
  open: boolean;
  shifts: Shift[];
}

// ── Config ────────────────────────────────────────────────────

const scheduleConfig = computed(() => {
  const globalDefaults =
    formContext?.quickformsDefaults?.schedule?.defaults || {};
  const xSchedule = (props.schema as any)["x-schedule"] || {};
  const merged = { ...globalDefaults, ...xSchedule };
  return {
    dayOrder: (merged.dayOrder as string) || "mon-first",
    allowOvernight: merged.allowOvernight ?? false,
    hidePresets: merged.hidePresets ?? false,
    allowMultipleShifts: merged.allowMultipleShifts ?? true,
    timezoneLabel: (merged.timezoneLabel as string) || "",
    maxHeight: (merged.maxHeight as string) || "",
  };
});

const orderedDays = computed((): Day[] => {
  if (scheduleConfig.value.dayOrder === "sun-first") {
    return [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
  }
  return [...ALL_DAYS];
});

// ── Form field ────────────────────────────────────────────────

const {
  value,
  label,
  hint,
  tooltip,
  errorMessage,
  required,
  fieldId,
  fieldGap,
  formContext,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: "card",
});

// ── Value conversion ──────────────────────────────────────────

function valueToDisplay(val: unknown): DaySchedule[] {
  const entries = Array.isArray(val) ? (val as ScheduleEntry[]) : [];
  const grouped: Partial<Record<Day, Shift[]>> = {};

  for (const entry of entries) {
    const day = entry.dayOfWeek?.toLowerCase() as Day;
    if (!ALL_DAYS.includes(day)) continue;
    if (!grouped[day]) grouped[day] = [];
    grouped[day]!.push({
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
    });
  }

  return orderedDays.value.map((day) => ({
    day,
    open: !!grouped[day] && grouped[day]!.length > 0,
    shifts: grouped[day] || [],
  }));
}

function displayToValue(display: DaySchedule[]): ScheduleEntry[] {
  const result: ScheduleEntry[] = [];
  for (const ds of display) {
    if (ds.open) {
      for (const shift of ds.shifts) {
        result.push({
          dayOfWeek: ds.day,
          startTime: shift.startTime,
          endTime: shift.endTime,
        });
      }
    }
  }
  return result;
}

// ── Internal state ────────────────────────────────────────────

const days = ref<DaySchedule[]>(valueToDisplay(value.value));
let suppressWatch = false;

// Internal → value
watch(
  days,
  (newDays) => {
    suppressWatch = true;
    value.value = displayToValue(newDays);
    suppressWatch = false;
  },
  { deep: true },
);

// External value → internal (for prefill)
watch(
  value,
  (newVal) => {
    if (suppressWatch) return;
    const incoming = JSON.stringify(displayToValue(valueToDisplay(newVal)));
    const current = JSON.stringify(displayToValue(days.value));
    if (incoming !== current) {
      days.value = valueToDisplay(newVal);
    }
  },
  { deep: false },
);

// ── Smart defaults ────────────────────────────────────────────

function getSmartDefault(dayIndex: number): Shift {
  // Copy previous open day's first shift
  for (let i = dayIndex - 1; i >= 0; i--) {
    const prev = days.value[i];
    if (prev.open && prev.shifts.length > 0) {
      return { ...prev.shifts[0] };
    }
  }
  return { startTime: "09:00", endTime: "17:00" };
}

function addTimeHours(time: string, hours: number): string {
  if (!time) return "17:00";
  const [h, m] = time.split(":").map(Number);
  const total = (h + hours) % 24;
  return `${String(total).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}

// ── Day operations ────────────────────────────────────────────

function toggleDay(index: number) {
  if (props.disabled || props.readonly) return;
  const day = days.value[index];
  if (day.open) {
    day.open = false;
    day.shifts = [];
  } else {
    day.open = true;
    day.shifts = [getSmartDefault(index)];
  }
}

function addShift(dayIndex: number) {
  const day = days.value[dayIndex];
  const last = day.shifts[day.shifts.length - 1];
  const newStart = last?.endTime || "09:00";
  day.shifts.push({ startTime: newStart, endTime: addTimeHours(newStart, 8) });
}

function removeShift(dayIndex: number, shiftIndex: number) {
  const day = days.value[dayIndex];
  day.shifts.splice(shiftIndex, 1);
  if (day.shifts.length === 0) {
    day.open = false;
  }
}

function isOvernight(shift: Shift): boolean {
  if (!scheduleConfig.value.allowOvernight) return false;
  if (!shift.startTime || !shift.endTime) return false;
  return shift.endTime < shift.startTime;
}

// ── Selection ─────────────────────────────────────────────────

const selectedDays = ref<Set<number>>(new Set());

const isAllSelected = computed(
  () => days.value.length > 0 && selectedDays.value.size === days.value.length,
);

const isSomeSelected = computed(
  () =>
    selectedDays.value.size > 0 && selectedDays.value.size < days.value.length,
);

function toggleSelectDay(index: number) {
  const next = new Set(selectedDays.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  selectedDays.value = next;
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedDays.value = new Set();
  } else {
    selectedDays.value = new Set(days.value.map((_, i) => i));
  }
}

// ── Bulk edit ─────────────────────────────────────────────────

const bulkShifts = ref<Shift[]>([{ startTime: "09:00", endTime: "17:00" }]);

function addBulkShift() {
  const last = bulkShifts.value[bulkShifts.value.length - 1];
  const newStart = last?.endTime || "09:00";
  bulkShifts.value.push({
    startTime: newStart,
    endTime: addTimeHours(newStart, 8),
  });
}

function removeBulkShift(index: number) {
  if (bulkShifts.value.length > 1) bulkShifts.value.splice(index, 1);
}

function applyBulkOpen() {
  for (const idx of selectedDays.value) {
    days.value[idx].open = true;
    days.value[idx].shifts = bulkShifts.value.map((s) => ({ ...s }));
  }
  selectedDays.value = new Set();
}

function applyBulkClosed() {
  for (const idx of selectedDays.value) {
    days.value[idx].open = false;
    days.value[idx].shifts = [];
  }
  selectedDays.value = new Set();
}

// ── Presets ───────────────────────────────────────────────────

type Preset = "weekdays-9-5" | "all-9-5" | "clear-all";

function applyPreset(preset: Preset) {
  const nineToFive: Shift = { startTime: "09:00", endTime: "17:00" };
  const weekdays: Day[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  for (const daySchedule of days.value) {
    if (preset === "weekdays-9-5") {
      if (weekdays.includes(daySchedule.day)) {
        daySchedule.open = true;
        daySchedule.shifts = [{ ...nineToFive }];
      } else {
        daySchedule.open = false;
        daySchedule.shifts = [];
      }
    } else if (preset === "all-9-5") {
      daySchedule.open = true;
      daySchedule.shifts = [{ ...nineToFive }];
    } else {
      daySchedule.open = false;
      daySchedule.shifts = [];
    }
  }
  selectedDays.value = new Set();
}

// ── Derived display ───────────────────────────────────────────

const selectedCount = computed(() => selectedDays.value.size);
</script>

<template>
  <div :id="fieldId" :style="{ marginBottom: fieldGap }" class="qws">
    <!-- ── Header ────────────────────────────────────────────── -->
    <div
      class="qws__header"
      v-if="(label && !hideLabel) || !scheduleConfig.hidePresets || scheduleConfig.timezoneLabel"
    >
      <div class="qws__header-left">
        <div v-if="label && !hideLabel" class="qws__label">
          {{ label }}
          <span v-if="required" class="qws__required">*</span>
          <span v-if="scheduleConfig.timezoneLabel" class="qws__tz-badge">
            <QIcon name="schedule" size="11px" />
            {{ scheduleConfig.timezoneLabel }}
          </span>
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
        <div v-if="hint" class="qws__hint" v-html="hint"></div>
      </div>

      <div
        v-if="!scheduleConfig.hidePresets && !disabled && !readonly"
        class="qws__presets"
      >
        <button class="qws__preset-btn" @click="applyPreset('weekdays-9-5')">
          Mon–Fri 9–5
        </button>
        <button class="qws__preset-btn" @click="applyPreset('all-9-5')">
          All days 9–5
        </button>
        <button
          class="qws__preset-btn qws__preset-btn--danger"
          @click="applyPreset('clear-all')"
        >
          Close all
        </button>
      </div>
    </div>

    <!-- ── Schedule grid ─────────────────────────────────────── -->
    <div
      class="qws__grid"
      :style="scheduleConfig.maxHeight ? { maxHeight: scheduleConfig.maxHeight, overflowY: 'auto' } : undefined"
    >
      <!-- Select-all row -->
      <div v-if="!disabled && !readonly" class="qws__select-all-row">
        <QCheckbox
          :model-value="isAllSelected"
          :indeterminate-value="isSomeSelected ? true : undefined"
          dense
          size="xs"
          color="primary"
          @update:model-value="toggleSelectAll"
        />
        <span class="qws__select-all-label">
          {{ isAllSelected ? "Deselect all" : "Select all" }}
        </span>
      </div>

      <!-- Day rows -->
      <div
        v-for="(daySchedule, idx) in days"
        :key="daySchedule.day"
        class="qws__row"
        :class="{
          'qws__row--open': daySchedule.open,
          'qws__row--closed': !daySchedule.open,
          'qws__row--selected': selectedDays.has(idx),
          'qws__row--weekend': DAY_META[daySchedule.day].weekend,
        }"
      >
        <!-- Checkbox -->
        <div v-if="!disabled && !readonly" class="qws__row-check">
          <QCheckbox
            :model-value="selectedDays.has(idx)"
            dense
            size="xs"
            color="primary"
            @update:model-value="toggleSelectDay(idx)"
          />
        </div>
        <div v-else class="qws__row-check" />

        <!-- Day badge -->
        <div
          class="qws__day-badge"
          :class="
            DAY_META[daySchedule.day].weekend
              ? 'qws__day-badge--weekend'
              : 'qws__day-badge--weekday'
          "
        >
          {{ DAY_META[daySchedule.day].abbr }}
        </div>

        <!-- Open/closed toggle pill -->
        <button
          class="qws__toggle"
          :class="
            daySchedule.open ? 'qws__toggle--open' : 'qws__toggle--closed'
          "
          :disabled="disabled || readonly"
          @click="toggleDay(idx)"
        >
          <span class="qws__toggle-dot" />
          <span class="qws__toggle-label">
            {{ daySchedule.open ? "Open" : "Closed" }}
          </span>
        </button>

        <!-- Shifts area -->
        <div class="qws__shifts">
          <template v-if="daySchedule.open">
            <div
              v-for="(shift, shiftIdx) in daySchedule.shifts"
              :key="shiftIdx"
              class="qws__shift"
            >
              <QInput
                :model-value="shift.startTime"
                type="time"
                dense
                borderless
                class="qws__time-input"
                :readonly="disabled || readonly"
                :disable="disabled"
                @update:model-value="(v: any) => (shift.startTime = v)"
              />
              <span class="qws__shift-sep">
                <QIcon name="arrow_forward" size="14px" color="grey-5" />
              </span>
              <QInput
                :model-value="shift.endTime"
                type="time"
                dense
                borderless
                class="qws__time-input"
                :readonly="disabled || readonly"
                :disable="disabled"
                @update:model-value="(v: any) => (shift.endTime = v)"
              />
              <span v-if="isOvernight(shift)" class="qws__overnight">
                <QIcon name="brightness_3" size="11px" />
                <QTooltip>Overnight — ends next day</QTooltip>
              </span>
              <QBtn
                v-if="!disabled && !readonly && daySchedule.shifts.length > 1"
                flat
                round
                dense
                size="xs"
                icon="close"
                color="grey-5"
                class="qws__shift-remove"
                @click="removeShift(idx, shiftIdx)"
              >
                <QTooltip>Remove shift</QTooltip>
              </QBtn>
            </div>

            <!-- Add shift -->
            <QBtn
              v-if="
                !disabled && !readonly && scheduleConfig.allowMultipleShifts
              "
              flat
              dense
              no-caps
              size="xs"
              icon="add"
              label="Add shift"
              color="primary"
              class="qws__add-shift"
              @click="addShift(idx)"
            >
              <QTooltip>
                Add another time range for
                {{ DAY_META[daySchedule.day].label }}
              </QTooltip>
            </QBtn>
          </template>

          <!-- Closed state -->
          <div v-else class="qws__closed-state">
            <span class="qws__closed-label">Closed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bulk toolbar ───────────────────────────────────────── -->
    <Transition name="qws-bulk">
      <div v-if="selectedCount > 0 && !disabled && !readonly" class="qws__bulk">
        <div class="qws__bulk-left">
          <span class="qws__bulk-count">
            {{ selectedCount }}
            {{ selectedCount === 1 ? "day" : "days" }} selected
          </span>

          <QSeparator vertical class="qws__bulk-sep" />

          <div class="qws__bulk-shifts">
            <div
              v-for="(shift, idx) in bulkShifts"
              :key="idx"
              class="qws__shift qws__shift--bulk"
            >
              <QInput
                v-model="shift.startTime"
                type="time"
                dense
                borderless
                class="qws__time-input qws__time-input--bulk"
              />
              <span class="qws__shift-sep">
                <QIcon name="arrow_forward" size="14px" color="grey-5" />
              </span>
              <QInput
                v-model="shift.endTime"
                type="time"
                dense
                borderless
                class="qws__time-input qws__time-input--bulk"
              />
              <QBtn
                v-if="bulkShifts.length > 1"
                flat
                round
                dense
                size="xs"
                icon="close"
                color="grey-5"
                @click="removeBulkShift(idx)"
              />
            </div>

            <QBtn
              v-if="scheduleConfig.allowMultipleShifts"
              flat
              dense
              no-caps
              size="xs"
              icon="add"
              label="Add range"
              color="primary"
              @click="addBulkShift"
            />
          </div>
        </div>

        <div class="qws__bulk-actions">
          <button class="qws__bulk-apply" @click="applyBulkOpen">
            Apply to selected
          </button>
          <button class="qws__bulk-close-days" @click="applyBulkClosed">
            Set closed
          </button>
          <button class="qws__bulk-deselect" @click="selectedDays = new Set()">
            Deselect
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── Error ──────────────────────────────────────────────── -->
    <div v-if="errorMessage" class="qws__error">{{ errorMessage }}</div>
  </div>
</template>

<style scoped>
/* ── Container ──────────────────────────────────────────────── */
.qws {
  font-family: inherit;
  container-type: inline-size;
}

/* ── Header ─────────────────────────────────────────────────── */
.qws__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.qws__header-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.qws__label {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  display: flex;
  align-items: center;
  gap: 4px;
}

.qws__required {
  color: #c10015;
  margin-left: 1px;
}

.qws__hint {
  font-size: 12px;
  color: #757575;
}

/* Timezone badge */
.qws__tz-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0f4ff;
  border: 1px solid #c7d2fe;
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 600;
  color: #4338ca;
  white-space: nowrap;
  user-select: none;
}

/* Preset buttons */
.qws__presets {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.qws__preset-btn {
  border: 1px solid #e0e0e0;
  background: #fafafa;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 500;
  color: #424242;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.qws__preset-btn:hover {
  background: #f0f0f0;
  border-color: #bdbdbd;
  color: var(--qws-selection-accent, #4338ca);
}

.qws__preset-btn--danger {
  color: #b71c1c;
  border-color: #ffcdd2;
  background: #fff8f8;
}

.qws__preset-btn--danger:hover {
  background: #ffebee;
  border-color: #ef9a9a;
  color: #c62828;
}

/* ── Grid ───────────────────────────────────────────────────── */
.qws__grid {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
  background: #ffffff;
}

/* Select-all row */
.qws__select-all-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: #f7f8fc;
  border-bottom: 1px solid #eeeeee;
}

.qws__select-all-label {
  font-size: 11.5px;
  font-weight: 500;
  color: #9e9e9e;
  cursor: default;
}

/* ── Day row ────────────────────────────────────────────────── */
.qws__row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.12s ease;
  position: relative;
}

.qws__row:last-child {
  border-bottom: none;
}

.qws__row:hover {
  background: #f9fafc;
}

.qws__row--selected {
  background: #f0f4ff !important;
}

.qws__row--selected::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--qws-selection-accent, #4338ca);
  border-radius: 0;
}

.qws__row--closed {
  opacity: 0.7;
}

.qws__row--closed:hover {
  opacity: 1;
}

/* Row checkbox */
.qws__row-check {
  flex: 0 0 20px;
  display: flex;
  align-items: center;
  padding-top: 5px;
}

/* ── Day badge ──────────────────────────────────────────────── */
.qws__day-badge {
  flex: 0 0 38px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-top: 2px;
}

.qws__day-badge--weekday {
  background: #e8eaf6;
  color: #283593;
}

.qws__day-badge--weekend {
  background: #f3e5f5;
  color: #6a1b9a;
}

/* ── Toggle pill ────────────────────────────────────────────── */
.qws__toggle {
  flex: 0 0 80px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px 5px 8px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.15s ease;
  margin-top: 1px;
  outline: none;
}

.qws__toggle:focus-visible {
  box-shadow: 0 0 0 2px #3f51b5;
}

.qws__toggle:disabled {
  cursor: default;
  opacity: 0.7;
}

.qws__toggle--open {
  background: #e8f5e9;
  color: #1b5e20;
}

.qws__toggle--open:not(:disabled):hover {
  background: #c8e6c9;
}

.qws__toggle--closed {
  background: #f5f5f5;
  color: #757575;
}

.qws__toggle--closed:not(:disabled):hover {
  background: #eeeeee;
  color: #424242;
}

.qws__toggle-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.qws__toggle--open .qws__toggle-dot {
  background: #43a047;
}

.qws__toggle--closed .qws__toggle-dot {
  background: #bdbdbd;
}

.qws__toggle-label {
  font-size: 11.5px;
  user-select: none;
}

/* ── Shifts area ────────────────────────────────────────────── */
.qws__shifts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

/* Individual shift row */
.qws__shift {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qws__shift--bulk {
  gap: 4px;
}

/* Time input */
.qws__time-input {
  width: 108px;
  flex-shrink: 1;
  min-width: 80px;
}

.qws__time-input :deep(.q-field__control) {
  background: #f3f4f6;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  min-height: 30px;
  height: 30px;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.qws__time-input :deep(.q-field__control:hover) {
  border-color: #a5b4fc;
  background: white;
}

.qws__time-input :deep(.q-field__control:focus-within) {
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.qws__time-input :deep(.q-field__native) {
  padding: 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  min-height: 30px;
  height: 30px;
}

/* --bulk time inputs inherit the base light styles */

/* Shift separator arrow */
.qws__shift-sep {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin: 0 2px;
}

/* Overnight indicator */
.qws__overnight {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e8eaf6;
  color: #3f51b5;
  flex-shrink: 0;
  cursor: help;
}

/* Remove shift button */
.qws__shift-remove {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.qws__shift:hover .qws__shift-remove {
  opacity: 1;
}

/* Add shift button */
.qws__add-shift {
  align-self: flex-start;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.qws__row:hover .qws__add-shift {
  opacity: 1;
}

/* Closed state */
.qws__closed-state {
  display: flex;
  align-items: center;
  padding-top: 4px;
}

.qws__closed-label {
  font-size: 12px;
  color: #bdbdbd;
  font-style: italic;
  letter-spacing: 0.02em;
}

/* ── Bulk toolbar ───────────────────────────────────────────── */
.qws__bulk {
  margin-top: 8px;
  background: #f7f8fc;
  border: 1px solid #e4e2f8;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
}

.qws__bulk-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.qws__bulk-count {
  font-size: 12.5px;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.qws__bulk-sep {
  opacity: 0.2;
  height: 24px;
}

.qws__bulk-shifts {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.qws__bulk-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.qws__bulk-apply {
  background: var(--qws-selection-accent, #4338ca);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.qws__bulk-apply:hover {
  background: #3730a3;
}

.qws__bulk-close-days {
  background: #fff8f8;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.qws__bulk-close-days:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.qws__bulk-deselect {
  background: transparent;
  color: #9ca3af;
  border: none;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s ease;
  white-space: nowrap;
}

.qws__bulk-deselect:hover {
  color: #374151;
}

/* ── Bulk toolbar transition ────────────────────────────────── */
.qws-bulk-enter-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.qws-bulk-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.6, 1);
}

.qws-bulk-enter-from,
.qws-bulk-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Error ──────────────────────────────────────────────────── */
.qws__error {
  color: #c10015;
  font-size: 12px;
  margin-top: 4px;
}

/* ── Responsive ────────────────────────────────────────────── */
@container (max-width: 480px) {
  .qws__row {
    flex-wrap: wrap;
  }

  .qws__shifts {
    flex-basis: 100%;
    padding-left: 28px;
  }

  .qws__presets {
    flex-wrap: wrap;
  }
}
</style>
