import { List } from "./List";
import { IndexOutOfBoundsException } from "../exceptions/IndexOutOfBoundsException";

/**
 * Java Collection Framework - ArrayList Implementation
 * Dynamic array list with generic type support and Java List methods.
 */
export class ArrayList<T> implements List<T> {
  private elementData: T[];
  private _size: number;

  constructor(initialCapacity: number = 10) {
    this.elementData = new Array<T>(initialCapacity);
    this._size = 0;
  }

  public static fromArray<U>(array: U[]): ArrayList<U> {
    const list = new ArrayList<U>(array.length);
    for (const item of array) {
      list.add(item);
    }
    return list;
  }

  public add(item: T): boolean {
    this.ensureCapacity(this._size + 1);
    this.elementData[this._size++] = item;
    return true;
  }

  public addAt(index: number, item: T): void {
    this.checkIndexForAdd(index);
    this.ensureCapacity(this._size + 1);
    for (let i = this._size; i > index; i--) {
      this.elementData[i] = this.elementData[i - 1];
    }
    this.elementData[index] = item;
    this._size++;
  }

  public get(index: number): T {
    this.checkIndex(index);
    return this.elementData[index];
  }

  public remove(item: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.elementData[i] === item) {
        this.removeAt(i);
        return true;
      }
    }
    return false;
  }

  public removeAt(index: number): T {
    this.checkIndex(index);
    const oldValue = this.elementData[index];
    for (let i = index; i < this._size - 1; i++) {
      this.elementData[i] = this.elementData[i + 1];
    }
    this._size--;
    return oldValue;
  }

  public size(): number {
    return this._size;
  }

  public isEmpty(): boolean {
    return this._size === 0;
  }

  public clear(): void {
    this.elementData = [];
    this._size = 0;
  }

  public contains(item: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.elementData[i] === item) {
        return true;
      }
    }
    return false;
  }

  public toArray(): T[] {
    return this.elementData.slice(0, this._size);
  }

  public filter(predicate: (item: T, index: number) => boolean): List<T> {
    const result = new ArrayList<T>();
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.elementData[i], i)) {
        result.add(this.elementData[i]);
      }
    }
    return result;
  }

  public map<U>(transform: (item: T, index: number) => U): List<U> {
    const result = new ArrayList<U>(this._size);
    for (let i = 0; i < this._size; i++) {
      result.add(transform(this.elementData[i], i));
    }
    return result;
  }

  public forEach(action: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      action(this.elementData[i], i);
    }
  }

  public [Symbol.iterator](): Iterator<T> {
    let index = 0;
    const data = this.toArray();
    return {
      next(): IteratorResult<T> {
        if (index < data.length) {
          return { value: data[index++], done: false };
        } else {
          return { value: undefined as any, done: true };
        }
      },
    };
  }

  private ensureCapacity(minCapacity: number): void {
    if (minCapacity > this.elementData.length) {
      const oldCapacity = this.elementData.length;
      let newCapacity = oldCapacity + (oldCapacity >> 1);
      if (newCapacity < minCapacity) {
        newCapacity = minCapacity;
      }
      const newArray = new Array<T>(newCapacity);
      for (let i = 0; i < this._size; i++) {
        newArray[i] = this.elementData[i];
      }
      this.elementData = newArray;
    }
  }

  private checkIndex(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new IndexOutOfBoundsException(`Index: ${index}, Size: ${this._size}`);
    }
  }

  private checkIndexForAdd(index: number): void {
    if (index < 0 || index > this._size) {
      throw new IndexOutOfBoundsException(`Index: ${index}, Size: ${this._size}`);
    }
  }
}
