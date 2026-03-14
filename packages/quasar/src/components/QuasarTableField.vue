<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  QTable,
  QTr,
  QTd,
  QTh,
  QCheckbox,
  QInput,
  QSelect,
  QToggle,
  QBtn,
  QIcon,
  QTooltip,
  QSeparator,
  QToolbar,
  QToolbarTitle,
  QSpace,
} from "quasar";
import type { QTableColumn } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";
import { schemaUtils } from "../schema-utils-singleton.js";
import type { XTableConfig, XTableRowAction } from "../types";

interface Props extends FieldProps {
  hideLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  hideLabel: false,
});

const emit = defineEmits<{
  (e: "row-action", payload: { action: string; index: number; row: Record<string, any> }): void;
}>();

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

// ── Table config ──────────────────────────────────────────────
const tableConfig = computed((): XTableConfig => {
  const globalDefaults = formContext?.quickformsDefaults?.table?.defaults || {};
  const schemaConfig = (props.schema as any)["x-table"] || {};
  return { ...globalDefaults, ...schemaConfig };
});

// ── Items schema ──────────────────────────────────────────────
const itemsSchema = computed(() => {
  if (Array.isArray(props.schema.items)) return props.schema.items[0];
  return props.schema.items;
});

const itemProperties = computed((): Record<string, any> => {
  const schema = itemsSchema.value;
  if (!schema || typeof schema === "boolean") return {};
  return (schema as any).properties || {};
});

// ── Array value ───────────────────────────────────────────────
const arrayValue = computed({
  get: () => (Array.isArray(value.value) ? value.value : []),
  set: (val) => (value.value = val),
});

// ── Column definitions ────────────────────────────────────────
const columns = computed((): QTableColumn[] => {
  const config = tableConfig.value;
  const props_ = itemProperties.value;
  const hidden = new Set(config.hiddenColumns || []);

  let keys = Object.keys(props_).filter((k) => !hidden.has(k));

  // Apply column ordering
  if (config.columnOrder?.length) {
    const ordered = config.columnOrder.filter((k) => keys.includes(k));
    const remaining = keys.filter((k) => !ordered.includes(k));
    keys = [...ordered, ...remaining];
  }

  const cols: QTableColumn[] = keys.map((key) => {
    const propSchema = props_[key] || {};
    const type = propSchema.type;
    return {
      name: key,
      label: config.columnLabels?.[key] || propSchema.title || humanize(key),
      field: key,
      align: type === "boolean" ? "center" : type === "number" || type === "integer" ? "right" : "left",
      sortable: true,
      style: config.columnWidths?.[key] ? `width: ${config.columnWidths[key]}` : undefined,
      headerStyle: config.columnWidths?.[key] ? `width: ${config.columnWidths[key]}` : undefined,
    } as QTableColumn;
  });

  // Actions column
  if (hasRowActions.value) {
    cols.push({
      name: "__actions",
      label: "",
      field: "__actions",
      align: "right",
      sortable: false,
      style: "width: 1%; white-space: nowrap",
    } as QTableColumn);
  }

  return cols;
});

// ── Row actions ───────────────────────────────────────────────
const resolvedRowActions = computed((): XTableRowAction[] => {
  const config = tableConfig.value;
  if (config.rowActions !== undefined) return config.rowActions;

  const actions: XTableRowAction[] = [];
  if (!config.noReorder) {
    // Reorder is handled separately in the template
  }
  if (!config.noRemove) {
    actions.push({ action: "remove", icon: "delete", color: "negative", tooltip: "Remove" });
  }
  return actions;
});

const hasRowActions = computed(() => {
  return resolvedRowActions.value.length > 0 || !tableConfig.value.noReorder;
});

// ── Add button props ──────────────────────────────────────────
const addButtonProps = computed(() => {
  const globalAdd = formContext?.quickformsDefaults?.table?.addButton || {};
  const defaults = {
    outline: true,
    color: "primary",
    icon: "add",
    label: formContext?.labels?.addItem || "Add row",
    size: "sm",
  };
  return { ...defaults, ...globalAdd };
});

// ── Selection ─────────────────────────────────────────────────
const selectedIndices = ref<Set<number>>(new Set());

const isAllSelected = computed(() => {
  return arrayValue.value.length > 0 && selectedIndices.value.size === arrayValue.value.length;
});

const isSomeSelected = computed(() => {
  return selectedIndices.value.size > 0 && selectedIndices.value.size < arrayValue.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIndices.value = new Set();
  } else {
    selectedIndices.value = new Set(arrayValue.value.map((_, i) => i));
  }
};

