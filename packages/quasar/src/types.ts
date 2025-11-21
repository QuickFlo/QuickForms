import type { FormOptions as VueFormOptions } from '@quickflo/quickforms-vue';

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
    showMode?: 'always' | 'focus' | 'hover';
  };
}

/**
 * Quasar-specific component defaults
 * These are applied globally to all Quasar components unless overridden by x-quasar-props
 */
export interface QuasarComponentDefaults extends VueComponentDefaults {
  /** Global defaults applied to ALL Quasar components */
  global?: {
    /** CSS class(es) to apply to all components. Can be string or array. */
    class?: string | string[];
    /** Inline styles to apply to all components. */
    style?: string | Record<string, string>;
    /** Use outlined style for inputs. Default: false */
    outlined?: boolean;
    /** Use filled style for inputs. Default: false */
    filled?: boolean;
    /** Use dense mode for all components. Default: false */
    dense?: boolean;
    /** Use square borders. Default: false */
    square?: boolean;
    /** Use rounded borders. Default: false */
    rounded?: boolean;
    /** Global color for all components. Default: undefined */
    color?: string;
    /** Show bottom border only. Default: false */
    borderless?: boolean;
    /** Hide bottom space reserved for hint/error. Default: false */
    hideBottomSpace?: boolean;
  };
  /** QInput-specific defaults */
  input?: {
    /** CSS class(es) for input fields */
    class?: string | string[];
    /** Inline styles for input fields */
    style?: string | Record<string, string>;
    /** Default outlined style. Default: false */
    outlined?: boolean;
    /** Default dense mode. Default: false */
    dense?: boolean;
    /** Show clear button. Default: false */
    clearable?: boolean;
    /** Input color. Default: undefined */
    color?: string;
  };
  /** QSelect-specific defaults */
  select?: {
    // QuickForms properties (framework-agnostic, use via x-component-props or componentDefaults)
    /** Enable/disable autocomplete filtering. Default: true (enabled for all selects) */
    autocomplete?: boolean;
    // Quasar-specific properties (use via x-quasar-props)
    /** CSS class(es) for select fields */
    class?: string | string[];
    /** Inline styles for select fields */
    style?: string | Record<string, string>;
    /** Default outlined style. Default: false */
    outlined?: boolean;
    /** Default dense mode. Default: false */
    dense?: boolean;
    /** Use chips for multiple selection. Default: false */
    useChips?: boolean;
    /** Select color. Default: undefined */
    color?: string;
  };
  /** QCheckbox-specific defaults */
  checkbox?: {
    /** CSS class(es) for checkboxes */
    class?: string | string[];
    /** Inline styles for checkboxes */
    style?: string | Record<string, string>;
    /** Checkbox color. Default: 'primary' */
    color?: string;
    /** Keep color when unchecked. Default: false */
    keepColor?: boolean;
    /** Use dense mode. Default: false */
    dense?: boolean;
  };
  /** QDate/QTime-specific defaults */
  datetime?: {
    /** CSS class(es) for datetime fields */
    class?: string | string[];
    /** Inline styles for datetime fields */
    style?: string | Record<string, string>;
    /** Date mask format. Default: 'YYYY-MM-DD' */
    dateMask?: string;
    /** Time mask format. Default: 'HH:mm:ss' */
    timeMask?: string;
    /** DateTime mask format. Default: 'YYYY-MM-DD HH:mm:ss' */
    dateTimeMask?: string;
    /** Color for date/time picker. Default: 'primary' */
    color?: string;
  };
  /** QCard-specific defaults for arrays/objects */
  card?: {
    /** CSS class(es) for cards */
    class?: string | string[];
    /** Inline styles for cards */
    style?: string | Record<string, string>;
    /** Use flat style. Default: true */
    flat?: boolean;
    /** Show border. Default: true */
    bordered?: boolean;
    /** Use square borders. Default: false */
    square?: boolean;
  };
  /** QExpansionItem-specific defaults for objects */
  expansion?: {
    /** CSS class(es) for expansion items */
    class?: string | string[];
    /** Inline styles for expansion items */
    style?: string | Record<string, string>;
    /** Start expanded. Default: true */
    defaultOpened?: boolean;
    /** Expansion icon. Default: undefined */
    icon?: string;
    /** Use dense mode. Default: false */
    dense?: boolean;
  };
}

/**
 * Quasar-specific form options
 * Extends Vue FormOptions with Quasar-specific componentDefaults
 */
export interface QuasarFormOptions extends Omit<VueFormOptions, 'componentDefaults'> {
  componentDefaults?: QuasarComponentDefaults;
}
