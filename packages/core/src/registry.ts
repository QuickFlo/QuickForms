import type { FieldComponent, JSONSchema, UISchemaElement } from './types.js';

/**
 * Registry for managing component mappings
 * Uses tester priority system to determine which component to use
 */
export class ComponentRegistry<T = any> {
  private components: Map<string, FieldComponent<T>> = new Map();

  /**
   * Register a component with a name and tester function
   */
  register(name: string, component: T, tester: FieldComponent<T>['tester']): void {
    this.components.set(name, { component, tester });
  }

  /**
   * Register multiple components at once
   */
  registerAll(components: Record<string, FieldComponent<T>>): void {
    for (const [name, fieldComponent] of Object.entries(components)) {
      this.components.set(name, fieldComponent);
    }
  }

  /**
   * Get the best matching component for a schema
   * Returns null if no component matches
   */
  getComponent(schema: JSONSchema, uischema?: UISchemaElement): T | null {
    let bestMatch: T | null = null;
    let highestRank = -1;

    for (const [_, fieldComponent] of this.components) {
      const rank = fieldComponent.tester(schema, uischema);
      if (rank > highestRank) {
        highestRank = rank;
        bestMatch = fieldComponent.component;
      }
    }

    return bestMatch;
  }

  /**
   * Get all registered components as a map
   */
  getAllComponents(): Map<string, T> {
    const map = new Map<string, T>();
    for (const [name, fieldComponent] of this.components) {
      map.set(name, fieldComponent.component);
    }
    return map;
  }

  /**
   * Check if a component is registered with a given name
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Unregister a component by name
   */
  unregister(name: string): boolean {
    return this.components.delete(name);
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
  }
}
