<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { QCheckbox, QBtn, QInput, QIcon, QTooltip } from "quasar";
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

// ── Types ─────────────────────────────────────────────────────

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

interface BusinessGroup {
  id: string;
  name: string;
  schedule: ScheduleEntry[];
}

// ── Config from schema ────────────────────────────────────────

const config = computed(() => {
  const x = (props.schema as any)["x-multi-group-schedule"] || {};
  return {
    groupNameKey: (x.groupNameKey as string) || "name",
    groupIdKey: (x.groupIdKey as string) || "id",
    scheduleKey: (x.scheduleKey as string) || "schedule",
    allowMultipleShifts: (x.allowMultipleShifts ?? true) as boolean,
    timezoneLabel: (x.timezoneLabel as string) || "",
  };
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
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: "card",
});

// ── Schedule helpers ──────────────────────────────────────────

function parseSchedule(schedule: ScheduleEntry[]): DaySchedule[] {
  const grouped: Partial<Record<Day, Shift[]>> = {};
  for (const entry of schedule) {
    const day = entry.dayOfWeek?.toLowerCase() as Day;
    if (!ALL_DAYS.includes(day)) continue;
    if (!grouped[day]) grouped[day] = [];
    grouped[day]!.push({
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
    });
  }
  return ALL_DAYS.map((day) => ({
    day,
    open: !!grouped[day] && grouped[day]!.length > 0,
    shifts: grouped[day] || [],
  }));
}

