import type { QuasarComponentDefaults, QuickFormsQuasarDefaults, QuickFormsQuasarFeatures } from './types';
import type { JSONSchema } from '@quickflo/quickforms';

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
  componentType: 'input' | 'select' | 'checkbox' | 'datetime' | 'card' | 'expansion'
): Record<string, any> {
  const globalDefaults = componentDefaults?.global || {};
  const typeDefaults = componentDefaults?.[componentType] || {};
  const xComponentProps = (schema as any)['x-component-props'] || {};
  const xQuasarProps = (schema as any)['x-quasar-props'] || {};

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
  componentType: 'input' | 'select' | 'datetime'
): QuickFormsQuasarFeatures {
  const globalFeatures = quickformsDefaults?.global || {};
  const typeFeatures = quickformsDefaults?.[componentType] || {};
  const xQuickFormsQuasar = (schema as any)['x-quickforms-quasar'] || {};

  // Merge in priority order
  return {
    ...globalFeatures,
    ...typeFeatures,
    ...xQuickFormsQuasar,
  };
}
