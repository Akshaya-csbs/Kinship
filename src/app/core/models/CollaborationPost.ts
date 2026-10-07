import { Post } from "./Post";
import { User } from "./User";

/**
 * Subclass representing Collaboration Post
 */
export class CollaborationPost extends Post {
  private _collaborators: User[];

  constructor(
    id: number,
    creator: User,
    content: string,
    mediaUrl: string,
    collaborators: User[] = [],
    likes: number = 0,
    comments: number = 0,
    shares: number = 0,
    timestamp: string = "Just now"
  ) {
    super(id, creator, content, mediaUrl, likes, comments, shares, timestamp);
    this._collaborators = collaborators;
  }

  public getCollaborators(): User[] {
    return this._collaborators;
  }

  public getPostType(): "collab" {
    return "collab";
  }

  public renderBadgeLabel(): string {
    return "🤝 Collab";
  }

  public getDisplaySummary(): string {
    const collabNames = this._collaborators.map((c) => c.getName()).join(", ");
    return `[Collab Post #${this.getId()}] ${this.getCreator().getName()} feat. ${collabNames}: "${this.getContent()}"`;
  }

  public override toJSON(): any {
    const json = super.toJSON();
    json.isCollaboration = true;
    json.collaborators = this._collaborators.map((c) => c.getName());
    return json;
  }
}
