/**
 * OOP Concept: ABSTRACTION & ENCAPSULATION
 * Abstract Base Class for all domain entities.
 */
export abstract class AbstractEntity {
  private readonly _id: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: number) {
    if (new.target === AbstractEntity) {
      throw new Error("Cannot instantiate abstract class AbstractEntity directly.");
    }
    this._id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Encapsulated Getters
  public getId(): number {
    return this._id;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  protected markUpdated(): void {
    this._updatedAt = new Date();
  }

  /**
   * Abstract Method - Every derived domain entity must provide its display summary.
   * OOP Concept: POLYMORPHISM
   */
  public abstract getDisplaySummary(): string;
}
