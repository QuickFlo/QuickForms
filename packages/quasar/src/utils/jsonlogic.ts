/**
 * JSONLogic Utilities for Condition Builder
 *
 * Converts between visual condition format and JSONLogic.
 * Supports common comparison operators and AND/OR grouping.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Supported comparison operators
 */
export type ComparisonOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'matches'
  | 'isTrue'
  | 'isFalse'
  | 'isEmpty'
  | 'isNotEmpty'

/**
 * Operator metadata for UI display
 */
export interface OperatorInfo {
  value: ComparisonOperator
  label: string
  symbol?: string
  rightRequired: boolean
  rightType?: 'text' | 'number' | 'regex' | 'array'
  description?: string
  /** Short text label (e.g., "eq", "gt") */
  shortLabel?: string
  /** Icon name for Quasar QIcon */
  icon?: string
  /** Search shortcuts for autocomplete (e.g., ">=", "!=") */
  searchTerms?: string[]
}

/**
 * A single condition (left operator right)
 */
export interface SimpleCondition {
  id: string
  type: 'condition'
  left: string
  operator: ComparisonOperator
  right: string
}

/**
 * A group of conditions with AND/OR logic
 */
export interface ConditionGroup {
  id: string
  type: 'group'
  logic: 'and' | 'or'
  conditions: ConditionItem[]
}

/**
 * Either a simple condition or a nested group
 */
export type ConditionItem = SimpleCondition | ConditionGroup

/**
 * The root condition structure
 */
export interface ConditionRoot {
  logic: 'and' | 'or'
  conditions: ConditionItem[]
}

/**
 * JSONLogic object type
 */
export type JsonLogic = Record<string, unknown> | boolean

// ============================================================================
// Operator Definitions
// ============================================================================

export const OPERATORS: OperatorInfo[] = [
  { value: '==', label: 'equals', symbol: '=', shortLabel: 'equals', icon: 'drag_handle', searchTerms: ['==', '=', 'eq', 'equal'], rightRequired: true, rightType: 'text' },
  { value: '!=', label: 'not equals', symbol: '≠', shortLabel: 'not equals', icon: 'not_equal', searchTerms: ['!=', '!', 'neq', 'not'], rightRequired: true, rightType: 'text' },
  { value: '>', label: 'greater than', symbol: '>', shortLabel: 'greater than', icon: 'chevron_right', searchTerms: ['>', 'gt', 'greater'], rightRequired: true, rightType: 'number' },
  { value: '>=', label: 'greater or equal', symbol: '≥', shortLabel: 'greater or equal', icon: 'keyboard_tab', searchTerms: ['>=', 'gte'], rightRequired: true, rightType: 'number' },
  { value: '<', label: 'less than', symbol: '<', shortLabel: 'less than', icon: 'chevron_left', searchTerms: ['<', 'lt', 'less'], rightRequired: true, rightType: 'number' },
  { value: '<=', label: 'less or equal', symbol: '≤', shortLabel: 'less or equal', icon: 'keyboard_tab', searchTerms: ['<=', 'lte'], rightRequired: true, rightType: 'number' },
  { value: 'contains', label: 'contains', shortLabel: 'contains', icon: 'menu_open', searchTerms: ['contains', 'has', 'includes'], rightRequired: true, rightType: 'text', description: 'String contains substring' },
  { value: 'startsWith', label: 'starts with', shortLabel: 'starts with', icon: 'format_align_left', searchTerms: ['starts', 'begins'], rightRequired: true, rightType: 'text' },
  { value: 'endsWith', label: 'ends with', shortLabel: 'ends with', icon: 'format_align_right', searchTerms: ['ends', 'finishes'], rightRequired: true, rightType: 'text' },
  { value: 'in', label: 'in list', shortLabel: 'in list', icon: 'list', searchTerms: ['in', 'list'], rightRequired: true, rightType: 'array', description: 'Value is in array' },
  { value: 'matches', label: 'matches regex', shortLabel: 'matches', icon: 'code', searchTerms: ['matches', 'regex', 'pattern'], rightRequired: true, rightType: 'regex', description: 'Matches regex pattern' },
  { value: 'isTrue', label: 'is true', shortLabel: 'is true', icon: 'check', searchTerms: ['true', 'yes'], rightRequired: false },
  { value: 'isFalse', label: 'is false', shortLabel: 'is false', icon: 'close', searchTerms: ['false', 'no'], rightRequired: false },
  { value: 'isEmpty', label: 'is empty', shortLabel: 'is empty', icon: 'radio_button_unchecked', searchTerms: ['empty', 'blank', 'null'], rightRequired: false, description: 'Empty string, null, or undefined' },
  { value: 'isNotEmpty', label: 'is not empty', shortLabel: 'is not empty', icon: 'radio_button_checked', searchTerms: ['not empty', 'filled', 'exists'], rightRequired: false },
]

