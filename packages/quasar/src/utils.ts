import type {
  QuasarComponentDefaults,
  QuickFormsQuasarDefaults,
  QuickFormsQuasarFeatures,
} from "./types";
import type { JSONSchema } from "@quickflo/quickforms";

/**
 * Map Quasar size names to CSS margin values
 */
const FIELD_GAP_MAP: Record<string, string> = {
  'xs': '4px',
  'sm': '8px', 
  'md': '16px',
  'lg': '24px',
  'xl': '32px',
};

/**
 * Get the field gap CSS value from componentDefaults
 * Returns a CSS-compatible margin-bottom value
 */
export function getFieldGapStyle(componentDefaults: any): string {
  const gap = componentDefaults?.layout?.fieldGap;
  if (!gap) {
    return '16px'; // Default to 'md'
  }
  return FIELD_GAP_MAP[gap] ?? gap;
}

/**
 * Merges Quasar component defaults with schema-level props
 * Priority (lowest to highest): global defaults -> component-specific defaults -> x-component-props -> x-quasar-props
 *
 * NOTE: This only handles NATIVE Quasar props that get passed via v-bind
 * For QuickForms convenience features (icons, etc), use mergeQuickFormsQuasarFeatures
 */
export function mergeQuasarProps(
  schema: JSONSchema,
  componentDefaults: QuasarComponentDefaults | undefined,
  componentType:
    | "input"
    | "select"
    | "checkbox"
    | "datetime"
    | "card"
    | "expansion"
    | "jsoneditor"
    | "keyvalue"
): Record<string, any> {
  const globalDefaults = componentDefaults?.global || {};
  // jsoneditor doesn't have native Quasar props (uses CodeMirror)
  const typeDefaults = componentType !== 'jsoneditor' 
    ? (componentDefaults?.[componentType as keyof Omit<QuasarComponentDefaults, 'global' | 'layout' | 'array' | 'object' | 'number' | 'hints' | 'oneOf'>] || {})
    : {};
  const xComponentProps = (schema as any)["x-component-props"] || {};
  const xQuasarProps = (schema as any)["x-quasar-props"] || {};

  // Merge in priority order
  return {
    ...globalDefaults,
    ...typeDefaults,
    ...xComponentProps,
    ...xQuasarProps,
  };
}

/**
 * Merges QuickForms convenience features from defaults and schema
 * Priority (lowest to highest): global defaults -> component-specific defaults -> x-quickforms-quasar
 *
 * These are NOT native Quasar props - they're convenience features we interpret
 * and render (e.g. icons into slots)
 */
export function mergeQuickFormsQuasarFeatures(
  schema: JSONSchema,
  quickformsDefaults: QuickFormsQuasarDefaults | undefined,
  componentType: "input" | "select" | "datetime"
): QuickFormsQuasarFeatures {
  const globalFeatures = quickformsDefaults?.global || {};
  const typeFeatures = quickformsDefaults?.[componentType] || {};
  const xQuickFormsQuasar = (schema as any)["x-quickforms-quasar"] || {};

  // Merge in priority order
  return {
    ...globalFeatures,
    ...typeFeatures,
    ...xQuickFormsQuasar,
  };
}
