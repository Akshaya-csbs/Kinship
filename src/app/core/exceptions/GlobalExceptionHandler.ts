import { KinshipException } from "./KinshipException";

export interface LoggedException {
  id: string;
  name: string;
  message: string;
  code: string;
  timestamp: string;
}

/**
 * Singleton Exception Handler Manager
 */
export class GlobalExceptionHandler {
  private static instance: GlobalExceptionHandler;
  private exceptionLog: LoggedException[] = [];
  private listeners: ((log: LoggedException[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): GlobalExceptionHandler {
    if (!GlobalExceptionHandler.instance) {
      GlobalExceptionHandler.instance = new GlobalExceptionHandler();
    }
    return GlobalExceptionHandler.instance;
  }

  public handleException(error: Error | KinshipException): void {
    const code = error instanceof KinshipException ? error.errorCode : "ERR_UNHANDLED_EXCEPTION";
    const logged: LoggedException = {
      id: "ERR-" + Math.floor(Math.random() * 100000),
      name: error.name || "Error",
      message: error.message,
      code,
      timestamp: new Date().toLocaleTimeString(),
    };

    console.warn(`[GlobalExceptionHandler] Caught Exception [${code}]:`, error.message);
    this.exceptionLog.unshift(logged);
    if (this.exceptionLog.length > 20) {
      this.exceptionLog.pop();
    }
    this.notifyListeners();
  }

  public getExceptionLogs(): LoggedException[] {
    return [...this.exceptionLog];
  }

  public clearLogs(): void {
    this.exceptionLog = [];
    this.notifyListeners();
  }

  public subscribe(listener: (log: LoggedException[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getExceptionLogs());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const logs = this.getExceptionLogs();
    this.listeners.forEach((l) => l(logs));
  }
}