const toggleSelectRow = (index: number) => {
  const next = new Set(selectedIndices.value);
  if (next.has(index)) {
    next.delete(index);
  } else {
    next.add(index);
  }
  selectedIndices.value = next;
};

// Clear selection when array changes structurally
watch(
  () => arrayValue.value.length,
  () => {
    selectedIndices.value = new Set();
  }
);

// ── Bulk editing ──────────────────────────────────────────────
const bulkField = ref<string | null>(null);
const bulkValue = ref<any>(null);

const bulkFieldOptions = computed(() => {
  const allowed = tableConfig.value.bulkActions || [];
  return allowed
    .filter((key) => key in itemProperties.value)
    .map((key) => ({
      label: tableConfig.value.columnLabels?.[key] || itemProperties.value[key]?.title || humanize(key),
      value: key,
    }));
});

const bulkFieldSchema = computed(() => {
  if (!bulkField.value) return null;
  return itemProperties.value[bulkField.value] || null;
});

// Reset bulk value when field changes
watch(bulkField, () => {
  bulkValue.value = null;
});

const applyBulkEdit = () => {
  if (!bulkField.value || bulkValue.value === null) return;
  const newArray = [...arrayValue.value];
  for (const idx of selectedIndices.value) {
    newArray[idx] = { ...newArray[idx], [bulkField.value]: bulkValue.value };
  }
  value.value = newArray;
  selectedIndices.value = new Set();
  bulkField.value = null;
  bulkValue.value = null;
};

// ── Cell editing ──────────────────────────────────────────────
const updateCellValue = (rowIndex: number, field: string, newValue: any) => {
  const newArray = [...arrayValue.value];
  newArray[rowIndex] = { ...newArray[rowIndex], [field]: newValue };
  value.value = newArray;
};

// ── Row CRUD ──────────────────────────────────────────────────
const addRow = () => {
  if (!itemsSchema.value) return;
  const defaultValue = schemaUtils.getDefaultValue(itemsSchema.value);
  value.value = [...arrayValue.value, defaultValue];
};

const removeRow = (index: number) => {
  const newArray = [...arrayValue.value];
  newArray.splice(index, 1);
  value.value = newArray;
  // Adjust selection
  const next = new Set<number>();
  for (const idx of selectedIndices.value) {
    if (idx < index) next.add(idx);
    else if (idx > index) next.add(idx - 1);
    // idx === index is removed
  }
  selectedIndices.value = next;
};

const duplicateRow = (index: number) => {
  const newArray = [...arrayValue.value];
  const clone = JSON.parse(JSON.stringify(newArray[index]));
  newArray.splice(index + 1, 0, clone);
  value.value = newArray;
};

const moveRow = (index: number, direction: "up" | "down") => {
  if (direction === "up" && index === 0) return;
  if (direction === "down" && index === arrayValue.value.length - 1) return;
  const newArray = [...arrayValue.value];
  const target = direction === "up" ? index - 1 : index + 1;
  const temp = newArray[index];
  newArray[index] = newArray[target];
  newArray[target] = temp;
  value.value = newArray;
};

const handleRowAction = (action: XTableRowAction, index: number) => {
  const row = arrayValue.value[index];
  switch (action.action) {
    case "remove":
      removeRow(index);
      break;
    case "duplicate":
      duplicateRow(index);
      break;
    default:
      emit("row-action", { action: action.action, index, row });
  }
};

const shouldShowAction = (action: XTableRowAction, row: Record<string, any>): boolean => {
  if (!action.showWhen) return true;
  return !!row[action.showWhen];
};

// ── Constraints ───────────────────────────────────────────────
const canAdd = computed(() => {
  if (props.disabled || props.readonly) return false;
  if (props.schema.maxItems && arrayValue.value.length >= props.schema.maxItems) return false;
  return true;
});

const canRemove = computed(() => {
  if (props.disabled || props.readonly) return false;
  if (props.schema.minItems && arrayValue.value.length <= props.schema.minItems) return false;
  return true;
});

// ── Cell type helpers ─────────────────────────────────────────
const isReadOnly = (key: string): boolean => {
  const schema = itemProperties.value[key];
  return schema?.readOnly === true || schema?.['x-readonly'] === true;
};

