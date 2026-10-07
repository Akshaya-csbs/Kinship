import { AbstractEntity } from "./AbstractEntity";
import { User } from "./User";

/**
 * OOP Concept: ABSTRACTION & POLYMORPHISM (Post Base Class)
 */
export abstract class Post extends AbstractEntity {
  private _creator: User;
  private _content: string;
  private _mediaUrl: string;
  private _likes: number;
  private _comments: number;
  private _shares: number;
  private _timestamp: string;

  constructor(
    id: number,
    creator: User,
    content: string,
    mediaUrl: string,
    likes: number = 0,
    comments: number = 0,
    shares: number = 0,
    timestamp: string = "Just now"
  ) {
    super(id);
    this._creator = creator;
    this._content = content;
    this._mediaUrl = mediaUrl;
    this._likes = likes;
    this._comments = comments;
    this._shares = shares;
    this._timestamp = timestamp;
  }

  // Encapsulation
  public getCreator(): User {
    return this._creator;
  }

  public getContent(): string {
    return this._content;
  }

  public getMediaUrl(): string {
    return this._mediaUrl;
  }

  public getLikes(): number {
    return this._likes;
  }

  public getComments(): number {
    return this._comments;
  }

  public getShares(): number {
    return this._shares;
  }

  public getTimestamp(): string {
    return this._timestamp;
  }

  public likePost(): void {
    this._likes++;
    this.markUpdated();
  }

  public addComment(): void {
    this._comments++;
    this.markUpdated();
  }

  /**
   * Polymorphic method to get Post Type
   */
  public abstract getPostType(): "image" | "video" | "collab";

  /**
   * Polymorphic summary representation
   */
  public abstract renderBadgeLabel(): string;

  public toJSON(): any {
    return {
      id: this.getId(),
      creator: typeof (this._creator as any).toJSON === "function" ? (this._creator as any).toJSON() : this._creator,
      user: {
        name: this._creator.getName(),
        avatar: this._creator.getImage(),
        talents: this._creator.getTalents(),
        followers: `${(this._creator.getFollowers() / 1000).toFixed(1)}k`,
      },
      type: this.getPostType(),
      content: this._mediaUrl,
      media: this._mediaUrl,
      caption: this._content,
      likes: this._likes,
      comments: this._comments,
      shares: this._shares,
      time: this._timestamp,
      timestamp: this._timestamp,
      badge: this.renderBadgeLabel(),
    };
  }
}
