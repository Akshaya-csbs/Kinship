import { IRunnable } from "../interfaces/IRunnable";
import { ThreadExecutionException } from "../exceptions/KinshipException";

export enum ThreadState {
  NEW = "NEW",
  RUNNABLE = "RUNNABLE",
  RUNNING = "RUNNING",
  TIMED_WAITING = "TIMED_WAITING",
  TERMINATED = "TERMINATED",
}

/**
 * Java Thread Class implementation
 * Manages thread state lifecycle, execution, and execution timing metrics.
 */
export class Thread implements IRunnable {
  private static idCounter = 1;
  public readonly threadId: number;
  public readonly name: string;
  private state: ThreadState;
  private targetRunnable?: IRunnable;
  private startTime: number = 0;
  private endTime: number = 0;

  constructor(target?: IRunnable, name?: string) {
    this.threadId = Thread.idCounter++;
    this.name = name || `KinshipWorkerThread-${this.threadId}`;
    this.targetRunnable = target;
    this.state = ThreadState.NEW;
  }

  public getState(): ThreadState {
    return this.state;
  }

  public getExecutionTimeMs(): number {
    if (this.state === ThreadState.TERMINATED) {
      return this.endTime - this.startTime;
    }
    if (this.state === ThreadState.RUNNING) {
      return Date.now() - this.startTime;
    }
    return 0;
  }

  public async start(): Promise<void> {
    if (this.state !== ThreadState.NEW) {
      throw new ThreadExecutionException(this.name, "Thread has already been started or terminated.");
    }

    this.state = ThreadState.RUNNABLE;
    await this.run();
  }

  public async run(): Promise<void> {
    this.state = ThreadState.RUNNING;
    this.startTime = Date.now();
    console.log(`[Thread Execution] Thread '${this.name}' started [ID: ${this.threadId}]`);

    try {
      if (this.targetRunnable) {
        await this.targetRunnable.run();
      }
    } catch (err: any) {
      console.error(`[Thread Execution Error] Thread '${this.name}' failed:`, err);
      throw new ThreadExecutionException(this.name, err.message || "Execution exception");
    } finally {
      this.endTime = Date.now();
      this.state = ThreadState.TERMINATED;
      console.log(`[Thread Execution] Thread '${this.name}' terminated cleanly after ${this.getExecutionTimeMs()}ms`);
    }
  }

  public static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
