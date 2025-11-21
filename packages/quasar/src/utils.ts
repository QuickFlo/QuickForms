import type { QuasarComponentDefaults } from './types';
import type { JSONSchema } from '@quickflo/quickforms';

/**
 * Merges Quasar component defaults with schema-level props
 * Priority (lowest to highest): global defaults -> component-specific defaults -> x-component-props -> x-quasar-props
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
