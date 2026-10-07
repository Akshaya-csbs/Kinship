import { Map, MapEntry } from "./Map";

/**
 * Node structure for HashMap chaining
 */
class HashNode<K, V> implements MapEntry<K, V> {
  key: K;
  value: V;
  next: HashNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

/**
 * Java Collection Framework - HashMap Implementation
 * Hash-table based implementation of the Map interface with bucket chaining.
 */
export class HashMap<K, V> implements Map<K, V> {
  private table: (HashNode<K, V> | null)[];
  private capacity: number;
  private _size: number;
  private loadFactor: number;

  constructor(initialCapacity: number = 16, loadFactor: number = 0.75) {
    this.capacity = initialCapacity;
    this.loadFactor = loadFactor;
    this.table = new Array<HashNode<K, V> | null>(initialCapacity).fill(null);
    this._size = 0;
  }

  private hash(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) % this.capacity;
  }

  public put(key: K, value: V): V | null {
    if (this._size >= this.capacity * this.loadFactor) {
      this.resize();
    }

    const index = this.hash(key);
    let head = this.table[index];

    while (head !== null) {
      if (head.key === key || String(head.key) === String(key)) {
        const oldValue = head.value;
        head.value = value;
        return oldValue;
      }
      head = head.next;
    }

    const newNode = new HashNode<K, V>(key, value);
    newNode.next = this.table[index];
    this.table[index] = newNode;
    this._size++;

    return null;
  }

  public get(key: K): V | null {
    const index = this.hash(key);
    let head = this.table[index];

    while (head !== null) {
      if (head.key === key || String(head.key) === String(key)) {
        return head.value;
      }
      head = head.next;
    }
    return null;
  }

  public remove(key: K): V | null {
    const index = this.hash(key);
    let head = this.table[index];
    let prev: HashNode<K, V> | null = null;

    while (head !== null) {
      if (head.key === key || String(head.key) === String(key)) {
        if (prev !== null) {
          prev.next = head.next;
        } else {
          this.table[index] = head.next;
        }
        this._size--;
        return head.value;
      }
      prev = head;
      head = head.next;
    }
    return null;
  }

  public containsKey(key: K): boolean {
    return this.get(key) !== null;
  }

  public containsValue(value: V): boolean {
    for (let i = 0; i < this.capacity; i++) {
      let head = this.table[i];
      while (head !== null) {
        if (head.value === value) {
          return true;
        }
        head = head.next;
      }
    }
    return false;
  }

  public size(): number {
    return this._size;
  }

  public isEmpty(): boolean {
    return this._size === 0;
  }

  public clear(): void {
    this.table = new Array<HashNode<K, V> | null>(this.capacity).fill(null);
    this._size = 0;
  }

  public keySet(): K[] {
    const keys: K[] = [];
    for (let i = 0; i < this.capacity; i++) {
      let head = this.table[i];
      while (head !== null) {
        keys.push(head.key);
        head = head.next;
      }
    }
    return keys;
  }

  public values(): V[] {
    const vals: V[] = [];
    for (let i = 0; i < this.capacity; i++) {
      let head = this.table[i];
      while (head !== null) {
        vals.push(head.value);
        head = head.next;
      }
    }
    return vals;
  }

  public entrySet(): MapEntry<K, V>[] {
    const entries: MapEntry<K, V>[] = [];
    for (let i = 0; i < this.capacity; i++) {
      let head = this.table[i];
      while (head !== null) {
        entries.push({ key: head.key, value: head.value });
        head = head.next;
      }
    }
    return entries;
  }

  public forEach(action: (value: V, key: K) => void): void {
    const entries = this.entrySet();
    for (const entry of entries) {
      action(entry.value, entry.key);
    }
  }

  private resize(): void {
    const oldTable = this.table;
    this.capacity = this.capacity * 2;
    this.table = new Array<HashNode<K, V> | null>(this.capacity).fill(null);
    this._size = 0;

    for (const headNode of oldTable) {
      let current = headNode;
      while (current !== null) {
        this.put(current.key, current.value);
        current = current.next;
      }
    }
  }
}
