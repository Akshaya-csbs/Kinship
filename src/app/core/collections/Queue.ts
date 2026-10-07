/**
 * Java Collection Framework - Queue Interface
 */
export interface Queue<T> {
  offer(item: T): boolean;
  poll(): T | null;
  peek(): T | null;
  size(): number;
  isEmpty(): boolean;
  clear(): void;
  toArray(): T[];
}
