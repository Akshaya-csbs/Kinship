import { User } from "./User";
import { ArrayList } from "../collections/ArrayList";
import { List } from "../collections/List";

/**
 * OOP Concept: INHERITANCE (Extends User), POLYMORPHISM, ENCAPSULATION
 */
export class CreatorUser extends User {
  private _talents: ArrayList<string>;
  private _achievements: ArrayList<string>;
  private _verified: boolean;

  constructor(
    id: number,
    name: string,
    username: string,
    bio: string,
    image: string,
    location: string,
    talents: string[],
    followers: number = 0,
    following: number = 0,
    verified: boolean = false,
    achievements: string[] = []
  ) {
    super(id, name, username, bio, image, location, followers, following);
    this._talents = ArrayList.fromArray(talents);
    this._achievements = ArrayList.fromArray(achievements);
    this._verified = verified;
  }

  public getTalents(): string[] {
    return this._talents.toArray();
  }

  public getAchievements(): string[] {
    return this._achievements.toArray();
  }

  public isVerified(): boolean {
    return this._verified;
  }

  public addTalent(talent: string): void {
    if (!this._talents.contains(talent)) {
      this._talents.add(talent);
      this.markUpdated();
    }
  }

  public addAchievement(achievement: string): void {
    this._achievements.add(achievement);
    this.markUpdated();
  }

  // Polymorphic implementation of abstract method
  public getDisplaySummary(): string {
    return `Creator: ${this.getName()} (${this.getUsername()}) · ${this.getTalents().join(", ")} · ${this.getFollowers()} Followers`;
  }

  public getUserType(): string {
    return "Creator";
  }

  // Helper method to convert back to plain object for React props backward compatibility
  public toJSON(): any {
    return {
      id: this.getId(),
      name: this.getName(),
      username: this.getUsername(),
      bio: this.getBio(),
      image: this.getImage(),
      talents: this.getTalents(),
      followers: this.getFollowers(),
      following: this.getFollowing(),
      verified: this.isVerified(),
      location: this.getLocation(),
      achievements: this.getAchievements(),
    };
  }
}
