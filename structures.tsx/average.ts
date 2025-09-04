import { DNF_VALUE, UNKNOWN } from "@/constants/constants";
import { RBTree } from "./rbt";

/**
 * Stores a balanced tree, its sum, and its least and greatest times
 */
export class AverageComponent {
  private sum: number;
  private least: number;
  private greatest: number;
  private tree: RBTree<number>;

  /**
   * This debug flag enables hard-checking every remove to verify that the element being
   * removed does indeed exist. If the check fails, the application will crash.
   */

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
    if (this.least != UNKNOWN && val < this.least) this.least = val;
    if (this.greatest != UNKNOWN && val > this.greatest) this.greatest = val;
  }

  /**
   * Removes an element from tree and updates its sum and best/worst cache
   * @param val The value to be removed
   */
  public remove(val: number) {
    try {
      this.tree.remove(val);
    } catch (error) {
      console.error(
        "AverageComponent",
        "Error while trying to remove value: " + val,
      );
    }
    this.subSum(val);

    // Update least/greatest caches if necessary
    if (this.least != UNKNOWN && val == this.least) this.least = UNKNOWN;
    if (this.greatest != UNKNOWN && val == this.greatest)
      this.greatest = UNKNOWN;
  }

  /**
   * Gets the smallest element of the tree
   * @return The smallest element of the tree
   */
  public getLeast() {
    // Cache request
    if (this.least == UNKNOWN && this.tree.size > 0)
      this.least = this.tree.getLeast() as number;
    return this.least;
  }

  /**
   * Gets the biggest element of the tree
   * @return The biggest element of the tree
   */
  public getGreatest(): number {
    // Cache request
    if (this.greatest === UNKNOWN && this.tree.size > 0)
      this.greatest = this.tree.getGreatest() as number;
    return this.greatest;
  }

  /**
   * Gets the sum of all elements of the tree
   * @return The sum of all elements of the tree
   */
  public getSum() {
    return this.sum;
  }

  public getTree() {
    return this.tree;
  }

  /**
   * Adds a value to the total sum of the tree
   * @param val The value to be added
   */
  private addSum(val: number): void {
    if (val != DNF_VALUE) this.sum = (this.sum == UNKNOWN ? 0 : this.sum) + val;
  }

  /**
   * Removes a value from the total sum of the tree
   * @param val The value to be removed
   */
  private subSum(val: number) {
    if (val != DNF_VALUE && this.sum != 0)
      this.sum = (this.sum == UNKNOWN ? 0 : this.sum) - val;
  }
}
