<script setup lang="ts">
/**
 * QuasarJsonLogicBuilderField - Visual JSONLogic condition builder
 *
 * A user-friendly interface for building JSONLogic conditions.
 * Supports:
 * - Simple comparisons (==, !=, >, <, etc.)
 * - AND/OR grouping with nested conditions
 * - Custom value input via slots
 * - Toggle to raw JSON editor for advanced use
 */
import { computed, ref, watch } from "vue";
import { QBtn, QSelect, QInput, QIcon, QToggle, QTooltip } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";
import { useQuasarFormContext } from "../composables/useQuasarFormContext";
import {
  OPERATORS,
  type ComparisonOperator,
  type ConditionRoot,
  type ConditionItem,
  type SimpleCondition,
  type ConditionGroup,
  toJsonLogic,
  fromJsonLogic,
  createEmptyCondition,
  createEmptyGroup,
  createEmptyRoot,
  getOperatorInfo,
} from "../utils/jsonlogic";

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  readonly: false,
});

const {
  value,
  setValue,
  label,
  hint,
  errorMessage,
  required,
  fieldId,
  fieldGap,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
});

const formContext = useQuasarFormContext();
const quickformsDefaults = computed(() => formContext?.quickformsDefaults);

// Template syntax mode - when enabled, {{ }} expressions are kept as strings
// instead of being converted to { "var": ... }
// NOTE: Must be defined before the immediate watch that references it
const useTemplateSyntax = computed(() => {
  const schemaValue = (props.schema as any)["x-use-template-syntax"];
  const defaultValue =
    quickformsDefaults.value?.jsonlogicbuilder?.useTemplateSyntax;
  return schemaValue ?? defaultValue ?? false;
});

// ============================================================================
// State
// ============================================================================

// Internal condition state
const conditionRoot = ref<ConditionRoot>(createEmptyRoot());
const isAdvancedMode = ref(false);
const jsonText = ref("");
const jsonParseError = ref<string | null>(null);

// Track if we're updating internally to avoid loops
const isInternalUpdate = ref(false);

// ============================================================================
// Sync with form value
// ============================================================================

// Initialize from form value
watch(
  () => value.value,
  (newValue) => {
    if (isInternalUpdate.value) {
      isInternalUpdate.value = false;
      return;
    }

    if (newValue && typeof newValue === "object") {
      conditionRoot.value = fromJsonLogic(newValue as Record<string, unknown>, {
        useTemplateSyntax: useTemplateSyntax.value,
      });
      jsonText.value = JSON.stringify(newValue, null, 2);
    } else {
      conditionRoot.value = createEmptyRoot();
      jsonText.value = "{}";
    }
  },
  { immediate: true }
);

// Sync changes back to form
function syncToValue() {
  isInternalUpdate.value = true;
  const logic = toJsonLogic(conditionRoot.value, {
    useTemplateSyntax: useTemplateSyntax.value,
  });
  setValue(logic);
  jsonText.value = JSON.stringify(logic, null, 2);
}

// ============================================================================
// Condition management
// ============================================================================

function addCondition(parentConditions: ConditionItem[]) {
  parentConditions.push(createEmptyCondition());
  syncToValue();
}

function addGroup(parentConditions: ConditionItem[]) {
  parentConditions.push(createEmptyGroup());
  syncToValue();
}

function removeCondition(parentConditions: ConditionItem[], id: string) {
  const index = parentConditions.findIndex((c) => c.id === id);
  if (index !== -1) {
    parentConditions.splice(index, 1);
    syncToValue();
  }
}

function updateConditionLeft(condition: SimpleCondition, value: string) {
  condition.left = value;
  syncToValue();
}

function updateConditionOperator(
  condition: SimpleCondition,
  operator: ComparisonOperator
) {
  condition.operator = operator;
  syncToValue();
}

function updateConditionRight(condition: SimpleCondition, value: string) {
  condition.right = value;
  syncToValue();
}

function updateGroupLogic(
  group: ConditionGroup | ConditionRoot,
  logic: "and" | "or"
) {
  group.logic = logic;
  syncToValue();
}

// ============================================================================
// Advanced mode (raw JSON)
// ============================================================================

