import { AbstractEntity } from "./AbstractEntity";

/**
 * Opportunity Abstract Base Class
 */
export abstract class Opportunity extends AbstractEntity {
  private _title: string;
  private _category: string;
  private _location: string;
  private _date: string;
  private _description: string;
  private _image: string;
  private _applicants: number;

  constructor(
    id: number,
    title: string,
    category: string,
    location: string,
    date: string,
    description: string,
    image: string,
    applicants: number = 0
  ) {
    super(id);
    this._title = title;
    this._category = category;
    this._location = location;
    this._date = date;
    this._description = description;
    this._image = image;
    this._applicants = applicants;
  }

  public getTitle(): string {
    return this._title;
  }

  public getCategory(): string {
    return this._category;
  }

  public getLocation(): string {
    return this._location;
  }

  public getDate(): string {
    return this._date;
  }

  public getDescription(): string {
    return this._description;
  }

  public getImage(): string {
    return this._image;
  }

  public getApplicants(): number {
    return this._applicants;
  }

  public apply(): void {
    this._applicants++;
    this.markUpdated();
  }

  public abstract getType(): "Event" | "Gig" | "Workshop";

  public toJSON(): any {
    return {
      id: this.getId(),
      title: this._title,
      type: this.getType(),
      category: this._category,
      location: this._location,
      date: this._date,
      description: this._description,
      image: this._image,
      applicants: this._applicants,
    };
  }
}

export class EventOpportunity extends Opportunity {
  public getType(): "Event" {
    return "Event";
  }
  public getDisplaySummary(): string {
    return `[Event] ${this.getTitle()} - ${this.getLocation()} (${this.getDate()})`;
  }
}

export class GigOpportunity extends Opportunity {
  public getType(): "Gig" {
    return "Gig";
  }
  public getDisplaySummary(): string {
    return `[Gig] ${this.getTitle()} - ${this.getLocation()} (${this.getDate()})`;
  }
}

export class WorkshopOpportunity extends Opportunity {
  public getType(): "Workshop" {
    return "Workshop";
  }
  public getDisplaySummary(): string {
    return `[Workshop] ${this.getTitle()} - ${this.getLocation()} (${this.getDate()})`;
  }
}
