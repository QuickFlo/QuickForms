import { watch, onBeforeUnmount, type ComputedRef, type WatchStopHandle } from 'vue';
import { useFormContext } from './useFormContext.js';

/**
 * Watch a specific form field value reactively.
 *
 * This composable provides a convenient way to watch changes to a specific
 * field in the form. It automatically handles cleanup when the component unmounts.
 *
 * @param path - Dot notation path to the field (e.g., 'provider.provider', 'settings.enabled')
 * @param callback - Function called when the field value changes
 * @param options - Watch options (immediate, deep)
 * @returns Object containing the reactive value ref and a manual stop function
 *
 * @example
 * ```ts
 * // In a custom field component
 * const { value: providerValue, stop } = useWatchFormValue(
 *   'provider.provider',
 *   (newValue, oldValue) => {
 *     console.log('Provider changed from', oldValue, 'to', newValue);
 *     // Refresh options, update UI, etc.
 *   },
 *   { immediate: true }
 * );
 *
 * // Use the reactive value in computed properties
 * const isOpenAI = computed(() => providerValue.value === 'openai');
 * ```
 */
export function useWatchFormValue<T = unknown>(
  path: string,
  callback?: (newValue: T | undefined, oldValue: T | undefined) => void,
  options: { immediate?: boolean; deep?: boolean } = {}
): {
  value: ComputedRef<T | undefined>;
  stop: WatchStopHandle;
} {
  const formContext = useFormContext();

  if (!formContext) {
    console.warn(
      '[quickforms] useWatchFormValue must be used within a DynamicForm component tree'
    );
    // Return a dummy implementation that does nothing
    return {
      value: { value: undefined } as ComputedRef<T | undefined>,
      stop: () => {},
    };
  }

  // Get the reactive computed ref for this field
  const value = formContext.useFieldValue<T>(path);

  // Set up the watcher if a callback was provided
  let stopHandle: WatchStopHandle = () => {};

  if (callback) {
    stopHandle = watch(
      value,
      (newValue, oldValue) => {
        callback(newValue, oldValue);
      },
      {
        immediate: options.immediate ?? false,
        deep: options.deep ?? false,
      }
    );

    // Auto-cleanup on component unmount
    onBeforeUnmount(() => {
      stopHandle();
    });
  }

  return {
    value,
    stop: stopHandle,
  };
}

/**
 * Watch multiple form field values reactively.
 *
 * This composable allows watching multiple fields at once, which is useful
 * when you need to react to changes in several related fields.
 *
 * @param paths - Array of dot notation paths to watch
 * @param callback - Function called when any of the field values change
 * @param options - Watch options (immediate, deep)
 * @returns Object containing the reactive values and a manual stop function
 *
 * @example
 * ```ts
 * const { values, stop } = useWatchFormValues(
 *   ['provider.provider', 'provider.connection'],
 *   (newValues) => {
 *     const [provider, connection] = newValues;
 *     console.log('Provider config changed:', provider, connection);
 *     // Refresh dependent options
 *   },
 *   { immediate: true }
 * );
 * ```
 */
export function useWatchFormValues<T extends unknown[] = unknown[]>(
  paths: string[],
  callback?: (newValues: T, oldValues: T) => void,
  options: { immediate?: boolean; deep?: boolean } = {}
): {
  values: ComputedRef<T[number] | undefined>[];
  stop: WatchStopHandle;
} {
  const formContext = useFormContext();

  if (!formContext) {
    console.warn(
      '[quickforms] useWatchFormValues must be used within a DynamicForm component tree'
    );
    return {
      values: paths.map(() => ({ value: undefined } as ComputedRef<T[number] | undefined>)),
      stop: () => {},
    };
  }

  // Get reactive computed refs for all fields
  const values = paths.map((path) => formContext.useFieldValue<T[number]>(path));

  // Set up the watcher if a callback was provided
  let stopHandle: WatchStopHandle = () => {};

  if (callback) {
    stopHandle = watch(
      values,
      (newValues, oldValues) => {
        callback(
          newValues.map((v) => v) as T,
          oldValues.map((v) => v) as T
        );
      },
      {
        immediate: options.immediate ?? false,
        deep: options.deep ?? false,
      }
    );

    // Auto-cleanup on component unmount
    onBeforeUnmount(() => {
      stopHandle();
    });
  }

  return {
    values,
    stop: stopHandle,
  };
}
