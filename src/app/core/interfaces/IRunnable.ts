/**
 * Java Runnable Interface representation
 */
export interface IRunnable {
  run(): void | Promise<void>;
}

export interface Callable<V> {
  call(): V | Promise<V>;
}
