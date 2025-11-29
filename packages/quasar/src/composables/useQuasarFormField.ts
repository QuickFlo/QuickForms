import { computed, type ComputedRef, type Ref } from 'vue';
import { useFormField, generateFieldId } from '@quickflo/quickforms-vue';
import type { JSONSchema } from '@quickflo/quickforms';
import { useQuasarFormContext } from './useQuasarFormContext';
import { mergeQuasarProps, mergeQuickFormsQuasarFeatures, getFieldGapStyle } from '../utils';
import type { QuickFormsQuasarFeatures } from '../types';

/**
 * Component types that support native Quasar props merging
 */
export type QuasarComponentType = 
  | 'input' 
  | 'select' 
  | 'checkbox' 
  | 'datetime' 
  | 'card' 
  | 'expansion' 
  | 'jsoneditor'
  | 'keyvalue';

/**
 * Component types that support QuickForms convenience features (icons, etc.)
 */
export type QuickFormsFeatureType = 'input' | 'select' | 'datetime';

/**
 * Options for useQuasarFormField
 */
export interface UseQuasarFormFieldOptions {
  /** Override the label from schema */
  label?: string;
  /** Component type for native Quasar props merging */
  componentType?: QuasarComponentType;
  /** Component type for QuickForms features (icons, etc.). Only set if different from componentType */
  featureType?: QuickFormsFeatureType;
}

/**
 * Return type for useQuasarFormField
 */
export interface UseQuasarFormFieldReturn<T = any> {
  // Core field state (from useFormField)
  value: Ref<T>;
  setValue: (val: T, shouldValidate?: boolean) => void;
  label: ComputedRef<string>;
  hint: ComputedRef<string | undefined>;
  errorMessage: ComputedRef<string | null | undefined>;
  required: ComputedRef<boolean>;
  
  // Generated field ID
  fieldId: string;
  
  // Merged Quasar props (for v-bind)
  quasarProps: ComputedRef<Record<string, any>>;
  
  // QuickForms convenience features (icons, etc.)
  quickformsFeatures: ComputedRef<QuickFormsQuasarFeatures>;
  
  // Field gap style
  fieldGap: ComputedRef<string>;
  
  // Form context (for advanced usage)
  formContext: ReturnType<typeof useQuasarFormContext>;
}

/**
 * Quasar-specific form field composable
 * 
 * Combines useFormField, useQuasarFormContext, and prop merging utilities
 * into a single composable for cleaner component code.
 * 
 * @example
 * ```ts
 * const {
 *   value,
 *   label,
 *   hint,
 *   errorMessage,
 *   required,
 *   fieldId,
 *   quasarProps,
 *   quickformsFeatures,
 *   fieldGap,
 * } = useQuasarFormField(props.path, props.schema, {
 *   label: props.label,
 *   componentType: 'input',
 * });
 * ```
 */
export function useQuasarFormField<T = any>(
  path: string,
  schema: JSONSchema,
  options: UseQuasarFormFieldOptions = {}
): UseQuasarFormFieldReturn<T> {
  const { label: labelOverride, componentType = 'input', featureType } = options;
  
  // Core field state from Vue package
  const { value, setValue, label, hint, errorMessage, required } = useFormField(
    path,
    schema,
    { label: labelOverride }
  );
  
  // Quasar form context
  const formContext = useQuasarFormContext();
  
  // Generate field ID
  const fieldId = generateFieldId(path);
  
  // Merged native Quasar props
  const quasarProps = computed(() => {
    return mergeQuasarProps(
      schema,
      formContext?.componentDefaults,
      componentType
    );
  });
  
  // Merged QuickForms convenience features
  const quickformsFeatures = computed(() => {
    // Only merge features for supported component types
    const effectiveFeatureType = featureType ?? (
      componentType === 'input' || componentType === 'select' || componentType === 'datetime'
        ? componentType as QuickFormsFeatureType
        : undefined
    );
    
    if (effectiveFeatureType) {
      return mergeQuickFormsQuasarFeatures(
        schema,
        formContext?.quickformsDefaults,
        effectiveFeatureType
      );
    }
    
    // Return empty features for unsupported types
    return {} as QuickFormsQuasarFeatures;
  });
  
  // Field gap style
  const fieldGap = computed(() => getFieldGapStyle(formContext?.componentDefaults));
  
  return {
    value: value as Ref<T>,
    setValue: setValue as (val: T) => void,
    label,
    hint,
    errorMessage,
    required,
    fieldId,
    quasarProps,
    quickformsFeatures,
    fieldGap,
    formContext,
  };
}
