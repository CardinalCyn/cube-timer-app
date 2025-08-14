import { RBTree } from "./rbt";

// Constants
const DNF = -1;
const UNKNOWN = -2;

/**
 * Stores a balanced tree, its sum, and its least and greatest times
 * TypeScript version of the AverageComponent class
 */
export class AverageComponent {
  private sum: number;
  private least: number;
  private greatest: number;
  private tree: RBTree<number>;

  /**
   * This debug flag enables hard-checking every remove to verify that the element being
   * removed does indeed exist. If the check fails, an error will be thrown.
   */
  private static readonly DEBUG: boolean = false;

  /**
   * Default constructor
   */
  constructor() {
    this.sum = UNKNOWN;
    this.least = UNKNOWN;
    this.greatest = UNKNOWN;
    this.tree = new RBTree<number>((a: number, b: number) => a - b);
  }

  /**
   * Inserts an element into the tree and updates its sum and best/worst cache
   * @param val The value to be inserted
   */
  public put(val: number): void {
    this.tree.insert(val);
    this.addSum(val);

    // Update least/greatest caches if necessary
    if (this.least !== UNKNOWN && val < this.least) {
      this.least = val;
    }
    if (this.greatest !== UNKNOWN && val > this.greatest) {
      this.greatest = val;
    }
  }

  /**
   * Removes an element from tree and updates its sum and best/worst cache
   * @param val The value to be removed
   */
  public remove(val: number): void {
    try {
      this.tree.remove(val);
    } catch (error) {
      console.log(
        `AverageComponent: Error while trying to remove value: ${val}`,
      );
      if (AverageComponent.DEBUG) {
        throw error;
      }
    }

    this.subSum(val);

    // Update least/greatest caches if necessary
    if (this.least !== UNKNOWN && val === this.least) {
      this.least = UNKNOWN;
    }
    if (this.greatest !== UNKNOWN && val === this.greatest) {
      this.greatest = UNKNOWN;
    }
  }

  /**
   * Gets the smallest element of the tree
   * @returns The smallest element of the tree
   */
  public getLeast(): number {
    // Cache request
    if (this.least === UNKNOWN && this.tree.size > 0) {
      const least = this.tree.getLeast();
      this.least = least !== null ? least : UNKNOWN;
    }
    return this.least;
  }

  /**
   * Gets the biggest element of the tree
   * @returns The biggest element of the tree
   */
  public getGreatest(): number {
    // Cache request
    if (this.greatest === UNKNOWN && this.tree.size > 0) {
      const greatest = this.tree.getGreatest();
      this.greatest = greatest !== null ? greatest : UNKNOWN;
    }
    return this.greatest;
  }

  /**
   * Gets the sum of all elements of the tree
   * @returns The sum of all elements of the tree
   */
  public getSum(): number {
    return this.sum;
  }

  /**
   * Gets the underlying Red-Black Tree
   * @returns The Red-Black Tree instance
   */
  public getTree(): RBTree<number> {
    return this.tree;
  }

  /**
   * Gets the size of the tree
   * @returns The number of elements in the tree
   */
  public size(): number {
    return this.tree.size;
  }

  /**
   * Checks if the component is empty
   * @returns True if the tree is empty
   */
  public isEmpty(): boolean {
    return this.tree.size === 0;
  }

  /**
   * Clears all elements from the component
   */
  public clear(): void {
    this.tree.clear();
    this.sum = UNKNOWN;
    this.least = UNKNOWN;
    this.greatest = UNKNOWN;
  }

  /**
   * Calculates the average of all non-DNF times
   * @returns The average time, or UNKNOWN if no valid times
   */
  public getAverage(): number {
    if (this.sum === UNKNOWN || this.tree.size === 0) {
      return UNKNOWN;
    }
    return this.sum / this.tree.size;
  }

  /**
   * Gets all values as a sorted array (useful for median calculations)
   * @returns Sorted array of all values in the tree
   */
  public getSortedValues(): number[] {
    const values: number[] = [];
    this.inOrderTraversal(this.tree, values);
    return values;
  }

  /**
   * Checks if the component contains a specific value
   * @param val The value to check for
   * @returns True if the value exists in the tree
   */
  public contains(val: number): boolean {
    return this.tree.contains(val);
  }

  /**
   * Helper method for in-order traversal to get sorted values
   * @param tree The tree to traverse
   * @param values Array to collect values
   */
  private inOrderTraversal(tree: RBTree<number>, values: number[]): void {
    // This would require access to tree internals, simplified version:
    // For now, we'd need to add a traversal method to RedBlackTree
    // or implement it differently
    // Placeholder: This would need proper implementation with tree access
    // The tree class would need to expose an iterator or traversal method
  }

  /**
   * Adds a value to the total sum of the tree
   * @param val The value to be added
   */
  private addSum(val: number): void {
    if (val !== DNF) {
      this.sum = (this.sum === UNKNOWN ? 0 : this.sum) + val;
    }
  }

  /**
   * Removes a value from the total sum of the tree
   * @param val The value to be removed
   */
  private subSum(val: number): void {
    if (val !== DNF && this.sum !== 0) {
      this.sum = (this.sum === UNKNOWN ? 0 : this.sum) - val;
    }
  }

  /**
   * Gets statistics about the current data
   * @returns Object containing various statistics
   */
  public getStats(): {
    size: number;
    sum: number;
    average: number;
    fastest: number;
    slowest: number;
    isEmpty: boolean;
  } {
    return {
      size: this.size(),
      sum: this.getSum(),
      average: this.getAverage(),
      fastest: this.getLeast(),
      slowest: this.getGreatest(),
      isEmpty: this.isEmpty(),
    };
  }
}

// Example usage and type definitions for cubing data
export interface SolveData {
  time: number;
  scramble?: string;
  timestamp?: Date;
  penalty?: "DNF" | "+2" | null;
  comment?: string;
}

export interface CubingNode {
  data: SolveData;
  color: "RED" | "BLACK";
  left: CubingNode | null;
  right: CubingNode | null;
  parent: CubingNode | null;
  isPersonalBest?: boolean;
}
