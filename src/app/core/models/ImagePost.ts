import { Post } from "./Post";
import { User } from "./User";

/**
 * Subclass representing Image Post
 */
export class ImagePost extends Post {
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
    super(id, creator, content, mediaUrl, likes, comments, shares, timestamp);
  }

  public getPostType(): "image" {
    return "image";
  }

  public renderBadgeLabel(): string {
    return "🖼️ Photo";
  }

  public getDisplaySummary(): string {
    return `[Image Post #${this.getId()}] by ${this.getCreator().getName()}: "${this.getContent()}"`;
  }
}
