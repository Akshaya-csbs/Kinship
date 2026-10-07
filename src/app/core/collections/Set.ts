/**
 * Java Collection Framework - Set Interface
 */
export interface Set<T> extends Iterable<T> {
  add(item: T): boolean;
  remove(item: T): boolean;
  contains(item: T): boolean;
  size(): number;
  isEmpty(): boolean;
  clear(): void;
  toArray(): T[];
}