function serializeSchedule(days: DaySchedule[]): ScheduleEntry[] {
  const result: ScheduleEntry[] = [];
  for (const ds of days) {
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

function deepCopyDays(days: DaySchedule[]): DaySchedule[] {
  return days.map((d) => ({ ...d, shifts: d.shifts.map((s) => ({ ...s })) }));
}

// ── Derived groups ────────────────────────────────────────────

const rawGroups = computed((): BusinessGroup[] => {
  const arr = Array.isArray(value.value) ? value.value : [];
  const { groupNameKey, groupIdKey, scheduleKey } = config.value;
  return (arr as Record<string, unknown>[]).map((g) => ({
    id: String(g[groupIdKey] ?? ""),
    name: String(g[groupNameKey] ?? ""),
    schedule: Array.isArray(g[scheduleKey])
      ? (g[scheduleKey] as ScheduleEntry[])
      : [],
  }));
});

const groupDays = computed((): DaySchedule[][] =>
  rawGroups.value.map((g) => parseSchedule(g.schedule)),
);

function updateGroupSchedule(groupIdx: number, days: DaySchedule[]) {
  const raw = Array.isArray(value.value)
    ? [...(value.value as Record<string, unknown>[])]
    : [];
  if (!raw[groupIdx]) return;
  raw[groupIdx] = {
    ...raw[groupIdx],
    [config.value.scheduleKey]: serializeSchedule(days),
  };
  value.value = raw;
}

// ── Original value (for reset) ────────────────────────────────

// Capture the prefilled state the first time non-empty data arrives.
// After that we stop watching so edits never overwrite it.
const originalValue = ref<unknown>(null);

let stopCapture: (() => void) | undefined;
stopCapture = watch(
  value,
  (newVal) => {
    if (
      Array.isArray(newVal) &&
      newVal.length > 0 &&
      originalValue.value === null
    ) {
      originalValue.value = JSON.parse(JSON.stringify(newVal));
      stopCapture?.();
    }
  },
  { immediate: true },
);

function getOriginalGroupDays(groupIdx: number): DaySchedule[] | null {
  if (!Array.isArray(originalValue.value)) return null;
  const orig = (originalValue.value as Record<string, unknown>[])[groupIdx];
  if (!orig) return null;
  const schedule = Array.isArray(orig[config.value.scheduleKey])
    ? (orig[config.value.scheduleKey] as ScheduleEntry[])
    : [];
  return parseSchedule(schedule);
}

function hasChanges(groupIdx: number): boolean {
  const origDays = getOriginalGroupDays(groupIdx);
  if (!origDays) return false;
  return (
    JSON.stringify(serializeSchedule(origDays)) !==
    JSON.stringify(serializeSchedule(groupDays.value[groupIdx]))
  );
}

function resetGroup(groupIdx: number) {
  const origDays = getOriginalGroupDays(groupIdx);
  if (origDays) updateGroupSchedule(groupIdx, origDays);
}

function resetSelected() {
  const raw = Array.isArray(value.value)
    ? [...(value.value as Record<string, unknown>[])]
    : [];
  for (const idx of selectedGroups.value) {
    const origDays = getOriginalGroupDays(idx);
    if (origDays) {
      raw[idx] = {
        ...raw[idx],
        [config.value.scheduleKey]: serializeSchedule(origDays),
      };
    }
  }
  value.value = raw;
}

// ── Selection ─────────────────────────────────────────────────

const selectedGroups = ref<Set<number>>(new Set());

const isAllSelected = computed(
  () =>
    rawGroups.value.length > 0 &&
    selectedGroups.value.size === rawGroups.value.length,
);
const isSomeSelected = computed(
  () =>
    selectedGroups.value.size > 0 &&
    selectedGroups.value.size < rawGroups.value.length,
);

function toggleSelectGroup(idx: number) {
  const next = new Set(selectedGroups.value);
  if (next.has(idx)) next.delete(idx);
  else next.add(idx);
  selectedGroups.value = next;
}

function toggleSelectAll() {
  selectedGroups.value = isAllSelected.value
    ? new Set()
    : new Set(rawGroups.value.map((_, i) => i));
}

const selectedCount = computed(() => selectedGroups.value.size);
const selectedGroupNames = computed(() =>
  [...selectedGroups.value]
    .map((idx) => rawGroups.value[idx]?.name)
    .filter(Boolean),
);

// ── Expand / collapse ─────────────────────────────────────────

const expandedGroups = ref<Set<number>>(new Set());

function toggleExpanded(idx: number) {
  const next = new Set(expandedGroups.value);
  if (next.has(idx)) next.delete(idx);
  else next.add(idx);
  expandedGroups.value = next;
}

// ── Per-group editing ─────────────────────────────────────────

function getSmartDefault(days: DaySchedule[], dayIdx: number): Shift {
  for (let i = dayIdx - 1; i >= 0; i--) {
    if (days[i].open && days[i].shifts.length > 0)
      return { ...days[i].shifts[0] };
  }
  return { startTime: "09:00", endTime: "17:00" };
}

function addTimeHours(time: string, hours: number): string {
  if (!time) return "17:00";
  const [h, m] = time.split(":").map(Number);
  return `${String(((h || 0) + hours) % 24).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}

function toggleDay(groupIdx: number, dayIdx: number) {
  if (props.disabled || props.readonly) return;
  const days = deepCopyDays(groupDays.value[groupIdx]);
  const day = days[dayIdx];
  if (day.open) {
    day.open = false;
    day.shifts = [];
  } else {
    day.open = true;
    day.shifts = [getSmartDefault(days, dayIdx)];
  }
  updateGroupSchedule(groupIdx, days);
}

function updateShiftTime(
  groupIdx: number,
  dayIdx: number,
  shiftIdx: number,
  field: "startTime" | "endTime",
  val: unknown,
) {
  const days = deepCopyDays(groupDays.value[groupIdx]);
  days[dayIdx].shifts[shiftIdx][field] = String(val ?? "");
  updateGroupSchedule(groupIdx, days);
}

function addShift(groupIdx: number, dayIdx: number) {
  const days = deepCopyDays(groupDays.value[groupIdx]);
  const last = days[dayIdx].shifts.at(-1);
  const newStart = last?.endTime || "09:00";
  days[dayIdx].shifts.push({
    startTime: newStart,
    endTime: addTimeHours(newStart, 8),
  });
  updateGroupSchedule(groupIdx, days);
}

function removeShift(groupIdx: number, dayIdx: number, shiftIdx: number) {
  const days = deepCopyDays(groupDays.value[groupIdx]);
  days[dayIdx].shifts.splice(shiftIdx, 1);
  if (days[dayIdx].shifts.length === 0) days[dayIdx].open = false;
  updateGroupSchedule(groupIdx, days);
}

// ── Schedule summary ──────────────────────────────────────────

function getScheduleSummary(days: DaySchedule[]): string {
  const openDays = days.filter((d) => d.open);
  if (openDays.length === 0) return "Closed all week";

  const weekdays: Day[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];
  const openNames = openDays.map((d) => d.day);

  let dayText: string;
  if (openNames.length === 7) dayText = "Every day";
  else if (
    weekdays.every((d) => openNames.includes(d)) &&
    openNames.length === 5
  )
    dayText = "Mon–Fri";
  else if (openNames.length === 1) dayText = DAY_META[openNames[0]].label;
  else dayText = `${openNames.length} days`;

  const timeSignatures = new Set(
    openDays.map((d) =>
      d.shifts.map((s) => `${s.startTime}–${s.endTime}`).join(", "),
    ),
  );
  const timeText =
    timeSignatures.size === 1 ? [...timeSignatures][0] : "Multiple shifts";

  return `${dayText} · ${timeText}`;
}

// ── Avatar ────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#4a3aff",
  "#059669",
  "#dc2626",
  "#d97706",
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#be185d",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Bulk apply ────────────────────────────────────────────────

const showCustomBulk = ref(false);
const bulkDays = ref<DaySchedule[]>(
  ALL_DAYS.map((day) => ({ day, open: false, shifts: [] })),
);

type BulkPreset = "weekdays-9-5" | "weekdays-8-6" | "all-9-5" | "clear";

interface BulkPresetConfig {
  id: BulkPreset;
  label: string;
  icon: string;
  description: string;
}

const BULK_PRESETS: BulkPresetConfig[] = [
  {
    id: "weekdays-9-5",
    label: "Mon–Fri 9–5",
    icon: "business_center",
    description: "Standard hours",
  },
  {
    id: "weekdays-8-6",
    label: "Mon–Fri 8–6",
    icon: "access_time",
    description: "Extended weekday",
  },
  {
    id: "all-9-5",
    label: "All days 9–5",
    icon: "calendar_month",
    description: "7 days a week",
  },
  {
    id: "clear",
    label: "Close all",
    icon: "block",
    description: "Set all closed",
  },
];

function buildPresetDays(preset: BulkPreset): DaySchedule[] {
  const weekdays: Day[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];
  return ALL_DAYS.map((day) => {
    if (preset === "clear") return { day, open: false, shifts: [] };
    if (preset === "all-9-5")
      return {
        day,
        open: true,
        shifts: [{ startTime: "09:00", endTime: "17:00" }],
      };
    if (preset === "weekdays-9-5")
      return weekdays.includes(day)
        ? {
            day,
            open: true,
            shifts: [{ startTime: "09:00", endTime: "17:00" }],
          }
        : { day, open: false, shifts: [] };
    if (preset === "weekdays-8-6")
      return weekdays.includes(day)
        ? {
            day,
            open: true,
            shifts: [{ startTime: "08:00", endTime: "18:00" }],
          }
        : { day, open: false, shifts: [] };
    return { day, open: false, shifts: [] };
  });
}

function openCustomBulk() {
  if (showCustomBulk.value) {
    showCustomBulk.value = false;
    return;
  }
  // Seed the custom editor from the first selected group's current schedule
  // so the user can use a preset as a starting point and tweak from there.
  const firstSelectedIdx = [...selectedGroups.value][0];
  if (firstSelectedIdx !== undefined && groupDays.value[firstSelectedIdx]) {
    bulkDays.value = deepCopyDays(groupDays.value[firstSelectedIdx]);
  } else {
    bulkDays.value = ALL_DAYS.map((day) => ({ day, open: false, shifts: [] }));
  }
  showCustomBulk.value = true;
}

function applyDaysToSelected(days: DaySchedule[]) {
  const raw = Array.isArray(value.value)
    ? [...(value.value as Record<string, unknown>[])]
    : [];
  const schedule = serializeSchedule(days);
  for (const idx of selectedGroups.value) {
    if (raw[idx])
      raw[idx] = { ...raw[idx], [config.value.scheduleKey]: schedule };
  }
  value.value = raw;
  // Keep selection active — the summary dots update immediately as feedback.
  // The user can deselect manually, try another preset, or open "Set custom hours"
  // to fine-tune from the applied preset as a starting point.
}

function applyPresetToSelected(preset: BulkPreset) {
  applyDaysToSelected(buildPresetDays(preset));
}

function applyCustomToSelected() {
  applyDaysToSelected(bulkDays.value);
}

// Bulk day editing
function toggleBulkDay(dayIdx: number) {
  const days = deepCopyDays(bulkDays.value);
  const day = days[dayIdx];
  if (day.open) {
    day.open = false;
    day.shifts = [];
  } else {
    day.open = true;
    day.shifts = [getSmartDefault(days, dayIdx)];
  }
  bulkDays.value = days;
}

function updateBulkShiftTime(
  dayIdx: number,
  shiftIdx: number,
  field: "startTime" | "endTime",
  val: unknown,
) {
  const days = deepCopyDays(bulkDays.value);
  days[dayIdx].shifts[shiftIdx][field] = String(val ?? "");
  bulkDays.value = days;
}

function addBulkShift(dayIdx: number) {
  const days = deepCopyDays(bulkDays.value);
  const last = days[dayIdx].shifts.at(-1);
  const newStart = last?.endTime || "09:00";
  days[dayIdx].shifts.push({
    startTime: newStart,
    endTime: addTimeHours(newStart, 8),
  });
  bulkDays.value = days;
}

function removeBulkShift(dayIdx: number, shiftIdx: number) {
  const days = deepCopyDays(bulkDays.value);
  days[dayIdx].shifts.splice(shiftIdx, 1);
  if (days[dayIdx].shifts.length === 0) days[dayIdx].open = false;
  bulkDays.value = days;
}

const bulkHasSchedule = computed(() => bulkDays.value.some((d) => d.open));
</script>

<template>
  <div :id="fieldId" :style="{ marginBottom: fieldGap }" class="qmgs">
    <!-- ── Header ──────────────────────────────────────────── -->
    <div v-if="(label && !hideLabel) || hint || config.timezoneLabel" class="qmgs__header">
      <div class="qmgs__label" v-if="label && !hideLabel">
        {{ label }}
        <span v-if="required" class="qmgs__required">*</span>
        <span v-if="config.timezoneLabel" class="qmgs__tz-badge">
          <QIcon name="schedule" size="11px" />
          {{ config.timezoneLabel }}
        </span>
        <QIcon
          v-if="tooltip"
          name="info"
          size="xs"
          color="grey-6"
          class="cursor-help q-ml-xs"
        >
          <QTooltip><span v-html="tooltip" /></QTooltip>
        </QIcon>
      </div>
      <div v-if="hint" class="qmgs__hint" v-html="hint" />
    </div>

    <!-- ── Empty state ─────────────────────────────────────── -->
    <div v-if="rawGroups.length === 0" class="qmgs__empty">
      <QIcon name="group_work" size="36px" color="grey-4" />
      <span>No business groups loaded yet</span>
      <span class="qmgs__empty-sub">
        Groups will appear here once prefilled from your workflow
      </span>
    </div>

    <!-- ── Group grid ──────────────────────────────────────── -->
    <div v-else class="qmgs__grid">
      <!-- Select-all row -->
      <div v-if="!disabled && !readonly" class="qmgs__select-all-row">
        <QCheckbox
          :model-value="isAllSelected"
          :indeterminate-value="isSomeSelected ? true : undefined"
          dense
          size="xs"
          color="primary"
          @update:model-value="toggleSelectAll"
        />
        <span class="qmgs__select-all-label">
          {{
            isAllSelected
              ? "Deselect all"
              : `Select all ${rawGroups.length} groups`
          }}
        </span>
      </div>

      <!-- Group rows -->
      <div
        v-for="(group, idx) in rawGroups"
        :key="group.id || idx"
        class="qmgs__group"
        :class="{
          'qmgs__group--selected': selectedGroups.has(idx),
          'qmgs__group--expanded': expandedGroups.has(idx),
        }"
      >
        <!-- Summary row -->
        <div class="qmgs__group-row">
          <!-- Checkbox -->
          <div v-if="!disabled && !readonly" class="qmgs__group-check">
            <QCheckbox
              :model-value="selectedGroups.has(idx)"
              dense
              size="xs"
              color="primary"
              @update:model-value="toggleSelectGroup(idx)"
            />
          </div>

          <!-- Avatar -->
          <div
            class="qmgs__avatar"
            :style="{ background: getAvatarColor(group.name) }"
          >
            {{ getInitials(group.name) }}
          </div>

          <!-- Group info (click to expand) -->
          <div class="qmgs__group-info" @click="toggleExpanded(idx)">
            <div class="qmgs__group-name">{{ group.name }}</div>
            <div class="qmgs__group-summary">
              <!-- Day dots: 7 circles, colored if open -->
              <div class="qmgs__day-dots">
                <span
                  v-for="daySchedule in groupDays[idx]"
                  :key="daySchedule.day"
                  class="qmgs__day-dot"
                  :class="
                    daySchedule.open
                      ? 'qmgs__day-dot--open'
                      : 'qmgs__day-dot--closed'
                  "
                >
                  <QTooltip>
                    <strong>{{ DAY_META[daySchedule.day].label }}</strong>
                    <template v-if="daySchedule.open">
                      <br />{{
                        daySchedule.shifts
                          .map((s) => `${s.startTime} – ${s.endTime}`)
                          .join(", ")
                      }}
                    </template>
                    <template v-else><br />Closed</template>
                  </QTooltip>
                </span>
              </div>
              <!-- Schedule summary text -->
              <span class="qmgs__summary-text">
                {{ getScheduleSummary(groupDays[idx]) }}
              </span>
            </div>
          </div>

          <!-- Expand button -->
          <QBtn
            v-if="!disabled && !readonly"
            flat
            round
            dense
            size="sm"
            :icon="expandedGroups.has(idx) ? 'expand_less' : 'edit_calendar'"
            color="grey-5"
            class="qmgs__expand-btn"
            @click="toggleExpanded(idx)"
          >
            <QTooltip>
              {{ expandedGroups.has(idx) ? "Collapse" : "Edit schedule" }}
            </QTooltip>
          </QBtn>
        </div>

        <!-- Inline schedule editor (accordion) -->
        <Transition name="qmgs-expand">
          <div v-if="expandedGroups.has(idx)" class="qmgs__editor">
            <div
              v-if="!disabled && !readonly && hasChanges(idx)"
              class="qmgs__editor-toolbar"
            >
              <QBtn
                flat
                dense
                no-caps
                size="xs"
                icon="history"
                label="Reset to original"
                color="grey-6"
                @click="resetGroup(idx)"
              >
                <QTooltip
                  >Restore this group's schedule to what was loaded from
                  UCCE</QTooltip
                >
              </QBtn>
            </div>
            <div
              v-for="(daySchedule, dayIdx) in groupDays[idx]"
              :key="daySchedule.day"
              class="qmgs__editor-row"
            >
              <!-- Day badge -->
              <div
                class="qmgs__day-badge"
                :class="
                  DAY_META[daySchedule.day].weekend
                    ? 'qmgs__day-badge--weekend'
                    : 'qmgs__day-badge--weekday'
                "
              >
                {{ DAY_META[daySchedule.day].abbr }}
              </div>

              <!-- Toggle pill -->
              <button
                class="qmgs__toggle"
                :class="
                  daySchedule.open
                    ? 'qmgs__toggle--open'
                    : 'qmgs__toggle--closed'
                "
                :disabled="disabled || readonly"
                @click="toggleDay(idx, dayIdx)"
              >
                <span class="qmgs__toggle-dot" />
                <span>{{ daySchedule.open ? "Open" : "Closed" }}</span>
              </button>

              <!-- Shifts -->
              <div class="qmgs__shifts">
                <template v-if="daySchedule.open">
                  <div
                    v-for="(shift, shiftIdx) in daySchedule.shifts"
                    :key="shiftIdx"
                    class="qmgs__shift"
                  >
                    <QInput
                      :model-value="shift.startTime"
                      type="time"
                      dense
                      borderless
                      class="qmgs__time-input"
                      :readonly="disabled || readonly"
                      :disable="disabled"
                      @update:model-value="
                        (v) =>
                          updateShiftTime(idx, dayIdx, shiftIdx, 'startTime', v)
                      "
                    />
                    <QIcon name="arrow_forward" size="13px" color="grey-4" />
                    <QInput
                      :model-value="shift.endTime"
                      type="time"
                      dense
                      borderless
                      class="qmgs__time-input"
                      :readonly="disabled || readonly"
                      :disable="disabled"
                      @update:model-value="
                        (v) =>
                          updateShiftTime(idx, dayIdx, shiftIdx, 'endTime', v)
                      "
                    />
                    <QBtn
                      v-if="
                        !disabled && !readonly && daySchedule.shifts.length > 1
                      "
                      flat
                      round
                      dense
                      size="xs"
                      icon="close"
                      color="grey-4"
                      class="qmgs__shift-remove"
                      @click="removeShift(idx, dayIdx, shiftIdx)"
                    />
                  </div>
                  <QBtn
                    v-if="!disabled && !readonly && config.allowMultipleShifts"
                    flat
                    dense
                    no-caps
                    size="xs"
                    icon="add"
                    label="Add shift"
                    color="primary"
                    class="qmgs__add-shift"
                    @click="addShift(idx, dayIdx)"
                  />
                </template>
                <span v-else class="qmgs__closed-label">—</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ── Bulk panel ──────────────────────────────────────── -->
    <Transition name="qmgs-bulk">
      <div
        v-if="selectedCount > 0 && !disabled && !readonly"
        class="qmgs__bulk"
      >
        <!-- Header: count + group name chips -->
        <div class="qmgs__bulk-header">
          <div class="qmgs__bulk-title">
            <QIcon name="tune" size="15px" />
            <span>
              {{ selectedCount }}
              {{ selectedCount === 1 ? "group" : "groups" }} selected
            </span>
          </div>
          <div class="qmgs__bulk-chips">
            <span
              v-for="name in selectedGroupNames"
              :key="name"
              class="qmgs__bulk-chip"
            >
              {{ name }}
            </span>
          </div>
        </div>

        <!-- Quick preset tiles -->
        <div class="qmgs__bulk-presets">
          <button
            v-for="preset in BULK_PRESETS"
            :key="preset.id"
            class="qmgs__bulk-preset"
            :class="{ 'qmgs__bulk-preset--danger': preset.id === 'clear' }"
            @click="applyPresetToSelected(preset.id)"
          >
            <QIcon :name="preset.icon" size="20px" />
            <span class="qmgs__bulk-preset-label">{{ preset.label }}</span>
            <span class="qmgs__bulk-preset-desc">{{ preset.description }}</span>
          </button>
        </div>

        <!-- Custom hours toggle + reset + deselect -->
        <div class="qmgs__bulk-footer">
          <button
            class="qmgs__bulk-custom-btn"
            :class="{ 'qmgs__bulk-custom-btn--active': showCustomBulk }"
            @click="openCustomBulk"
          >
            <QIcon
              :name="showCustomBulk ? 'expand_less' : 'edit_calendar'"
              size="14px"
            />
            {{ showCustomBulk ? "Hide custom hours" : "Set custom hours..." }}
          </button>
          <div class="qmgs__bulk-footer-right">
            <button class="qmgs__bulk-reset" @click="resetSelected">
              <QIcon name="history" size="13px" />
              Reset to original
              <QTooltip
                >Restore selected groups to their schedules as loaded from
                UCCE</QTooltip
              >
            </button>
            <button
              class="qmgs__bulk-deselect"
              @click="
                () => {
                  selectedGroups = new Set();
                  showCustomBulk = false;
                }
              "
            >
              Deselect all
            </button>
          </div>
        </div>

        <!-- Custom hours editor -->
        <Transition name="qmgs-expand">
          <div v-if="showCustomBulk" class="qmgs__bulk-editor">
            <div
              v-for="(daySchedule, dayIdx) in bulkDays"
              :key="daySchedule.day"
              class="qmgs__editor-row qmgs__editor-row--bulk"
            >
              <div class="qmgs__day-badge qmgs__day-badge--bulk">
                {{ DAY_META[daySchedule.day].abbr }}
              </div>
              <button
                class="qmgs__toggle"
                :class="
                  daySchedule.open
                    ? 'qmgs__toggle--open'
                    : 'qmgs__toggle--closed'
                "
                @click="toggleBulkDay(dayIdx)"
              >
                <span class="qmgs__toggle-dot" />
                <span>{{ daySchedule.open ? "Open" : "Closed" }}</span>
              </button>
              <div class="qmgs__shifts">
                <template v-if="daySchedule.open">
                  <div
                    v-for="(shift, shiftIdx) in daySchedule.shifts"
                    :key="shiftIdx"
                    class="qmgs__shift"
                  >
                    <QInput
                      :model-value="shift.startTime"
                      type="time"
                      dense
                      borderless
                      class="qmgs__time-input qmgs__time-input--bulk"
                      @update:model-value="
                        (v) =>
                          updateBulkShiftTime(dayIdx, shiftIdx, 'startTime', v)
                      "
                    />
                    <QIcon name="arrow_forward" size="13px" color="grey-4" />
                    <QInput
                      :model-value="shift.endTime"
                      type="time"
                      dense
                      borderless
                      class="qmgs__time-input qmgs__time-input--bulk"
                      @update:model-value="
                        (v) =>
                          updateBulkShiftTime(dayIdx, shiftIdx, 'endTime', v)
                      "
                    />
                    <QBtn
                      v-if="daySchedule.shifts.length > 1"
                      flat
                      round
                      dense
                      size="xs"
                      icon="close"
                      color="grey-5"
                      @click="removeBulkShift(dayIdx, shiftIdx)"
                    />
                  </div>
                  <QBtn
                    v-if="config.allowMultipleShifts"
                    flat
                    dense
                    no-caps
                    size="xs"
                    icon="add"
                    label="Add shift"
                    color="primary"
                    @click="addBulkShift(dayIdx)"
                  />
                </template>
                <span
                  v-else
                  class="qmgs__closed-label qmgs__closed-label--bulk"
                >
                  —
                </span>
              </div>
            </div>

            <div class="qmgs__bulk-apply-row">
              <button
                class="qmgs__bulk-apply"
                :disabled="!bulkHasSchedule"
                @click="applyCustomToSelected"
              >
                Apply to {{ selectedCount }}
                {{ selectedCount === 1 ? "group" : "groups" }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ── Error ───────────────────────────────────────────── -->
    <div v-if="errorMessage" class="qmgs__error">{{ errorMessage }}</div>
  </div>
</template>

<style scoped>
/* ── Container ───────────────────────────────────────────────── */
.qmgs {
  font-family: inherit;
}

/* ── Header ──────────────────────────────────────────────────── */
.qmgs__header {
  margin-bottom: 10px;
}

/* Timezone badge */
.qmgs__tz-badge {
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
  flex-shrink: 0;
}

.qmgs__label {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  display: flex;
  align-items: center;
  gap: 4px;
}

.qmgs__required {
  color: #c10015;
}

.qmgs__hint {
  font-size: 12px;
  color: #757575;
  margin-top: 3px;
}

/* ── Empty state ─────────────────────────────────────────────── */
.qmgs__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 40px 20px;
  border: 1px dashed #e0e0e0;
  border-radius: 10px;
  color: #9e9e9e;
  font-size: 13px;
  text-align: center;
}

.qmgs__empty-sub {
  font-size: 11.5px;
  color: #bdbdbd;
}

/* ── Group grid ──────────────────────────────────────────────── */
.qmgs__grid {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

/* Select-all row */
.qmgs__select-all-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: #f7f8fc;
  border-bottom: 1px solid #eeeeee;
}

.qmgs__select-all-label {
  font-size: 11.5px;
  font-weight: 500;
  color: #9e9e9e;
}

/* ── Group container ─────────────────────────────────────────── */
.qmgs__group {
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  transition: background 0.12s ease;
}

.qmgs__group:last-child {
  border-bottom: none;
}

.qmgs__group--selected {
  background: #f3f1ff;
}

.qmgs__group--selected::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--qws-selection-accent, #4338ca);
  border-radius: 0;
}

/* Summary row */
.qmgs__group-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 10px 14px;
  transition: background 0.1s;
}

.qmgs__group-row:hover {
  background: rgba(0, 0, 0, 0.016);
}

.qmgs__group--selected .qmgs__group-row:hover {
  background: rgba(74, 58, 255, 0.04);
}

/* Checkbox */
.qmgs__group-check {
  flex: 0 0 20px;
}

/* Avatar */
.qmgs__avatar {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.03em;
  flex-shrink: 0;
  user-select: none;
}

/* Group info */
.qmgs__group-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.qmgs__group-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.qmgs__group-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Day dots */
.qmgs__day-dots {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.qmgs__day-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  cursor: help;
  transition: transform 0.12s ease;
  flex-shrink: 0;
}

.qmgs__day-dot:hover {
  transform: scale(1.4);
}

.qmgs__day-dot--open {
  background: var(--qws-selection-accent, #4338ca);
}

.qmgs__day-dot--closed {
  background: #e0e0e0;
}

.qmgs__summary-text {
  font-size: 11.5px;
  color: #757575;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Expand button */
.qmgs__expand-btn {
  flex-shrink: 0;
  opacity: 0.35;
  transition: opacity 0.15s;
}

.qmgs__group-row:hover .qmgs__expand-btn {
  opacity: 1;
}

.qmgs__group--expanded .qmgs__expand-btn {
  opacity: 0.7;
}

/* ── Inline schedule editor ──────────────────────────────────── */
.qmgs__editor-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 2px 0 6px;
  border-bottom: 1px solid #efefef;
  margin-bottom: 2px;
}

.qmgs__editor {
  /* indent: check (20) + gap (10) + avatar (34) + gap (10) = 74px */
  padding: 6px 14px 10px 74px;
  background: #f9fafb;
  border-top: 1px solid #efefef;
}

.qmgs__editor-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.qmgs__editor-row:last-child {
  border-bottom: none;
}

/* Day badge */
.qmgs__day-badge {
  flex: 0 0 36px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-top: 3px;
  user-select: none;
}

.qmgs__day-badge--weekday {
  background: #e8eaf6;
  color: #283593;
}

.qmgs__day-badge--weekend {
  background: #f3e5f5;
  color: #6a1b9a;
}

.qmgs__day-badge--bulk {
  background: #e8eaf6;
  color: #283593;
}

/* Toggle pill */
.qmgs__toggle {
  flex: 0 0 76px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px 4px 7px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 600;
  font-family: inherit;
  transition: background 0.18s;
  margin-top: 2px;
  outline: none;
}

.qmgs__toggle:disabled {
  cursor: default;
  opacity: 0.65;
}

.qmgs__toggle--open {
  background: #e8f5e9;
  color: #1b5e20;
}

.qmgs__toggle--open:not(:disabled):hover {
  background: #c8e6c9;
}

.qmgs__toggle--closed {
  background: #f5f5f5;
  color: #757575;
}

.qmgs__toggle--closed:not(:disabled):hover {
  background: #eeeeee;
  color: #424242;
}

.qmgs__toggle-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.qmgs__toggle--open .qmgs__toggle-dot {
  background: #43a047;
}

.qmgs__toggle--closed .qmgs__toggle-dot {
  background: #bdbdbd;
}

/* Shifts */
.qmgs__shifts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.qmgs__shift {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Time input */
.qmgs__time-input {
  width: 108px;
  flex-shrink: 0;
}

.qmgs__time-input :deep(.q-field__control) {
  background: #f3f4f6;
  border-radius: 5px;
  border: 1px solid #e5e7eb;
  min-height: 28px;
  height: 28px;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.qmgs__time-input :deep(.q-field__control:hover) {
  border-color: #a5b4fc;
  background: white;
}

.qmgs__time-input :deep(.q-field__control:focus-within) {
  border-color: var(--qws-selection-accent, #4338ca);
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
}

.qmgs__time-input :deep(.q-field__native) {
  padding: 0 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: #111827;
  min-height: 28px;
  height: 28px;
}

/* --bulk time inputs inherit the base light styles */

/* Shift remove (hover-reveal) */
.qmgs__shift-remove {
  opacity: 0;
  transition: opacity 0.15s;
}

.qmgs__shift:hover .qmgs__shift-remove {
  opacity: 1;
}

/* Add shift (hover-reveal) */
.qmgs__add-shift {
  align-self: flex-start;
  opacity: 0;
  transition: opacity 0.15s;
}

.qmgs__editor-row:hover .qmgs__add-shift {
  opacity: 1;
}

/* Closed label */
.qmgs__closed-label {
  font-size: 12px;
  color: #c0c0c0;
  font-style: italic;
  padding-top: 5px;
}

/* --bulk closed label inherits the base light style */

/* ── Bulk panel ───────────────────────────────────────────────── */
.qmgs__bulk {
  margin-top: 10px;
  background: #f7f8fc;
  border: 1px solid #e4e2f8;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Bulk header */
.qmgs__bulk-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.qmgs__bulk-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
}

.qmgs__bulk-chips {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.qmgs__bulk-chip {
  background: #e8e5ff;
  color: #4338ca;
  border-radius: 20px;
  padding: 2px 9px;
  font-size: 11.5px;
  font-weight: 500;
}

/* Preset tiles */
.qmgs__bulk-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.qmgs__bulk-preset {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 8px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  color: #1a1a2e;
  font-family: inherit;
  transition: all 0.15s ease;
  text-align: center;
}

.qmgs__bulk-preset:hover {
  background: #f0eeff;
  border-color: #c7c0f5;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.qmgs__bulk-preset--danger {
  border-color: rgba(220, 38, 38, 0.2);
  background: rgba(220, 38, 38, 0.04);
  color: #991b1b;
}

.qmgs__bulk-preset--danger:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.35);
}

.qmgs__bulk-preset-label {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.qmgs__bulk-preset-desc {
  font-size: 10px;
  color: #9ca3af;
  white-space: nowrap;
}

/* Footer row */
.qmgs__bulk-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.qmgs__bulk-footer-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qmgs__bulk-reset {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  padding: 5px 8px;
  border-radius: 6px;
  transition: color 0.15s;
}

.qmgs__bulk-reset:hover {
  color: #374151;
}

.qmgs__bulk-custom-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 5px 12px;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.qmgs__bulk-custom-btn:hover {
  background: #f3f4f6;
  color: #111827;
  border-color: #9ca3af;
}

.qmgs__bulk-custom-btn--active {
  background: #ede9fe;
  color: #4338ca;
  border-color: #c4b5fd;
}

.qmgs__bulk-deselect {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  padding: 5px 8px;
  border-radius: 6px;
  transition: color 0.15s;
}

.qmgs__bulk-deselect:hover {
  color: #374151;
}

/* Custom hours editor (inside bulk panel) */
.qmgs__bulk-editor {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e2f8;
}

.qmgs__editor-row--bulk {
  border-bottom-color: #f0f0f0;
}

.qmgs__bulk-apply-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.qmgs__bulk-apply {
  background: var(--qws-selection-accent, #4338ca);
  color: #ffffff;
  border: none;
  border-radius: 7px;
  padding: 7px 20px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.qmgs__bulk-apply:hover:not(:disabled) {
  background: #3730a3;
}

.qmgs__bulk-apply:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ── Transitions ─────────────────────────────────────────────── */
.qmgs-bulk-enter-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.qmgs-bulk-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.6, 1);
}

.qmgs-bulk-enter-from,
.qmgs-bulk-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.qmgs-expand-enter-active {
  transition: opacity 0.18s ease;
  overflow: hidden;
}

.qmgs-expand-leave-active {
  transition: opacity 0.14s ease;
  overflow: hidden;
}

.qmgs-expand-enter-from,
.qmgs-expand-leave-to {
  opacity: 0;
}

/* ── Error ───────────────────────────────────────────────────── */
.qmgs__error {
  color: #c10015;
  font-size: 12px;
  margin-top: 4px;
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 600px) {
  .qmgs__bulk-presets {
    grid-template-columns: repeat(2, 1fr);
  }

  .qmgs__editor {
    padding-left: 14px;
  }
}
</style>
