/**
 * Custom Exception Hierarchy - Base Exception Class
 */
export class KinshipException extends Error {
  public readonly errorCode: string;
  public readonly timestamp: Date;

  constructor(message: string, errorCode: string = "KINSHIP_GENERIC_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundException extends KinshipException {
  constructor(entityName: string, identifier: string | number) {
    super(`${entityName} with identifier '${identifier}' was not found.`, "ERR_ENTITY_NOT_FOUND");
  }
}

export class ValidationException extends KinshipException {
  public readonly validationErrors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message, "ERR_VALIDATION_FAILED");
    this.validationErrors = errors;
  }
}

export class IndexOutOfBoundsException extends KinshipException {
  constructor(message: string) {
    super(message, "ERR_INDEX_OUT_OF_BOUNDS");
  }
}

export class ConcurrencyException extends KinshipException {
  constructor(message: string) {
    super(message, "ERR_CONCURRENCY_LOCK_FAILED");
  }
}

export class ThreadExecutionException extends KinshipException {
  constructor(threadName: string, reason: string) {
    super(`Thread execution failed on [${threadName}]: ${reason}`, "ERR_THREAD_EXECUTION_FAILURE");
  }
}
