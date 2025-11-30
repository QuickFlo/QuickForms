<script setup lang="ts">
/**
 * QuasarTagsField - Chips/tags input for arrays of free-form strings
 *
 * A polished tags input that allows users to enter multiple values as chips.
 * Supports typing, pasting multiple values, and full Quasar customization.
 *
 * ## Usage
 * Use with `x-render: 'tags'` on array-of-strings schemas:
 *
 * ```ts
 * z.array(z.string().email()).describe(describeSchema({
 *   title: 'Recipients',
 *   description: 'Email addresses to send to',
 *   'x-render': 'tags',
 *   'x-placeholder': 'Add email addresses...',
 * }))
 * ```
 *
 * ## Customization (follows library patterns)
 *
 * ### Native Quasar Props (QSelect)
 * Via `x-quasar-props` or `x-component-props` in schema:
 * ```ts
 * 'x-quasar-props': { outlined: false, filled: true, color: 'secondary' }
 * ```
 *
 * ### QuickForms Features
 * Via `x-quickforms-quasar` in schema or `quickformsDefaults.tags` in form options:
 * ```ts
 * 'x-quickforms-quasar': {
 *   chip: { color: 'accent', textColor: 'white', icon: 'email' },
 *   separator: /[,;\n]+/,  // Custom separator pattern for paste
 * }
 * ```
 *
 * ## Features
 * - Type and press Enter to add
 * - Paste multiple values (comma/semicolon/newline separated)
 * - Click chip X to remove
 * - Auto-detects email format for smarter placeholder
 * - Duplicate prevention
 * - Full validation integration
 */
import { computed } from "vue";
import { QSelect, QChip } from "quasar";
import type { FieldProps } from "@quickflo/quickforms-vue";
import { useQuasarFormField } from "../composables/useQuasarFormField";
import { mergeQuasarProps } from "../utils";

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
  formContext,
} = useQuasarFormField(props.path, props.schema, {
  label: props.label,
  componentType: "select",
});

// Ensure value is an array on mount
if (!Array.isArray(value.value)) {
  setValue([], false);
}

// Merge native Quasar props for QSelect (follows library pattern)
const quasarProps = computed(() => {
  const merged = mergeQuasarProps(
    props.schema,
    formContext?.componentDefaults,
    "select"
  );
  // Remove props we control internally
  const {
    useInput,
    useChips,
    multiple,
    hideDropdownIcon,
    newValueMode,
    ...quasarOnly
  } = merged;
  return quasarOnly;
});

// Merge QuickForms features (chip customization, separator, etc.)
const quickformsFeatures = computed(() => {
  const globalDefaults = (formContext?.quickformsDefaults as any)?.tags || {};
  const schemaFeatures = (props.schema as any)["x-quickforms-quasar"] || {};

  // Default chip props
  const chipDefaults = {
    removable: true,
    dense: true,
    color: "primary",
    textColor: "white",
  };

  return {
    chip: {
      ...chipDefaults,
      ...(globalDefaults.chip || {}),
      ...(schemaFeatures.chip || {}),
    },
    // Separator pattern for pasting multiple values
    separator: schemaFeatures.separator || globalDefaults.separator || /[,;\s]+/,
  };
});

// Get items schema for validation
const itemsSchema = computed(() => {
  const items = props.schema.items;
  if (!items || typeof items === "boolean") {
    return null;
  }
  return Array.isArray(items) ? items[0] : items;
});

// Detect if items should be emails based on schema
const isEmailFormat = computed(() => {
  return itemsSchema.value?.format === "email";
});

// Simple email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a single item against the items schema
 */
function validateItem(item: string): boolean {
  const schema = itemsSchema.value;
  if (!schema) {
    return true;
  }

  // Check format
  if (schema.format === "email" && !EMAIL_REGEX.test(item)) {
    return false;
  }

  // Check minLength
  if (typeof schema.minLength === "number" && item.length < schema.minLength) {
    return false;
  }

  // Check maxLength
  if (typeof schema.maxLength === "number" && item.length > schema.maxLength) {
    return false;
  }

  // Check pattern
  if (schema.pattern) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(item)) {
      return false;
    }
  }

  return true;
}

