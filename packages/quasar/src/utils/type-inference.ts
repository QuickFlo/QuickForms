/**
 * Type inference utilities for form values
 *
 * When users type values in text inputs, they enter strings. This utility
 * infers the intended type and converts appropriately:
 * - "123" -> 123 (number)
 * - "true" / "false" -> boolean
 * - "null" -> null
 * - Template expressions like "{{path}}" stay as strings (resolved at runtime)
 * - Everything else stays as string
 */

/**
 * Infer and convert a string value to its intended type
 *
 * @param value The string value from a text input
 * @returns The value converted to its inferred type
 *
 * @example
 * inferType("123")     // => 123 (number)
 * inferType("12.5")    // => 12.5 (number)
 * inferType("true")    // => true (boolean)
 * inferType("false")   // => false (boolean)
 * inferType("null")    // => null
 * inferType("hello")   // => "hello" (string)
 * inferType("{{x}}")   // => "{{x}}" (string - template, resolved at runtime)
 * inferType("")        // => "" (empty string)
 */
export function inferType(value: string): unknown {
  // Handle empty string
  if (value === '') {
    return ''
  }

  // Don't convert template expressions - they're resolved at runtime
  if (value.includes('{{') && value.includes('}}')) {
    return value
  }

  // Handle boolean literals (case-insensitive)
  const lower = value.toLowerCase()
  if (lower === 'true') {
    return true
  }
  if (lower === 'false') {
    return false
  }

  // Handle null literal
  if (lower === 'null') {
    return null
  }

  // Try to parse as number
  const trimmed = value.trim()
  if (trimmed !== '') {
    const num = Number(trimmed)
    // Only convert if it's a valid number AND the string representation matches
    // This prevents "123abc" from being parsed as 123
    if (!isNaN(num) && (trimmed === String(num) || trimmed === num.toString())) {
      return num
    }
  }

  // Default: return as string
  return value
}

/**
 * Convert a typed value back to string for display in a text input
 *
 * @param value The typed value
 * @returns String representation for display
 */
export function toDisplayString(value: unknown): string {
  if (value === null) {
    return 'null'
  }
  if (value === undefined) {
    return ''
  }
  return String(value)
}
