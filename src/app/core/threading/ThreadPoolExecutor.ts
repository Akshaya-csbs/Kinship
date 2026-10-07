import { Thread } from "./Thread";
import { IRunnable } from "../interfaces/IRunnable";
import { Queue } from "../collections/Queue";
import { PriorityQueue } from "../collections/PriorityQueue";

export interface TaskRecord {
  id: string;
  name: string;
  threadName: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  submittedAt: string;
  executionMs: number;
}

/**
 * Java Concurrency Utility - ThreadPoolExecutor
 * Manages a fixed pool of background worker threads executing asynchronous tasks in parallel/queue.
 */
export class ThreadPoolExecutor {
  private static instance: ThreadPoolExecutor;
  private corePoolSize: number;
  private activeThreads: number = 0;
  private taskQueue: Queue<{ id: string; name: string; action: () => Promise<void>; priority: number }>;
  private taskHistory: TaskRecord[] = [];
  private listeners: ((tasks: TaskRecord[]) => void)[] = [];

  private constructor(corePoolSize: number = 4) {
    this.corePoolSize = corePoolSize;
    // Priority queue where lower number = higher priority
    this.taskQueue = new PriorityQueue((a, b) => a.priority - b.priority);
  }

  public static getInstance(): ThreadPoolExecutor {
    if (!ThreadPoolExecutor.instance) {
      ThreadPoolExecutor.instance = new ThreadPoolExecutor(4);
    }
    return ThreadPoolExecutor.instance;
  }

  public submitTask(name: string, action: () => Promise<void>, priority: number = 5): string {
    const id = "TASK-" + Math.floor(1000 + Math.random() * 9000);
    const record: TaskRecord = {
      id,
      name,
      threadName: "Pending...",
      status: "QUEUED",
      submittedAt: new Date().toLocaleTimeString(),
      executionMs: 0,
    };

    this.taskHistory.unshift(record);
    if (this.taskHistory.length > 25) this.taskHistory.pop();
    this.notifyListeners();

    this.taskQueue.offer({ id, name, action, priority });
    this.processNextTask();
    return id;
  }

  private async processNextTask(): Promise<void> {
    if (this.activeThreads >= this.corePoolSize || this.taskQueue.isEmpty()) {
      return;
    }

    const task = this.taskQueue.poll();
    if (!task) return;

    this.activeThreads++;
    const threadName = `WorkerPoolThread-${this.activeThreads}`;

    // Update record
    const record = this.taskHistory.find((t) => t.id === task.id);
    if (record) {
      record.status = "RUNNING";
      record.threadName = threadName;
      this.notifyListeners();
    }

    const start = Date.now();
    const thread = new Thread({
      run: async () => {
        await task.action();
      },
    }, threadName);

    try {
      await thread.start();
      if (record) {
        record.status = "COMPLETED";
        record.executionMs = Date.now() - start;
      }
    } catch (err) {
      if (record) {
        record.status = "FAILED";
        record.executionMs = Date.now() - start;
      }
    } finally {
      this.activeThreads--;
      this.notifyListeners();
      // Process next queued task
      this.processNextTask();
    }
  }

  public getTaskHistory(): TaskRecord[] {
    return [...this.taskHistory];
  }

  public subscribe(listener: (tasks: TaskRecord[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getTaskHistory());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const history = this.getTaskHistory();
    this.listeners.forEach((l) => l(history));
  }
}