/**
 * Get chip props for an item, showing error state for invalid items
 */
function getChipProps(item: string) {
  const isValid = validateItem(item);
  const baseProps = { ...quickformsFeatures.value.chip };

  if (!isValid) {
    return {
      ...baseProps,
      color: "negative",
      textColor: "white",
      icon: "error",
    };
  }

  return baseProps;
}

// Get placeholder from schema or smart default
const placeholder = computed(() => {
  const xPlaceholder = (props.schema as any)["x-placeholder"];
  if (xPlaceholder) {
    return xPlaceholder;
  }
  if (isEmailFormat.value) {
    return "Type email and press Enter";
  }
  return "Type and press Enter to add";
});

/**
 * Parse input into individual values, handling paste of multiple items
 */
function parseInput(input: string): string[] {
  if (!input?.trim()) {
    return [];
  }

  const separator = quickformsFeatures.value.separator;
  const pattern = typeof separator === "string" 
    ? new RegExp(separator) 
    : separator;

  return input
    .split(pattern)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * Handle new value from QSelect
 */
function handleNewValue(
  val: string,
  done: (item?: any, mode?: string) => void
) {
  const parsed = parseInput(val);

  if (parsed.length === 0) {
    done();
    return;
  }

  const currentValues = Array.isArray(value.value) ? value.value : [];

  if (parsed.length === 1) {
    // Single value - let QSelect handle it normally
    const trimmed = parsed[0];
    if (!currentValues.includes(trimmed)) {
      done(trimmed, "add-unique");
    } else {
      done();
    }
  } else {
    // Multiple values (pasted) - add them all
    const uniqueNew = parsed.filter((v) => !currentValues.includes(v));
    if (uniqueNew.length > 0) {
      setValue([...currentValues, ...uniqueNew]);
    }
    done();
  }
}

/**
 * Filter function - required by QSelect but we don't filter
 */
function filterFn(_val: string, update: (fn: () => void) => void) {
  update(() => {
    // No filtering needed for tags input
  });
}

/**
 * Remove a specific value
 */
function removeValue(val: string) {
  if (props.disabled || props.readonly) {
    return;
  }
  const currentValues = Array.isArray(value.value) ? value.value : [];
  setValue(currentValues.filter((v) => v !== val));
}
</script>

<template>
  <div :style="{ marginBottom: fieldGap }" class="quickform-tags-field">
    <QSelect
      :id="fieldId"
      v-model="value"
      :label="label"
      :hint="hint"
      :error="!!errorMessage"
      :error-message="errorMessage || undefined"
      :disable="disabled"
      :readonly="readonly"
      use-input
      use-chips
      multiple
      hide-dropdown-icon
      input-debounce="0"
      new-value-mode="add-unique"
      :placeholder="value?.length ? '' : placeholder"
      v-bind="quasarProps"
      @new-value="handleNewValue"
      @filter="filterFn"
    >
      <template v-if="required" #label>
        {{ label }} <span class="text-negative">*</span>
      </template>

      <!-- Custom chip rendering with validation state -->
      <template #selected-item="scope">
        <QChip
          v-bind="getChipProps(scope.opt)"
          :tabindex="scope.tabindex"
          class="q-ma-xs"
          @remove="removeValue(scope.opt)"
        >
          {{ scope.opt }}
        </QChip>
      </template>

      <!-- No dropdown hint -->
      <template #no-option>
        <div class="q-pa-sm text-grey-6 text-caption">
          Type and press Enter to add
        </div>
      </template>
    </QSelect>
  </div>
</template>

<style scoped>
.quickform-tags-field :deep(.q-field__native) {
  min-height: 32px;
  flex-wrap: wrap;
  gap: 4px;
}

.quickform-tags-field :deep(.q-chip) {
  margin: 2px;
}
</style>
