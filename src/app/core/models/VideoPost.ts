import { Post } from "./Post";
import { User } from "./User";

/**
 * Subclass representing Video Post
 */
export class VideoPost extends Post {
  private _durationSeconds: number;

  constructor(
    id: number,
    creator: User,
    content: string,
    mediaUrl: string,
    durationSeconds: number = 60,
    likes: number = 0,
    comments: number = 0,
    shares: number = 0,
    timestamp: string = "Just now"
  ) {
    super(id, creator, content, mediaUrl, likes, comments, shares, timestamp);
    this._durationSeconds = durationSeconds;
  }

  public getDurationSeconds(): number {
    return this._durationSeconds;
  }

  public getPostType(): "video" {
    return "video";
  }

  public renderBadgeLabel(): string {
    return "🎥 Video";
  }

  public getDisplaySummary(): string {
    return `[Video Post #${this.getId()}] (${this._durationSeconds}s) by ${this.getCreator().getName()}: "${this.getContent()}"`;
  }
}
