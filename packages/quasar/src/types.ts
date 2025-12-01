import type {
  FormContext,
  FormOptions as VueFormOptions,
} from "@quickflo/quickforms-vue";
import type { StyleValue } from "vue";
import type {
  QInputProps,
  QSelectProps,
  QCheckboxProps,
  QDateProps,
  QCardProps,
  QExpansionItemProps,
  QBtnProps,
  QChipProps,
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
  layout?: {
    /**
     * Vertical gap between form fields.
     * Accepts Quasar sizes: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
     * Or CSS value: '1rem', '24px', etc.
     * Default: 'md' (16px)
     */
    fieldGap?: "xs" | "sm" | "md" | "lg" | "xl" | string;
  };
  select?: {
    autocomplete?: boolean;
    autocompleteThreshold?: number;
  };
  array?: {
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  };
  object?: {
    /**
     * Default expanded state for object fields.
     * 'required-only' = required fields expanded, optional collapsed (default)
     * 'all' = all fields expanded
     * 'none' = all fields collapsed
     */
    defaultExpanded?: "required-only" | "all" | "none";
    /** Show "(optional)" indicator for optional object fields. Default: true */
    showOptionalIndicator?: boolean;
    /**
     * Visual style for object section borders.
     * 'solid' = solid left border (default)
     * 'dashed' = dashed left border
     * 'none' = no border
     */
    sectionStyle?: "solid" | "dashed" | "none";
  };
  number?: {
    prefix?: string;
    suffix?: string;
  };
  hints?: {
    showMode?: "always" | "focus" | "hover";
  };
  oneOf?: {
    /** Label for the dropdown selector in oneOf fields. Default: "Select Option" */
    selectLabel?: string;
    /** Default display style for oneOf/anyOf fields. Default: 'tabs' for 2-4 options, 'dropdown' for more */
    displayStyle?: "tabs" | "dropdown";
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
 * QuickForms features specific to tags/chips fields
 * Customize chip appearance and input behavior
 */
export interface QuickFormsQuasarTagsFeatures {
  /**
   * Native Quasar QChip props for the tag chips
   * Passed directly via v-bind - supports ALL QChip properties + class/style
   * Defaults: { removable: true, dense: true, color: 'primary', textColor: 'white' }
   */
  chip?: Partial<QChipProps> & VueComponentAttributes;
  /**
   * Separator pattern for parsing pasted values
   * Can be a string (converted to RegExp) or RegExp
   * Default: /[,;\s]+/ (comma, semicolon, or whitespace)
   */
  separator?: string | RegExp;
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
  /** Show column headers (Key/Value). Default: false */
  showHeaders?: boolean;
  /** Custom label for the key column. Default: 'Key' */
  keyLabel?: string;
  /** Custom label for the value column. Default: 'Value' */
  valueLabel?: string;
  /**
   * Automatically infer types from string values.
   * When enabled:
   * - "123" becomes 123 (number)
   * - "true"/"false" become booleans
   * - "null" becomes null
   * - Template expressions ({{ }}) stay as strings
   *
   * Use via x-infer-types in schema or quickformsDefaults.keyvalue.inferTypes
   * Default: false (values stay as strings for backwards compatibility)
   */
  inferTypes?: boolean;
}

/**
 * Quasar-specific component defaults
 * Uses native Quasar component prop types - these get passed through via v-bind
 * All properties here are NATIVE Quasar props from the official Quasar type definitions
 */
/** Section style options for visual grouping of nested content */
export type SectionStyle = 'solid' | 'dashed' | 'card' | 'none';

export interface QuasarComponentDefaults
  extends Omit<VueComponentDefaults, "select"> {
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
  select?: Partial<QSelectProps>;

  /** QCheckbox-specific defaults (for boolean fields) */
  checkbox?: Partial<QCheckboxProps>;

  /** QDate/QTime-specific defaults (for date/datetime fields) */
  datetime?: Partial<QDateProps>;

  /** QCard-specific defaults (for arrays/objects) */
  card?: Partial<QCardProps>;

  /** QExpansionItem-specific defaults (for objects) */
  expansion?: Partial<QExpansionItemProps>;

  /** QInput defaults for key-value field inputs (affects both key and value inputs) */
  keyvalue?: Partial<QInputProps>;
}

/**
 * QuickForms Quasar-specific convenience defaults
 * These are convenience features we provide on top of native Quasar
 * Use via x-quickforms-quasar in schema
 */
/** QuickForms features for object fields */
export interface QuickFormsQuasarObjectFeatures {
  /**
   * Visual style for nested content boundary
   * - 'solid': 3px solid left border (default)
   * - 'dashed': 2px dashed left border
   * - 'none': No visual boundary
   */
  sectionStyle?: SectionStyle;
  /**
   * Default expanded state for object fields
   * - 'all': All objects start expanded
   * - 'none': All objects start collapsed
   * - 'required-only': Required objects expanded, optional collapsed (default)
   */
  defaultExpanded?: 'all' | 'none' | 'required-only';
  /** Show "(optional)" indicator on optional objects. Default: true */
  showOptionalIndicator?: boolean;
}

export interface QuickFormsQuasarDefaults {
  /** Global QuickForms features for all components */
  global?: QuickFormsQuasarFeatures;
  /** Input-specific QuickForms features */
  input?: QuickFormsQuasarFeatures;
  /** Select-specific QuickForms features (no appendIcon since dropdown uses it) */
  select?: Omit<QuickFormsQuasarFeatures, "appendIcon"> & {
    /** Enable/disable autocomplete filtering. Default: true */
    autocomplete?: boolean;
  };
  /** DateTime-specific QuickForms features */
  datetime?: QuickFormsQuasarFeatures & {
    /** Date mask format. Default: 'YYYY-MM-DD' */
    dateMask?: string;
    /** Time mask format. Default: 'hh:mm A' (12-hour with AM/PM) */
    timeMask?: string;
  };
  /** Object-specific QuickForms features */
  object?: QuickFormsQuasarObjectFeatures;
  /** Array-specific QuickForms features (includes sectionStyle + button customization) */
  array?: QuickFormsQuasarArrayFeatures & {
    /**
     * Visual style for array content boundary
     * - 'card': Full border around entire array with subtle background (default)
     * - 'solid': 3px solid left border
     * - 'dashed': 2px dashed left border
     * - 'none': No visual boundary
     * Falls back to object.sectionStyle if not set
     */
    sectionStyle?: SectionStyle;
  };
  /** Key-value specific QuickForms features */
  keyvalue?: QuickFormsQuasarKeyValueFeatures;
  /** Tags/chips input specific QuickForms features */
  tags?: QuickFormsQuasarTagsFeatures;
  /** JSON editor-specific QuickForms features */
  jsoneditor?: {
    /** Editor height. Default: '300px' */
    height?: string;
    /** Use dark theme. Default: false */
    darkTheme?: boolean;
    /** Show line numbers. Default: false */
    lineNumbers?: boolean;
    /** Show lint gutter. Default: false */
    lintGutter?: boolean;
    /** Tab size for indentation. Default: 2 */
    tabSize?: number;
    /** Enable indent with tab key. Default: true */
    indentWithTab?: boolean;
    /** Keyboard shortcut for formatting. Default: 'Ctrl-.' */
    formatKey?: string;
  };
  /** JSONLogic builder-specific QuickForms features */
  jsonlogicbuilder?: {
    /** 
     * Display mode for operators in dropdown
     * - 'icon': Show only icons (most compact)
     * - 'symbol': Show math symbols (e.g., "=", "≠")
     * - 'short': Show short text (e.g., "eq", "neq")
     * - 'verbose': Show full labels with symbols (e.g., "= equals")
     * Default: 'symbol'
     */
    operatorDisplayMode?: 'icon' | 'symbol' | 'short' | 'verbose';
    /**
     * Limit which operators are available
     * If provided, only these operators will be shown in the dropdown
     * Useful to simplify the UI for specific use cases
     * Example: ['==', '!=', '>', '<'] for basic comparisons
     */
    allowedOperators?: string[];
    /**
     * Enable template syntax ({{ }}) for values instead of JSONLogic's { "var": ... }
     * 
     * When enabled:
     * - Values like "{{ initial.status }}" are kept as strings in the JSONLogic output
     * - The consuming application is responsible for resolving templates before JSONLogic evaluation
     * - Existing { "var": ... } values are displayed as {{ ... }} in the UI for backwards compatibility
     * 
     * When disabled (default):
     * - Variable references like "initial.status" are converted to { "var": "initial.status" }
     * - Standard JSONLogic behavior
     * 
     * Default: false
     */
    useTemplateSyntax?: boolean;
  };
}

/**
 * Quasar-specific form options
 * Extends Vue FormOptions with Quasar-specific componentDefaults
 */
export interface QuasarFormOptions
  extends Omit<VueFormOptions<QuasarComponentDefaults>, "componentDefaults"> {
  /** Native Quasar component defaults (passed via v-bind) */
  componentDefaults?: QuasarComponentDefaults;
  /** QuickForms convenience features (interpreted by our components) */
  quickformsDefaults?: QuickFormsQuasarDefaults;
}

/**
 * Quasar-specific form context
 * Extends Vue FormContext with Quasar-specific properties
 */
export interface QuasarFormContext extends Omit<FormContext, "componentDefaults"> {
  /** Native Quasar component defaults (passed via v-bind) */
  componentDefaults: QuasarComponentDefaults;
  /** QuickForms convenience features (interpreted by our components) */
  quickformsDefaults?: QuickFormsQuasarDefaults;
}
