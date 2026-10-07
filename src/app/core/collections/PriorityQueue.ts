import { Queue } from "./Queue";

/**
 * Comparator type definition
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Java Collection Framework - PriorityQueue Implementation
 * Min-Heap / Max-Heap based priority queue with custom Comparator support.
 */
export class PriorityQueue<T> implements Queue<T> {
  private heap: T[];
  private comparator: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.heap = [];
    this.comparator = comparator || ((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
  }

  public offer(item: T): boolean {
    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
    return true;
  }

  public poll(): T | null {
    if (this.isEmpty()) return null;
    const result = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return result;
  }

  public peek(): T | null {
    return this.isEmpty() ? null : this.heap[0];
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public clear(): void {
    this.heap = [];
  }

  public toArray(): T[] {
    return [...this.heap];
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.comparator(this.heap[index], this.heap[parent]) < 0) {
        this.swap(index, parent);
        index = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    const half = Math.floor(this.heap.length / 2);
    while (index < half) {
      let child = 2 * index + 1;
      const right = child + 1;
      if (right < this.heap.length && this.comparator(this.heap[right], this.heap[child]) < 0) {
        child = right;
      }
      if (this.comparator(this.heap[index], this.heap[child]) <= 0) {
        break;
      }
      this.swap(index, child);
      index = child;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
