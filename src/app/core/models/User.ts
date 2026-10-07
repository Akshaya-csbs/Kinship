import { AbstractEntity } from "./AbstractEntity";
import { ITalentSearchable } from "../interfaces/ITalentSearchable";
import { INotifiable } from "../interfaces/INotifiable";
import { ValidationException } from "../exceptions/KinshipException";

/**
 * OOP Concept: ABSTRACTION, INHERITANCE (Base Class), INTERFACES, ENCAPSULATION
 */
export abstract class User extends AbstractEntity implements ITalentSearchable, INotifiable {
  private _name: string;
  private _username: string;
  private _bio: string;
  private _image: string;
  private _location: string;
  private _followers: number;
  private _following: number;
  private _unreadNotifications: number = 0;

  constructor(
    id: number,
    name: string,
    username: string,
    bio: string,
    image: string,
    location: string,
    followers: number = 0,
    following: number = 0
  ) {
    super(id);
    this.validateName(name);
    this.validateUsername(username);

    this._name = name;
    this._username = username;
    this._bio = bio;
    this._image = image;
    this._location = location;
    this._followers = followers;
    this._following = following;
  }

  // Input Validation with Exception Handling
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException("User name cannot be empty", ["Name is required"]);
    }
  }

  private validateUsername(username: string): void {
    if (!username || !username.startsWith("@")) {
      throw new ValidationException(`Invalid username '${username}'. Username must start with '@'`, ["Username must start with '@'"]);
    }
  }

  // Encapsulation: Getters & Controlled Mutators
  public getName(): string {
    return this._name;
  }

  public getUsername(): string {
    return this._username;
  }

  public getBio(): string {
    return this._bio;
  }

  public getImage(): string {
    return this._image;
  }

  public getLocation(): string {
    return this._location;
  }

  public getFollowers(): number {
    return this._followers;
  }

  public getFollowing(): number {
    return this._following;
  }

  public incrementFollowers(): void {
    this._followers++;
    this.markUpdated();
  }

  public incrementFollowing(): void {
    this._following++;
    this.markUpdated();
  }

  // INotifiable implementation
  public receiveNotification(message: string, type: string): void {
    this._unreadNotifications++;
    console.log(`[User Notification] ${this._username} received [${type}]: ${message}`);
  }

  public getUnreadCount(): number {
    return this._unreadNotifications;
  }

  // ITalentSearchable Abstract Method Signature
  public abstract getTalents(): string[];
  
  public hasTalent(talentName: string): boolean {
    return this.getTalents().some((t) => t.toLowerCase() === talentName.toLowerCase());
  }

  public getMatchScore(requiredTalents: string[]): number {
    if (requiredTalents.length === 0) return 100;
    const userTalents = this.getTalents().map((t) => t.toLowerCase());
    let matches = 0;
    for (const req of requiredTalents) {
      if (userTalents.includes(req.toLowerCase())) {
        matches++;
      }
    }
    return Math.round((matches / requiredTalents.length) * 100);
  }

  public abstract getUserType(): string;
}