export function getOperatorInfo(op: ComparisonOperator): OperatorInfo | undefined {
  return OPERATORS.find((o) => o.value === op)
}

// ============================================================================
// ID Generation
// ============================================================================

let idCounter = 0

export function generateConditionId(): string {
  return `cond-${++idCounter}-${Date.now()}`
}

// ============================================================================
// Convert Visual Conditions → JSONLogic
// ============================================================================

/**
 * Convert a condition root to JSONLogic
 */
export function toJsonLogic(root: ConditionRoot): JsonLogic {
  if (root.conditions.length === 0) {
    return true // Empty condition = always true
  }

  if (root.conditions.length === 1) {
    return conditionItemToJsonLogic(root.conditions[0]!)
  }

  return {
    [root.logic]: root.conditions.map(conditionItemToJsonLogic),
  }
}

/**
 * Convert a condition item (simple or group) to JSONLogic
 */
function conditionItemToJsonLogic(item: ConditionItem): JsonLogic {
  if (item.type === 'group') {
    if (item.conditions.length === 0) {
      return true
    }
    if (item.conditions.length === 1) {
      return conditionItemToJsonLogic(item.conditions[0]!)
    }
    return {
      [item.logic]: item.conditions.map(conditionItemToJsonLogic),
    }
  }

  return simpleConditionToJsonLogic(item)
}

/**
 * Convert a simple condition to JSONLogic
 */
function simpleConditionToJsonLogic(cond: SimpleCondition): JsonLogic {
  const left = parseValue(cond.left)
  const right = parseValue(cond.right)

  switch (cond.operator) {
    case '==':
      return { '==': [left, right] }
    case '!=':
      return { '!=': [left, right] }
    case '>':
      return { '>': [left, right] }
    case '>=':
      return { '>=': [left, right] }
    case '<':
      return { '<': [left, right] }
    case '<=':
      return { '<=': [left, right] }
    case 'in':
      // Right should be an array
      return { in: [left, parseArrayValue(cond.right)] }
    case 'contains':
      // JSONLogic "in" with string checks if substring exists
      return { in: [right, left] }
    case 'startsWith':
      // Use substr to check prefix
      return { '==': [{ substr: [left, 0, { strlen: right }] }, right] }
    case 'endsWith':
      // Use substr with negative index
      return { '==': [{ substr: [left, { '*': [{ strlen: right }, -1] }] }, right] }
    case 'matches':
      // JSONLogic doesn't have native regex, use custom operator marker
      return { matches: [left, cond.right] }
    case 'isTrue':
      return { '==': [left, true] }
    case 'isFalse':
      return { '==': [left, false] }
    case 'isEmpty':
      return { or: [{ '==': [left, ''] }, { '==': [left, null] }, { '!': [left] }] }
    case 'isNotEmpty':
      return { and: [{ '!=': [left, ''] }, { '!=': [left, null] }, { '!!': [left] }] }
    default:
      return { '==': [left, right] }
  }
}

/**
 * Parse a value string into JSONLogic value
 * - Handles { "var": "path" } for variable references
 * - Handles numbers
 * - Handles booleans
 * - Falls back to string
 */
function parseValue(value: string): unknown {
  if (!value) {
    return ''
  }

  // Check if it's a variable reference (starts with step ID or special prefix)
  // Variables typically look like: stepId.field or $env.VAR
  if (isVariableReference(value)) {
    return { var: value }
  }

  // Try to parse as number
  const num = Number(value)
  if (!isNaN(num) && value.trim() !== '') {
    return num
  }

  // Check for booleans
  if (value.toLowerCase() === 'true') {
    return true
  }
  if (value.toLowerCase() === 'false') {
    return false
  }

  // Check for null
  if (value.toLowerCase() === 'null') {
    return null
  }

  // String value
  return value
}

/**
 * Check if a value looks like a variable reference
 */
function isVariableReference(value: string): boolean {
  // Contains a dot (stepId.field) or starts with $ ($env, $connections)
  return value.includes('.') || value.startsWith('$')
}

