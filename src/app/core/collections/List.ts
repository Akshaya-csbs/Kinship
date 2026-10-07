/**
 * Java Collection Framework - List Interface
 */
export interface List<T> extends Iterable<T> {
  add(item: T): boolean;
  addAt(index: number, item: T): void;
  get(index: number): T;
  remove(item: T): boolean;
  removeAt(index: number): T;
  size(): number;
  isEmpty(): boolean;
  clear(): void;
  contains(item: T): boolean;
  toArray(): T[];
  filter(predicate: (item: T, index: number) => boolean): List<T>;
  map<U>(transform: (item: T, index: number) => U): List<U>;
  forEach(action: (item: T, index: number) => void): void;
}
