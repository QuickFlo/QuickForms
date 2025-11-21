import { computed } from 'vue';
import { useField } from 'vee-validate';
import type { JSONSchema } from '@quickforms/core';
import { SchemaUtils } from '@quickforms/core';
import type { FormContext } from '../types/index.js';
import { useFormContext } from './useFormContext.js';

const schemaUtils = new SchemaUtils();

// Helper functions for validation
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Debounce helper for async validators
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
}

// Helper to normalize validation result
function normalizeValidationResult(result: any): boolean | string {
  if (typeof result === "boolean") return result;
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    return result.valid === false
      ? result.message || "Validation failed"
      : true;
  }
  return true;
}

/**
 * Composable for individual form field with VeeValidate integration
 */
export function useFormField(
  path: string,
  schema: JSONSchema,
  options: { label?: string } = {}
) {
  const formContext = useFormContext();
  const validationMode = formContext?.validationMode || "ValidateAndShow";
  const customErrorMessages = formContext?.errorMessages;
  const customValidators = formContext?.validators;
  const debounceConfig = formContext?.validatorDebounce;

  // Get custom error message if available
  const getErrorMessage = (rule: string, defaultMessage: string): string => {
    // Check schema x-error-messages
    const schemaMessages = schema["x-error-messages"] as
      | Record<string, string>
      | undefined;
    if (schemaMessages?.[rule]) {
      return schemaMessages[rule];
    }

    // Check form options error messages
    if (customErrorMessages?.[path]?.[rule]) {
      return customErrorMessages[path][rule];
    }

    return defaultMessage;
  };

  // Get debounce delay for this field
  const getDebounceDelay = (): number | undefined => {
    if (typeof debounceConfig === "number") {
      return debounceConfig;
    }
    if (debounceConfig && typeof debounceConfig === "object") {
      return debounceConfig[path];
    }
    return undefined;
  };

  // Build validation function from JSON Schema
  const validationRules = (value: any) => {
    // Skip validation if mode is NoValidation
    if (validationMode === "NoValidation") {
      return true;
    }

    // Check if field is required
    const rootSchema = formContext?.schema;
    if (rootSchema) {
      const isRequired = schemaUtils.isRequired(rootSchema, path);
      if (isRequired) {
        if (value === undefined || value === null || value === "") {
          return getErrorMessage(
            "required",
            `${schema.title || path} is required`
          );
        }
      }
    }

    // Skip further validation if value is empty and not required
    if (value === undefined || value === null || value === "") {
      return true;
    }

    // String validations
    if (schema.type === "string" && typeof value === "string") {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        return getErrorMessage(
          "minLength",
          `Must be at least ${schema.minLength} characters`
        );
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        return getErrorMessage(
          "maxLength",
          `Must be at most ${schema.maxLength} characters`
        );
      }
      if (schema.pattern) {
        try {
          if (!new RegExp(schema.pattern).test(value)) {
            return getErrorMessage("pattern", "Invalid format");
          }
        } catch (e) {
          console.warn("Invalid regex pattern:", schema.pattern);
        }
      }

      // Format validations
      if (schema.format === "email" && !isValidEmail(value)) {
        return getErrorMessage("format", "Invalid email address");
      }
      if (
        (schema.format === "url" || schema.format === "uri") &&
        !isValidUrl(value)
      ) {
        return getErrorMessage("format", "Invalid URL");
      }
    }

    // Number validations
    if (
      (schema.type === "number" || schema.type === "integer") &&
      value !== ""
    ) {
      const num = Number(value);

      if (isNaN(num)) {
        return getErrorMessage("type", "Must be a valid number");
      }

      if (schema.type === "integer" && !Number.isInteger(num)) {
        return getErrorMessage("type", "Must be a whole number");
      }

      if (schema.minimum !== undefined && num < schema.minimum) {
        return getErrorMessage("minimum", `Must be at least ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && num > schema.maximum) {
        return getErrorMessage("maximum", `Must be at most ${schema.maximum}`);
      }
      if (
        schema.exclusiveMinimum !== undefined &&
        num <= schema.exclusiveMinimum
      ) {
        return getErrorMessage(
          "exclusiveMinimum",
          `Must be greater than ${schema.exclusiveMinimum}`
        );
      }
      if (
        schema.exclusiveMaximum !== undefined &&
        num >= schema.exclusiveMaximum
      ) {
        return getErrorMessage(
          "exclusiveMaximum",
          `Must be less than ${schema.exclusiveMaximum}`
        );
      }
      if (schema.multipleOf !== undefined && num % schema.multipleOf !== 0) {
        return getErrorMessage(
          "multipleOf",
          `Must be a multiple of ${schema.multipleOf}`
        );
      }
    }

    // Array validations
    if (schema.type === "array" && Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        return getErrorMessage(
          "minItems",
          `Must have at least ${schema.minItems} items`
        );
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        return getErrorMessage(
          "maxItems",
          `Must have at most ${schema.maxItems} items`
        );
      }
      if (schema.uniqueItems && new Set(value).size !== value.length) {
        return getErrorMessage("uniqueItems", "All items must be unique");
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      return getErrorMessage("enum", "Invalid value");
    }

    // Const validation
    if (schema.const !== undefined && value !== schema.const) {
      return getErrorMessage("const", `Must be ${schema.const}`);
    }

    // Custom validator (runs after JSON Schema validation)
    const customValidator = customValidators?.[path];
    if (customValidator) {
      try {
        const allValues = formContext?.formValues?.() || {};
        const context = formContext?.context || {};
        const result = customValidator(value, allValues, context);

        // Handle both sync and async results
        if (result instanceof Promise) {
          return result.then(normalizeValidationResult);
        }

        return normalizeValidationResult(result);
      } catch (error) {
        console.error("Custom validator error for", path, ":", error);
        return "Validation error";
      }
    }

    return true; // Valid
  };

  // Apply debouncing to validation if configured
  const debounceDelay = getDebounceDelay();
  const finalValidationRules =
    debounceDelay && customValidators?.[path]
      ? debounce(validationRules, debounceDelay)
      : validationRules;

  const { value, errorMessage, errors, setValue, setTouched, meta } = useField(
    path,
    validationMode === "NoValidation" ? undefined : finalValidationRules,
    {
      validateOnValueUpdate: true, // Always validate on update for custom validators
      validateOnMount: false,
    }
  );

  // Computed label from override or schema
  const label = computed(() => {
    if (options.label !== undefined) return options.label;
    return schema.title || path;
  });

  // Computed hint from schema
  const hint = computed(() => schema.description);

  // Check if field is required
  const required = computed(() => {
    const rootSchema = formContext?.schema;
    if (rootSchema) {
      return schemaUtils.isRequired(rootSchema, path);
    }
    return false;
  });

  // Only show error if validation mode allows it
  const displayError = computed(() => {
    if (
      validationMode === "ValidateAndHide" ||
      validationMode === "NoValidation"
    ) {
      return null;
    }
    return errorMessage.value;
  });

  return {
    value,
    errorMessage: displayError,
    errors,
    setValue,
    setTouched,
    meta,
    label,
    hint,
    required,
  };
}