const getPropertyType = (key: string): string => {
  const schema = itemProperties.value[key];
  if (!schema) return "string";
  if (schema.enum) return "enum";
  if (schema.format === "date" || schema.format === "date-time") return schema.format;
  if (schema.format === "time") return "time";
  if (schema.type === "boolean") return "boolean";
  if (schema.type === "number" || schema.type === "integer") return "number";
  return "string";
};

const getEnumOptions = (key: string) => {
  const schema = itemProperties.value[key];
  if (!schema?.enum) return [];
  const labels = schema["x-enum-labels"] || {};
  return schema.enum.map((val: any) => ({
    label: labels[val] || String(val),
    value: val,
  }));
};

// ── Pagination ────────────────────────────────────────────────
const paginationModel = ref({
  page: 1,
  rowsPerPage: tableConfig.value.pagination?.rowsPerPage ?? 0,
  sortBy: null as string | null,
  descending: false,
});

const hasPagination = computed(() => {
  return (tableConfig.value.pagination?.rowsPerPage ?? 0) > 0;
});

// ── Utilities ─────────────────────────────────────────────────
function formatCellValue(_key: string, val: any): string {
  if (val === null || val === undefined) return "";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
</script>

<template>
  <div :id="fieldId" :style="{ marginBottom: fieldGap }" class="quickform-table-field">
    <!-- Header -->
    <div class="quickform-table-header" v-if="label && !hideLabel">
      <div class="quickform-table-label-row">
        <div class="quickform-table-label">
          {{ label }}
          <span v-if="required" class="quickform-required-indicator">*</span>
          <QIcon v-if="tooltip" name="info" size="xs" color="grey-6" class="cursor-help q-ml-xs">
            <QTooltip><span v-html="tooltip"></span></QTooltip>
          </QIcon>
        </div>
        <div class="quickform-table-header-actions">
          <QBtn
            v-if="!tableConfig.noAdd && !disabled && !readonly"
            v-bind="addButtonProps"
            :disable="!canAdd"
            @click="addRow"
          />
        </div>
      </div>
      <div v-if="hint" class="quickform-table-hint" v-html="hint"></div>
    </div>

    <!-- Bulk actions toolbar -->
    <div
      v-if="tableConfig.selectable && selectedIndices.size > 0 && bulkFieldOptions.length > 0"
      class="quickform-table-bulk-toolbar"
    >
      <span class="quickform-table-bulk-count">
        {{ selectedIndices.size }} of {{ arrayValue.length }} selected
      </span>
      <QSelect
        v-model="bulkField"
        :options="bulkFieldOptions"
        emit-value
        map-options
        dense
        outlined
        placeholder="Select field..."
        class="quickform-table-bulk-select"
      />
      <template v-if="bulkFieldSchema">
        <!-- Boolean bulk editor -->
        <QToggle
          v-if="getPropertyType(bulkField!) === 'boolean'"
          v-model="bulkValue"
          dense
          :label="bulkValue ? 'Yes' : 'No'"
        />
        <!-- Enum bulk editor -->
        <QSelect
          v-else-if="getPropertyType(bulkField!) === 'enum'"
          v-model="bulkValue"
          :options="getEnumOptions(bulkField!)"
          emit-value
          map-options
          dense
          outlined
          class="quickform-table-bulk-input"
        />
        <!-- Number bulk editor -->
        <QInput
          v-else-if="getPropertyType(bulkField!) === 'number'"
          v-model.number="bulkValue"
          type="number"
          dense
          outlined
          class="quickform-table-bulk-input"
        />
        <!-- Time bulk editor -->
        <QInput
          v-else-if="getPropertyType(bulkField!) === 'time'"
          v-model="bulkValue"
          type="time"
          dense
          outlined
          class="quickform-table-bulk-input"
        />
        <!-- Date bulk editor -->
        <QInput
          v-else-if="getPropertyType(bulkField!) === 'date'"
          v-model="bulkValue"
          type="date"
          dense
          outlined
          class="quickform-table-bulk-input"
        />
        <!-- String bulk editor (default) -->
        <QInput
          v-else
          v-model="bulkValue"
          dense
          outlined
          class="quickform-table-bulk-input"
        />
      </template>
      <QBtn
        dense
        color="primary"
        label="Apply"
        :disable="!bulkField || bulkValue === null"
        @click="applyBulkEdit"
        size="sm"
      />
      <QBtn
        dense
        flat
        label="Clear"
        @click="selectedIndices = new Set(); bulkField = null; bulkValue = null"
        size="sm"
      />
    </div>

    <!-- Table -->
    <QTable
      :rows="arrayValue"
      :columns="columns"
      row-key="__index"
      :dense="tableConfig.dense ?? true"
      :bordered="tableConfig.bordered ?? true"
      :flat="tableConfig.flat ?? true"
      :separator="tableConfig.separator ?? 'horizontal'"
      :pagination="paginationModel"
      :hide-pagination="!hasPagination"
      :rows-per-page-options="tableConfig.pagination?.rowsPerPageOptions || [0]"
      class="quickform-table"
      :class="{ 'quickform-table-readonly': readonly || disabled }"
      @update:pagination="(p: any) => paginationModel = p"
    >
      <!-- Header with select-all checkbox -->
      <template #header="headerProps">
        <QTr :props="headerProps">
          <QTh v-if="tableConfig.selectable" auto-width class="quickform-table-checkbox-col">
            <QCheckbox
              :model-value="isAllSelected"
              :indeterminate-value="isSomeSelected ? true : undefined"
              dense
              @update:model-value="toggleSelectAll"
              :disable="disabled || readonly"
            />
          </QTh>
          <QTh
            v-for="col in headerProps.cols"
            :key="col.name"
            :props="headerProps"
          >
            {{ col.label }}
          </QTh>
        </QTr>
      </template>

      <!-- Body rows -->
      <template #body="bodyProps">
        <QTr :props="bodyProps">
          <!-- Selection checkbox -->
          <QTd v-if="tableConfig.selectable" auto-width class="quickform-table-checkbox-col">
            <QCheckbox
              :model-value="selectedIndices.has(bodyProps.rowIndex)"
              dense
              @update:model-value="toggleSelectRow(bodyProps.rowIndex)"
              :disable="disabled || readonly"
            />
          </QTd>

          <!-- Data cells -->
          <QTd
            v-for="col in bodyProps.cols.filter((c: any) => c.name !== '__actions')"
            :key="col.name"
            :props="bodyProps"
          >
            <!-- Read-only cell -->
            <template v-if="isReadOnly(col.name) || disabled || readonly">
              <span class="quickform-table-cell-readonly">
                <template v-if="getPropertyType(col.name) === 'boolean'">
                  <QIcon
                    :name="bodyProps.row[col.name] ? 'check_circle' : 'cancel'"
                    :color="bodyProps.row[col.name] ? 'positive' : 'grey-4'"
                    size="xs"
                  />
                </template>
                <template v-else>
                  {{ formatCellValue(col.name, bodyProps.row[col.name]) }}
                </template>
              </span>
            </template>

            <!-- Editable cells -->
            <template v-else>
              <!-- Boolean -->
              <QToggle
                v-if="getPropertyType(col.name) === 'boolean'"
                :model-value="bodyProps.row[col.name] ?? false"
                dense
                @update:model-value="(v: boolean) => updateCellValue(bodyProps.rowIndex, col.name, v)"
              />

              <!-- Enum -->
              <QSelect
                v-else-if="getPropertyType(col.name) === 'enum'"
                :model-value="bodyProps.row[col.name]"
                :options="getEnumOptions(col.name)"
                emit-value
                map-options
                dense
                outlined
                borderless
                class="quickform-table-cell-input"
                @update:model-value="(v: any) => updateCellValue(bodyProps.rowIndex, col.name, v)"
              />

              <!-- Number -->
              <QInput
                v-else-if="getPropertyType(col.name) === 'number'"
                :model-value="bodyProps.row[col.name]"
                type="number"
                dense
                borderless
                class="quickform-table-cell-input"
                @update:model-value="(v: any) => updateCellValue(bodyProps.rowIndex, col.name, Number(v))"
              />

              <!-- Time -->
              <QInput
                v-else-if="getPropertyType(col.name) === 'time'"
                :model-value="bodyProps.row[col.name] ?? ''"
                type="time"
                dense
                borderless
                class="quickform-table-cell-input"
                @update:model-value="(v: any) => updateCellValue(bodyProps.rowIndex, col.name, v)"
              />

              <!-- Date -->
              <QInput
                v-else-if="getPropertyType(col.name) === 'date' || getPropertyType(col.name) === 'date-time'"
                :model-value="bodyProps.row[col.name] ?? ''"
                :type="getPropertyType(col.name) === 'date' ? 'date' : 'datetime-local'"
                dense
                borderless
                class="quickform-table-cell-input"
                @update:model-value="(v: any) => updateCellValue(bodyProps.rowIndex, col.name, v)"
              />

              <!-- String (default) -->
              <QInput
                v-else
                :model-value="bodyProps.row[col.name] ?? ''"
                dense
                borderless
                class="quickform-table-cell-input"
                @update:model-value="(v: any) => updateCellValue(bodyProps.rowIndex, col.name, v)"
              />
            </template>
          </QTd>

          <!-- Actions column -->
          <QTd v-if="hasRowActions" auto-width class="quickform-table-actions-col">
            <div class="quickform-table-actions-row">
              <!-- Reorder buttons -->
              <template v-if="!tableConfig.noReorder && !disabled && !readonly">
                <QBtn
                  flat round dense size="xs"
                  icon="arrow_upward"
                  :disable="bodyProps.rowIndex === 0"
                  @click="moveRow(bodyProps.rowIndex, 'up')"
                >
                  <QTooltip>Move up</QTooltip>
                </QBtn>
                <QBtn
                  flat round dense size="xs"
                  icon="arrow_downward"
                  :disable="bodyProps.rowIndex === arrayValue.length - 1"
                  @click="moveRow(bodyProps.rowIndex, 'down')"
                >
                  <QTooltip>Move down</QTooltip>
                </QBtn>
              </template>

              <!-- Row action buttons -->
              <template v-for="action in resolvedRowActions" :key="action.action">
                <QBtn
                  v-if="shouldShowAction(action, bodyProps.row)"
                  flat round dense size="xs"
                  :icon="action.icon"
                  :color="action.color"
                  :label="action.icon ? undefined : action.label"
                  :disable="action.action === 'remove' ? !canRemove : (disabled || readonly)"
                  @click="handleRowAction(action, bodyProps.rowIndex)"
                >
                  <QTooltip v-if="action.tooltip">{{ action.tooltip }}</QTooltip>
                </QBtn>
              </template>
            </div>
          </QTd>
        </QTr>
      </template>

      <!-- Empty state -->
      <template #no-data>
        <div class="quickform-table-empty">
          <QIcon name="table_rows" size="sm" color="grey-5" class="q-mr-sm" />
          No rows yet
          <QBtn
            v-if="!tableConfig.noAdd && !disabled && !readonly"
            flat dense color="primary" label="Add one" class="q-ml-sm"
            @click="addRow"
          />
        </div>
      </template>
    </QTable>

    <!-- Error -->
    <div v-if="errorMessage" class="quickform-table-error">
      {{ errorMessage }}
    </div>
  </div>
</template>


<style scoped>
.quickform-table-field {
  /* Container */
}

.quickform-table-header {
  margin-bottom: 0.5rem;
}

.quickform-table-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quickform-table-label {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.quickform-required-indicator {
  color: #c10015;
  margin-left: 0.125rem;
}

.quickform-table-hint {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.quickform-table-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Bulk toolbar */
.quickform-table-bulk-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #e3f2fd;
  border-radius: 4px 4px 0 0;
  border: 1px solid #bbdefb;
  border-bottom: none;
  flex-wrap: wrap;
}

.quickform-table-bulk-count {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1565c0;
  white-space: nowrap;
}

.quickform-table-bulk-select {
  min-width: 140px;
  max-width: 200px;
}

.quickform-table-bulk-input {
  min-width: 120px;
  max-width: 200px;
}

/* Table overrides */
.quickform-table {
  /* Remove default QTable bottom shadow */
}

.quickform-table :deep(.q-table__bottom) {
  min-height: 36px;
}

.quickform-table-checkbox-col {
  padding: 0 4px !important;
  width: 40px;
  text-align: center !important;
}

/* Inline cell editors - minimal chrome */
.quickform-table-cell-input {
  margin: -4px 0;
}

.quickform-table-cell-input :deep(.q-field__control) {
  min-height: 28px;
  height: 28px;
}

.quickform-table-cell-input :deep(.q-field__native) {
  padding: 0 4px;
  min-height: 28px;
  font-size: 0.8125rem;
}

.quickform-table-cell-input :deep(.q-field__marginal) {
  height: 28px;
}

.quickform-table-cell-readonly {
  font-size: 0.8125rem;
  color: #555;
}

/* Actions column */
.quickform-table-actions-col {
  padding: 0 4px !important;
}

.quickform-table-actions-row {
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

/* Empty state */
.quickform-table-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #999;
  font-style: italic;
}

/* Error */
.quickform-table-error {
  color: #c10015;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Readonly state */
.quickform-table-readonly {
  opacity: 0.85;
}
</style>