function toggleAdvancedMode() {
  if (isAdvancedMode.value) {
    // Switching from advanced to visual
    try {
      const parsed = JSON.parse(jsonText.value);
      conditionRoot.value = fromJsonLogic(parsed, {
        useTemplateSyntax: useTemplateSyntax.value,
      });
      jsonParseError.value = null;
      isAdvancedMode.value = false;
    } catch (err: any) {
      jsonParseError.value =
        "Invalid JSON. Fix errors before switching to visual mode.";
    }
  } else {
    // Switching from visual to advanced
    jsonText.value = JSON.stringify(
      toJsonLogic(conditionRoot.value, { useTemplateSyntax: useTemplateSyntax.value }),
      null,
      2
    );
    isAdvancedMode.value = true;
  }
}

function handleJsonChange(newJson: string) {
  jsonText.value = newJson;
  try {
    const parsed = JSON.parse(newJson);
    jsonParseError.value = null;
    isInternalUpdate.value = true;
    setValue(parsed);
  } catch (err: any) {
    jsonParseError.value = err.message;
  }
}

// ============================================================================
// Operator options and display
// ============================================================================

// Get configuration from schema or defaults
const operatorDisplayMode = computed(() => {
  const schemaMode = (props.schema as any)["x-operator-display"];
  const defaultMode =
    quickformsDefaults.value?.jsonlogicbuilder?.operatorDisplayMode;
  return schemaMode || defaultMode || "short";
});

// Placeholder text for inputs - configurable via schema or defaults
const leftPlaceholder = computed(() => {
  const schemaValue = (props.schema as any)["x-left-placeholder"];
  const defaultValue =
    quickformsDefaults.value?.jsonlogicbuilder?.leftPlaceholder;
  return schemaValue ?? defaultValue ?? "Value or path";
});

const rightPlaceholder = computed(() => {
  const schemaValue = (props.schema as any)["x-right-placeholder"];
  const defaultValue =
    quickformsDefaults.value?.jsonlogicbuilder?.rightPlaceholder;
  return schemaValue ?? defaultValue ?? "Value";
});

const allowedOperators = computed(() => {
  const schemaOperators = (props.schema as any)["x-allowed-operators"];
  const defaultOperators =
    quickformsDefaults.value?.jsonlogicbuilder?.allowedOperators;
  return schemaOperators || defaultOperators || null;
});

// Filter and format operators based on settings
const operatorOptions = computed(() => {
  let operators = OPERATORS;

  // Filter operators if allowedOperators is set
  if (allowedOperators.value) {
    operators = operators.filter((op) =>
      allowedOperators.value.includes(op.value)
    );
  }

  // Format labels based on display mode
  return operators.map((op) => {
    const mode = operatorDisplayMode.value;
    let displayLabel = "";

    switch (mode) {
      case "icon":
        // Icon mode - will render via slot, use short label as fallback
        displayLabel = op.shortLabel || op.symbol || op.label;
        break;
      case "symbol":
        // Symbol only (default)
        displayLabel = op.symbol || op.label;
        break;
      case "short":
        // Short text labels
        displayLabel = op.shortLabel || op.label;
        break;
      case "verbose":
        // Full label with symbol prefix
        displayLabel = op.symbol ? `${op.symbol} ${op.label}` : op.label;
        break;
      default:
        displayLabel = op.symbol || op.label;
    }

    return {
      value: op.value,
      label: displayLabel,
      icon: op.icon,
      description: op.description,
      // Store searchTerms for custom filter function
      searchTerms: op.searchTerms || [],
    };
  });
});

// Filtered operator options for autocomplete
const filteredOperatorOptions = ref(operatorOptions.value);

// Watch operatorOptions to update filtered list when config changes
watch(operatorOptions, (newOptions) => {
  filteredOperatorOptions.value = newOptions;
});

