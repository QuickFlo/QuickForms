import { inject, provide, type InjectionKey } from 'vue';
import type { FormContext } from '../types/index.js';

const FormContextKey: InjectionKey<FormContext> = Symbol('quickforms-context');

/**
 * Provide form context to child components
 */
export function provideFormContext(context: FormContext): void {
  provide(FormContextKey, context);
}

/**
 * Inject form context from parent
 */
export function useFormContext(): FormContext | undefined {
  return inject(FormContextKey, undefined);
}