/**
 * Parse a comma-separated string into an array
 */
function parseArrayValue(value: string): unknown[] {
  if (!value) {
    return []
  }

  // Try to parse as JSON array first
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    // Not JSON, split by comma
  }

  return value.split(',').map((item) => {
    const trimmed = item.trim()
    return parseValue(trimmed)
  })
}

// ============================================================================
// Convert JSONLogic → Visual Conditions
// ============================================================================

/**
 * Convert JSONLogic to a condition root
 */
export function fromJsonLogic(logic: JsonLogic): ConditionRoot {
  if (typeof logic === 'boolean' || logic === null || logic === undefined) {
    return { logic: 'and', conditions: [] }
  }

  // Check for top-level and/or
  if ('and' in logic && Array.isArray(logic.and)) {
    return {
      logic: 'and',
      conditions: (logic.and as JsonLogic[]).map(jsonLogicToConditionItem),
    }
  }

  if ('or' in logic && Array.isArray(logic.or)) {
    return {
      logic: 'or',
      conditions: (logic.or as JsonLogic[]).map(jsonLogicToConditionItem),
    }
  }

  // Single condition at root
  const item = jsonLogicToConditionItem(logic)
  return {
    logic: 'and',
    conditions: item ? [item] : [],
  }
}

/**
 * Convert a JSONLogic expression to a condition item
 */
function jsonLogicToConditionItem(logic: JsonLogic): ConditionItem {
  if (typeof logic !== 'object' || logic === null) {
    // Can't parse, return empty condition
    return createEmptyCondition()
  }

  // Check for nested and/or (group)
  if ('and' in logic && Array.isArray(logic.and)) {
    return {
      id: generateConditionId(),
      type: 'group',
      logic: 'and',
      conditions: (logic.and as JsonLogic[]).map(jsonLogicToConditionItem),
    }
  }

  if ('or' in logic && Array.isArray(logic.or)) {
    return {
      id: generateConditionId(),
      type: 'group',
      logic: 'or',
      conditions: (logic.or as JsonLogic[]).map(jsonLogicToConditionItem),
    }
  }

  // Try to parse as simple condition
  return parseSimpleCondition(logic)
}

/**
 * Parse a JSONLogic expression as a simple condition
 */
function parseSimpleCondition(logic: JsonLogic): SimpleCondition {
  if (typeof logic !== 'object' || logic === null) {
    return createEmptyCondition()
  }

  const keys = Object.keys(logic)
  if (keys.length === 0) {
    return createEmptyCondition()
  }

  const operator = keys[0]!
  const args = (logic as Record<string, unknown>)[operator]

  if (!Array.isArray(args)) {
    return createEmptyCondition()
  }

  // Map JSONLogic operators to our operators
  const opMap: Record<string, ComparisonOperator> = {
    '==': '==',
    '===': '==',
    '!=': '!=',
    '!==': '!=',
    '>': '>',
    '>=': '>=',
    '<': '<',
    '<=': '<=',
    in: 'in',
    matches: 'matches',
  }

  const mappedOp = opMap[operator]
  if (mappedOp) {
    return {
      id: generateConditionId(),
      type: 'condition',
      left: extractValue(args[0]),
      operator: mappedOp,
      right: extractValue(args[1]),
    }
  }

  // For complex expressions we can't parse, show as empty
  return createEmptyCondition()
}

/**
 * Extract a string value from a JSONLogic value
 */
function extractValue(val: unknown): string {
  if (val === null || val === undefined) {
    return ''
  }

  if (typeof val === 'object' && val !== null && 'var' in val) {
    return String((val as { var: unknown }).var)
  }

  if (Array.isArray(val)) {
    return JSON.stringify(val)
  }

  return String(val)
}

/**
 * Create an empty condition
 */
export function createEmptyCondition(): SimpleCondition {
  return {
    id: generateConditionId(),
    type: 'condition',
    left: '',
    operator: '==',
    right: '',
  }
}

/**
 * Create an empty group
 */
export function createEmptyGroup(logic: 'and' | 'or' = 'and'): ConditionGroup {
  return {
    id: generateConditionId(),
    type: 'group',
    logic,
    conditions: [createEmptyCondition()],
  }
}

/**
 * Create an empty root
 */
export function createEmptyRoot(): ConditionRoot {
  return {
    logic: 'and',
    conditions: [createEmptyCondition()],
  }
}
