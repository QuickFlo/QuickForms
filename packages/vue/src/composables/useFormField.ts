import { computed } from "vue";
import { useField } from "vee-validate";
import type { JSONSchema } from "@quickflo/quickforms";
import type { FormContext } from "../types/index.js";
import { useFormContext } from "./useFormContext.js";
import { getHint } from "./utils.js";
import { schemaUtils } from "../schema-utils-singleton.js";

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
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return new Promise((resolve) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const res = await func(...args);
        resolve(res as Awaited<ReturnType<T>>);
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

    // String validations
    if (schema.type === "string") {
      // minLength validation applies even to empty strings if field has minLength constraint
      if (schema.minLength !== undefined && typeof value === "string" && value.length < schema.minLength) {
        return getErrorMessage(
          "minLength",
          `Must be at least ${schema.minLength} characters`
        );
      }
      
      // Skip further validation if value is empty and not required
      if (value === undefined || value === null || value === "") {
        return true;
      }
      
      // Continue with other string validations only if value is not empty
      if (typeof value === "string") {
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

      // Validate each item against the items schema
      const itemsSchema = Array.isArray(schema.items)
        ? schema.items[0]
        : schema.items;
      if (itemsSchema && typeof itemsSchema !== "boolean") {
        for (let i = 0; i < value.length; i++) {
          const item = value[i];

          // String item validations
          if (itemsSchema.type === "string" && typeof item === "string") {
            if (itemsSchema.format === "email" && !isValidEmail(item)) {
              return getErrorMessage(
                "items.format",
                `Item "${item}" is not a valid email address`
              );
            }
            if (
              (itemsSchema.format === "url" || itemsSchema.format === "uri") &&
              !isValidUrl(item)
            ) {
              return getErrorMessage(
                "items.format",
                `Item "${item}" is not a valid URL`
              );
            }
            if (
              itemsSchema.minLength !== undefined &&
              item.length < itemsSchema.minLength
            ) {
              return getErrorMessage(
                "items.minLength",
                `Item "${item}" must be at least ${itemsSchema.minLength} characters`
              );
            }
            if (
              itemsSchema.maxLength !== undefined &&
              item.length > itemsSchema.maxLength
            ) {
              return getErrorMessage(
                "items.maxLength",
                `Item "${item}" must be at most ${itemsSchema.maxLength} characters`
              );
            }
            if (itemsSchema.pattern) {
              try {
                if (!new RegExp(itemsSchema.pattern).test(item)) {
                  return getErrorMessage(
                    "items.pattern",
                    `Item "${item}" has invalid format`
                  );
                }
              } catch (e) {
                console.warn("Invalid regex pattern:", itemsSchema.pattern);
              }
            }
          }

          // Enum item validation
          if (itemsSchema.enum && !itemsSchema.enum.includes(item)) {
            return getErrorMessage(
              "items.enum",
              `Item "${item}" is not a valid option`
            );
          }
        }
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
      validateOnValueUpdate: true, // Always validate on update
      validateOnMount: false,
      // Note: VeeValidate will still validate, we just control when errors are displayed
    }
  );

  // Initialize string fields to empty string if undefined
  // This ensures empty text fields are saved as "" not undefined/missing
  if (schema.type === "string" && value.value === undefined) {
    setValue("", false);  // Skip validation during initialization
  }

  // Computed label from override or schema
  const label = computed(() => {
    if (options.label !== undefined) return options.label;
    // Hide label for synthetic root path
    if (path === "__root__") return schema.title || "";
    return schema.title || path;
  });

  // Computed hint from schema with optional custom renderer
  const hint = computed(() => {
    const rawHint = getHint(schema);
    if (!rawHint) return undefined;
    
    // Apply hintRenderer if provided
    if (formContext?.hintRenderer) {
      return formContext.hintRenderer(rawHint, {
        schema,
        path,
        value: value.value
      });
    }
    
    return rawHint;
  });

  // Get hint display mode (per-field override or global default)
  const hintMode = computed(() => {
    const xHintMode = (schema as any)['x-hint-mode'] as 'always' | 'focus' | 'hover' | undefined;
    if (xHintMode) return xHintMode;
    
    return formContext?.componentDefaults?.hints?.showMode || 'always';
  });

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
    hintMode,
    required,
  };
}
