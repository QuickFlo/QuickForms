import { inject, provide, type InjectionKey } from 'vue';
import { useFormContext } from '@quickflo/quickforms-vue';
import type { QuasarFormContext } from '../types.js';

/**
 * Injection key for Quasar form context
 * Used when explicitly providing QuasarFormContext (optional).
 */
const QuasarFormContextKey: InjectionKey<QuasarFormContext> = Symbol('quickforms-quasar-context');

/**
 * Provide Quasar form context to child components
 * Call this in your form component (e.g., DynamicForm wrapper)
 * 
 * Note: This is optional. The DynamicForm from the Vue package already
 * provides a FormContext that includes quickformsDefaults. This function
 * is useful if you want to explicitly provide a typed QuasarFormContext.
 */
export function provideQuasarFormContext(context: QuasarFormContext): void {
  provide(QuasarFormContextKey, context);
}

/**
 * Inject Quasar form context from parent
 * Returns properly typed QuasarFormContext with componentDefaults and quickformsDefaults
 * 
 * This first tries to inject the Quasar-specific context, then falls back to
 * the generic FormContext (with type coercion) for compatibility with DynamicForm.
 * 
 * @example
 * ```ts
 * const formContext = useQuasarFormContext();
 * // componentDefaults is typed as QuasarComponentDefaults
 * const globalDefaults = formContext?.componentDefaults?.global;
 * // quickformsDefaults is properly typed
 * const iconColor = formContext?.quickformsDefaults?.global?.iconColor;
 * ```
 */
export function useQuasarFormContext(): QuasarFormContext | undefined {
  // First try the Quasar-specific context
  const quasarContext = inject(QuasarFormContextKey, undefined);
  if (quasarContext) {
    return quasarContext;
  }
  
  // Fall back to the generic FormContext from the Vue package
  // The DynamicForm already includes quickformsDefaults, we just need to type it
  const formContext = useFormContext();
  return formContext as QuasarFormContext | undefined;
}
