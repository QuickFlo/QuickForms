import type { FormOptions as VueFormOptions } from "@quickflo/quickforms-vue";
import type { StyleValue } from "vue";
import type {
  QInputProps,
  QSelectProps,
  QCheckboxProps,
  QDateProps,
  QCardProps,
  QExpansionItemProps,
  QBtnProps,
} from "quasar";

/**
 * Common Vue component attributes (class and style)
 * These can be passed to any Vue component via v-bind
 */
interface VueComponentAttributes {
  class?: string | string[] | Record<string, boolean>;
  style?: StyleValue;
}

// We'll define our own base since ComponentDefaults isn't exported from Vue
interface VueComponentDefaults {
  select?: {
    autocomplete?: boolean;
    autocompleteThreshold?: number;
  };
  array?: {
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  };
  number?: {
    prefix?: string;
    suffix?: string;
  };
  hints?: {
    showMode?: "always" | "focus" | "hover";
  };
}

/**
 * QuickForms convenience features for Quasar components
 * These are NOT native Quasar props - they're convenience shortcuts we provide
 * Use via x-quickforms-quasar in schema or quickformsDefaults in form options
 */
export interface QuickFormsQuasarFeatures {
  /** Icon to display in prepend slot (left side of input) */
  prependIcon?: string;
  /** Icon to display in append slot (right side of input) */
  appendIcon?: string;
  /** Color for icons. Default: 'grey-7' */
  iconColor?: string;
  /** Size for icons. Default: 'sm' */
  iconSize?: string;
}

/**
 * QuickForms features specific to array fields
 * Customize buttons and layout for array item management
 */
export interface QuickFormsQuasarArrayFeatures {
  /** Position of the "Add Item" button. Default: 'bottom-left' */
  addButtonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /**
   * Native Quasar QBtn props for the "Add Item" button
   * Passed directly via v-bind - supports ALL QBtn properties + class/style
   * Defaults: { outline: true, color: 'primary', icon: 'add', label: 'Add item' }
   */
  addButton?: Partial<QBtnProps> & VueComponentAttributes;
  /**
   * Native Quasar QBtn props for the "Remove" button
   * Passed directly via v-bind - supports ALL QBtn properties + class/style
   * Defaults: { flat: true, round: true, dense: true, size: 'sm', icon: 'close', color: 'negative' }
   */
  removeButton?: Partial<QBtnProps> & VueComponentAttributes;
}

/**
 * QuickForms features specific to key-value fields
 * Customize buttons and layout for record/map type management
 */
export interface QuickFormsQuasarKeyValueFeatures {
  /** Position of the "Add" button. Default: 'bottom-left' */
  addButtonPosition?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
  /**
   * Native Quasar QBtn props for the "Add" button
   * Passed directly via v-bind - supports ALL QBtn properties + class/style
   * Defaults: { outline: true, color: 'primary', icon: 'add', label: 'Add Parameter', size: 'sm' }
   */
  addButton?: Partial<QBtnProps> & VueComponentAttributes;
  /**
   * Native Quasar QBtn props for the "Remove" button
   * Passed directly via v-bind - supports ALL QBtn properties + class/style
   * Defaults: { flat: true, round: true, dense: true, size: 'sm', icon: 'close', color: 'negative' }
   */
  removeButton?: Partial<QBtnProps> & VueComponentAttributes;
}

/**
 * Quasar-specific component defaults
 * Uses native Quasar component prop types - these get passed through via v-bind
 * All properties here are NATIVE Quasar props from the official Quasar type definitions
 */
export interface QuasarComponentDefaults extends VueComponentDefaults {
  /**
   * Global defaults applied to ALL Quasar field components (QInput, QSelect, etc)
   * Uses common props that exist across multiple Quasar components
   */
  global?: Partial<
    Pick<
      QInputProps,
      | "outlined"
      | "filled"
      | "dense"
      | "square"
      | "rounded"
      | "color"
      | "borderless"
      | "hideBottomSpace"
    >
  >;

  /** QInput-specific defaults (for string/number fields) */
  input?: Partial<QInputProps>;

  /** QSelect-specific defaults (for enum fields) */
  select?: {
    /** Enable/disable autocomplete filtering. Default: true (QuickForms feature, not Quasar) */
    autocomplete?: boolean;
  } & Partial<QSelectProps>;

  /** QCheckbox-specific defaults (for boolean fields) */
  checkbox?: Partial<QCheckboxProps>;

  /** QDate/QTime-specific defaults (for date/datetime fields) */
  datetime?: Partial<QDateProps> & {
    /** Date mask format. Default: 'YYYY-MM-DD' */
    dateMask?: string;
    /** Time mask format. Default: 'HH:mm:ss' */
    timeMask?: string;
    /** DateTime mask format. Default: 'YYYY-MM-DD HH:mm:ss' */
    dateTimeMask?: string;
  };

  /** QCard-specific defaults (for arrays/objects) */
  card?: Partial<QCardProps>;

  /** QExpansionItem-specific defaults (for objects) */
  expansion?: Partial<QExpansionItemProps>;

  /** QInput textarea-specific defaults (for JSON editor) */
  jsoneditor?: Partial<QInputProps>;

  /** QInput defaults for key-value field inputs (affects both key and value inputs) */
  keyvalue?: Partial<QInputProps>;
}

/**
 * QuickForms Quasar-specific convenience defaults
 * These are convenience features we provide on top of native Quasar
 * Use via x-quickforms-quasar in schema
 */
export interface QuickFormsQuasarDefaults {
  /** Global QuickForms features for all components */
  global?: QuickFormsQuasarFeatures;
  /** Input-specific QuickForms features */
  input?: QuickFormsQuasarFeatures;
  /** Select-specific QuickForms features (no appendIcon since dropdown uses it) */
  select?: Omit<QuickFormsQuasarFeatures, "appendIcon">;
  /** DateTime-specific QuickForms features */
  datetime?: QuickFormsQuasarFeatures;
  /** Array-specific QuickForms features */
  array?: QuickFormsQuasarArrayFeatures;
  /** Key-value specific QuickForms features */
  keyvalue?: QuickFormsQuasarKeyValueFeatures;
  /** JSON editor-specific QuickForms features */
  jsoneditor?: QuickFormsQuasarFeatures & {
    /** Show the info icon with format shortcut hint. Default: true */
    showFormatHint?: boolean;
  };
}

/**
 * Quasar-specific form options
 * Extends Vue FormOptions with Quasar-specific componentDefaults
 */
export interface QuasarFormOptions
  extends Omit<VueFormOptions, "componentDefaults"> {
  /** Native Quasar component defaults (passed via v-bind) */
  componentDefaults?: QuasarComponentDefaults;
  /** QuickForms convenience features (interpreted by our components) */
  quickformsDefaults?: QuickFormsQuasarDefaults;
}