// Custom filter function for operator search that checks searchTerms
function filterOperators(val: string, update: (fn: () => void) => void) {
  if (val === "") {
    update(() => {
      filteredOperatorOptions.value = operatorOptions.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredOperatorOptions.value = operatorOptions.value.filter((opt) => {
      // Check label
      if (opt.label.toLowerCase().includes(needle)) {
        return true;
      }

      // Check searchTerms
      if (opt.searchTerms && Array.isArray(opt.searchTerms)) {
        return opt.searchTerms.some((term: string) =>
          term.toLowerCase().includes(needle)
        );
      }

      return false;
    });
  });
}

// Handle keyboard input for auto-selecting first option
function handleOperatorInput(condition: SimpleCondition, val: string | null) {
  // If user typed something and pressed Enter, select first filtered option
  if (
    val &&
    typeof val === "string" &&
    filteredOperatorOptions.value.length > 0
  ) {
    // Check if val is not already a valid operator value
    const isValidOperator = operatorOptions.value.some(
      (opt) => opt.value === val
    );
    if (!isValidOperator) {
      // Auto-select first filtered option
      updateConditionOperator(
        condition,
        filteredOperatorOptions.value[0].value
      );
      return;
    }
  }
  // Otherwise treat as normal update
  if (val) {
    updateConditionOperator(condition, val as ComparisonOperator);
  }
}
</script>

<template>
  <div class="quickform-jsonlogic-builder" :style="{ marginBottom: fieldGap }">
    <!-- Header with label and mode toggle -->
    <div class="builder-header">
      <div v-if="label" class="builder-label">
        {{ label }}
        <span v-if="required" class="text-negative q-ml-xs">*</span>
      </div>
      <div class="builder-actions">
        <QBtn
          flat
          dense
          size="sm"
          :icon="isAdvancedMode ? 'visibility' : 'code'"
          :color="isAdvancedMode ? 'primary' : 'grey-7'"
          @click="toggleAdvancedMode"
        >
          <QTooltip>{{
            isAdvancedMode ? "Visual mode" : "Advanced (JSON)"
          }}</QTooltip>
        </QBtn>
      </div>
    </div>

    <!-- Hint -->
    <div v-if="hint" class="builder-hint text-caption text-grey-7 q-mb-sm">
      {{ hint }}
    </div>

    <!-- Visual Builder Mode -->
    <div v-if="!isAdvancedMode" class="builder-visual">
      <!-- Root logic toggle -->
      <div class="logic-toggle q-mb-sm">
        <span class="text-caption text-grey-7 q-mr-sm">Match</span>
        <QBtn
          :flat="conditionRoot.logic !== 'and'"
          :outline="conditionRoot.logic === 'and'"
          dense
          size="sm"
          color="primary"
          label="ALL"
          class="q-mr-xs"
          @click="updateGroupLogic(conditionRoot, 'and')"
        />
        <QBtn
          :flat="conditionRoot.logic !== 'or'"
          :outline="conditionRoot.logic === 'or'"
          dense
          size="sm"
          color="primary"
          label="ANY"
          @click="updateGroupLogic(conditionRoot, 'or')"
        />
        <span class="text-caption text-grey-7 q-ml-sm"
          >of these conditions</span
        >
      </div>

      <!-- Conditions list -->
      <div class="conditions-container">
        <template
          v-for="(item, index) in conditionRoot.conditions"
          :key="item.id"
        >
          <!-- Simple condition row -->
          <div v-if="item.type === 'condition'" class="condition-row">
            <div class="condition-inputs">
            <!-- Left value (slot or default input) -->
              <slot
                name="left-input"
                :value="item.left"
                :on-change="(v: string) => updateConditionLeft(item, v)"
                :disabled="disabled"
                :readonly="readonly"
                :placeholder="leftPlaceholder"
              >
                <QInput
                  :model-value="item.left"
                  :placeholder="leftPlaceholder"
                  dense
                  outlined
                  class="condition-input"
                  :disable="disabled"
                  :readonly="readonly"
                  @update:model-value="
                    (v) => updateConditionLeft(item, String(v ?? ''))
                  "
                />
              </slot>

              <!-- Operator select -->
              <QSelect
                :model-value="item.operator"
                :options="filteredOperatorOptions"
                emit-value
                map-options
                dense
                outlined
                use-input
                input-debounce="0"
                fill-input
                hide-selected
                clearable
                hide-dropdown-icon
                new-value-mode="add-unique"
                class="condition-operator"
                :disable="disabled"
                :readonly="readonly"
                @filter="filterOperators"
                @update:model-value="(v) => handleOperatorInput(item, v)"
              >
                <template v-if="operatorDisplayMode === 'icon'" #selected>
                  <div class="row items-center no-wrap q-gutter-xs">
                    <QIcon
                      :name="
                        operatorOptions.find((op) => op.value === item.operator)
                          ?.icon || 'help'
                      "
                      size="xs"
                    />
                    <span class="text-caption">{{
                      operatorOptions.find((op) => op.value === item.operator)
                        ?.label
                    }}</span>
                  </div>
                </template>
                <template v-if="operatorDisplayMode === 'icon'" #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <QIcon :name="scope.opt.icon || 'help'" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label v-if="scope.opt.description" caption>{{
                        scope.opt.description
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </QSelect>

              <!-- Right value (conditional based on operator) -->
              <template v-if="getOperatorInfo(item.operator)?.rightRequired">
                <slot
                  name="right-input"
                  :value="item.right"
                  :on-change="(v: string) => updateConditionRight(item, v)"
                  :disabled="disabled"
                  :readonly="readonly"
                  :placeholder="rightPlaceholder"
                  :operator="item.operator"
                >
                  <QInput
                    :model-value="item.right"
                    :placeholder="rightPlaceholder"
                    dense
                    outlined
                    class="condition-input"
                    :disable="disabled"
                    :readonly="readonly"
                    @update:model-value="
                      (v) => updateConditionRight(item, String(v ?? ''))
                    "
                  />
                </slot>
              </template>
              <div v-else class="condition-input-placeholder" />
            </div>

            <!-- Remove button -->
            <QBtn
              flat
              round
              dense
              icon="close"
              size="sm"
              color="grey-6"
              class="condition-remove"
              :disable="disabled || readonly"
              @click="removeCondition(conditionRoot.conditions, item.id)"
            >
              <QTooltip>Remove condition</QTooltip>
            </QBtn>
          </div>

          <!-- Nested group -->
          <div v-else-if="item.type === 'group'" class="condition-group">
            <div class="group-header">
              <div class="group-logic-toggle">
                <QBtn
                  :flat="item.logic !== 'and'"
                  :outline="item.logic === 'and'"
                  dense
                  size="xs"
                  color="secondary"
                  label="AND"
                  class="q-mr-xs"
                  @click="updateGroupLogic(item, 'and')"
                />
                <QBtn
                  :flat="item.logic !== 'or'"
                  :outline="item.logic === 'or'"
                  dense
                  size="xs"
                  color="secondary"
                  label="OR"
                  @click="updateGroupLogic(item, 'or')"
                />
              </div>
              <QBtn
                flat
                round
                dense
                icon="close"
                size="xs"
                color="grey-6"
                :disable="disabled || readonly"
                @click="removeCondition(conditionRoot.conditions, item.id)"
              >
                <QTooltip>Remove group</QTooltip>
              </QBtn>
            </div>

            <div class="group-conditions">
              <template v-for="subItem in item.conditions" :key="subItem.id">
                <div
                  v-if="subItem.type === 'condition'"
                  class="condition-row condition-row--nested"
                >
                  <div class="condition-inputs">
                    <slot
                      name="left-input"
                      :value="subItem.left"
                      :on-change="(v: string) => updateConditionLeft(subItem, v)"
                      :disabled="disabled"
                      :readonly="readonly"
                      :placeholder="leftPlaceholder"
                    >
                      <QInput
                        :model-value="subItem.left"
                        :placeholder="leftPlaceholder"
                        dense
                        outlined
                        class="condition-input"
                        :disable="disabled"
                        :readonly="readonly"
                        @update:model-value="
                          (v) => updateConditionLeft(subItem, String(v ?? ''))
                        "
                      />
                    </slot>

                    <QSelect
                      :model-value="subItem.operator"
                      :options="filteredOperatorOptions"
                      emit-value
                      map-options
                      dense
                      outlined
                      use-input
                      input-debounce="0"
                      fill-input
                      hide-selected
                      clearable
                      hide-dropdown-icon
                      new-value-mode="add-unique"
                      class="condition-operator"
                      :disable="disabled"
                      :readonly="readonly"
                      @filter="filterOperators"
                      @update:model-value="
                        (v) => handleOperatorInput(subItem, v)
                      "
                    >
                      <template v-if="operatorDisplayMode === 'icon'" #selected>
                        <div class="row items-center no-wrap q-gutter-xs">
                          <QIcon
                            :name="
                              operatorOptions.find(
                                (op) => op.value === subItem.operator
                              )?.icon || 'help'
                            "
                            size="xs"
                          />
                          <span class="text-caption">{{
                            operatorOptions.find(
                              (op) => op.value === subItem.operator
                            )?.label
                          }}</span>
                        </div>
                      </template>
                      <template
                        v-if="operatorDisplayMode === 'icon'"
                        #option="scope"
                      >
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar>
                            <QIcon :name="scope.opt.icon || 'help'" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                            <q-item-label
                              v-if="scope.opt.description"
                              caption
                              >{{ scope.opt.description }}</q-item-label
                            >
                          </q-item-section>
                        </q-item>
                      </template>
                    </QSelect>

                    <template
                      v-if="getOperatorInfo(subItem.operator)?.rightRequired"
                    >
                      <slot
                        name="right-input"
                        :value="subItem.right"
                        :on-change="(v: string) => updateConditionRight(subItem, v)"
                        :disabled="disabled"
                        :readonly="readonly"
                        :placeholder="rightPlaceholder"
                        :operator="subItem.operator"
                      >
                        <QInput
                          :model-value="subItem.right"
                          :placeholder="rightPlaceholder"
                          dense
                          outlined
                          class="condition-input"
                          :disable="disabled"
                          :readonly="readonly"
                          @update:model-value="
                            (v) =>
                              updateConditionRight(subItem, String(v ?? ''))
                          "
                        />
                      </slot>
                    </template>
                    <div v-else class="condition-input-placeholder" />
                  </div>

                  <QBtn
                    flat
                    round
                    dense
                    icon="close"
                    size="sm"
                    color="grey-6"
                    class="condition-remove"
                    :disable="disabled || readonly"
                    @click="removeCondition(item.conditions, subItem.id)"
                  >
                    <QTooltip>Remove condition</QTooltip>
                  </QBtn>
                </div>
              </template>

              <!-- Add condition to group -->
              <div class="group-actions">
                <QBtn
                  flat
                  dense
                  size="sm"
                  icon="add"
                  label="Add condition"
                  color="secondary"
                  :disable="disabled || readonly"
                  @click="addCondition(item.conditions)"
                />
              </div>
            </div>
          </div>

          <!-- Logic connector between conditions -->
          <div
            v-if="index < conditionRoot.conditions.length - 1"
            class="logic-connector"
          >
            <span class="logic-connector-text">{{
              conditionRoot.logic.toUpperCase()
            }}</span>
          </div>
        </template>
      </div>

      <!-- Add buttons -->
      <div class="builder-actions-bottom q-mt-sm">
        <QBtn
          flat
          dense
          size="sm"
          icon="add"
          label="Add condition"
          color="primary"
          :disable="disabled || readonly"
          @click="addCondition(conditionRoot.conditions)"
        />
        <QBtn
          flat
          dense
          size="sm"
          icon="account_tree"
          label="Add group"
          color="grey-7"
          class="q-ml-sm"
          :disable="disabled || readonly"
          @click="addGroup(conditionRoot.conditions)"
        >
          <QTooltip>Add nested AND/OR group</QTooltip>
        </QBtn>
      </div>
    </div>

    <!-- Advanced JSON Mode -->
    <div v-else class="builder-advanced">
      <QInput
        :model-value="jsonText"
        type="textarea"
        :rows="8"
        outlined
        dense
        class="json-editor"
        input-class="json-textarea"
        placeholder="{}"
        :error="!!jsonParseError"
        :error-message="jsonParseError || undefined"
        :disable="disabled"
        :readonly="readonly"
        @update:model-value="(v) => handleJsonChange(String(v ?? ''))"
      />
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="text-negative text-caption q-mt-xs">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.quickform-jsonlogic-builder {
  width: 100%;
}

.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.builder-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.builder-visual {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
}

.logic-toggle {
  display: flex;
  align-items: center;
}

.conditions-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
}

.condition-row--nested {
  background: rgba(0, 0, 0, 0.02);
}

.condition-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.condition-input {
  flex: 1;
  min-width: 120px;
}

.condition-input-placeholder {
  flex: 1;
  min-width: 120px;
}

.condition-operator {
  width: 160px;
  flex-shrink: 0;
}

/* Hide clear icon but keep clearable functionality */
.condition-operator :deep(.q-field__append) {
  display: none;
}

.condition-remove {
  opacity: 0.5;
  transition: opacity 0.15s;
}

.condition-row:hover .condition-remove {
  opacity: 1;
}

.condition-group {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.group-conditions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-actions {
  margin-top: 4px;
}

.logic-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}

.logic-connector-text {
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.builder-actions-bottom {
  display: flex;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.builder-advanced .json-editor :deep(.json-textarea) {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>
