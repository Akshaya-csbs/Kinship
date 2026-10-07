/**
 * Java Collection Framework - Map Entry Interface
 */
export interface MapEntry<K, V> {
  key: K;
  value: V;
}

/**
 * Java Collection Framework - Map Interface
 */
export interface Map<K, V> {
  put(key: K, value: V): V | null;
  get(key: K): V | null;
  remove(key: K): V | null;
  containsKey(key: K): boolean;
  containsValue(value: V): boolean;
  size(): number;
  isEmpty(): boolean;
  clear(): void;
  keySet(): K[];
  values(): V[];
  entrySet(): MapEntry<K, V>[];
  forEach(action: (value: V, key: K) => void): void;
}
