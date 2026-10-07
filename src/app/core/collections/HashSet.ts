import { Set } from "./Set";
import { HashMap } from "./HashMap";

/**
 * Java Collection Framework - HashSet Implementation
 * Set implementation backed by a HashMap instance.
 */
export class HashSet<T> implements Set<T> {
  private map: HashMap<T, boolean>;

  constructor() {
    this.map = new HashMap<T, boolean>();
  }

  public add(item: T): boolean {
    const isNew = !this.map.containsKey(item);
    this.map.put(item, true);
    return isNew;
  }

  public remove(item: T): boolean {
    return this.map.remove(item) !== null;
  }

  public contains(item: T): boolean {
    return this.map.containsKey(item);
  }

  public size(): number {
    return this.map.size();
  }

  public isEmpty(): boolean {
    return this.map.isEmpty();
  }

  public clear(): void {
    this.map.clear();
  }

  public toArray(): T[] {
    return this.map.keySet();
  }

  public [Symbol.iterator](): Iterator<T> {
    const array = this.toArray();
    let index = 0;
    return {
      next(): IteratorResult<T> {
        if (index < array.length) {
          return { value: array[index++], done: false };
        } else {
          return { value: undefined as any, done: true };
        }
      },
    };
  }
}
