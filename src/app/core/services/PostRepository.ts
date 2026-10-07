import { IRepository } from "../interfaces/IRepository";
import { Post } from "../models/Post";
import { ArrayList } from "../collections/ArrayList";
import { List } from "../collections/List";
import { PriorityQueue } from "../collections/PriorityQueue";
import { EntityNotFoundException } from "../exceptions/KinshipException";

/**
 * Repository for Post instances using Java Collection Framework (ArrayList + PriorityQueue)
 */
export class PostRepository implements IRepository<Post, number> {
  private posts: ArrayList<Post>;

  constructor() {
    this.posts = new ArrayList<Post>();
  }

  public save(post: Post): Post {
    // Remove if exists then add
    this.deleteById(post.getId());
    this.posts.add(post);
    return post;
  }

  public findById(id: number): Post | null {
    for (let i = 0; i < this.posts.size(); i++) {
      if (this.posts.get(i).getId() === id) {
        return this.posts.get(i);
      }
    }
    return null;
  }

  public findByIdOrThrow(id: number): Post {
    const post = this.findById(id);
    if (!post) {
      throw new EntityNotFoundException("Post", id);
    }
    return post;
  }

  public findAll(): List<Post> {
    return this.posts;
  }

  public getTrendingPosts(): List<Post> {
    // Max-heap Priority Queue sorted by likes
    const pq = new PriorityQueue<Post>((a, b) => b.getLikes() - a.getLikes());
    for (let i = 0; i < this.posts.size(); i++) {
      pq.offer(this.posts.get(i));
    }

    const result = new ArrayList<Post>();
    while (!pq.isEmpty()) {
      const p = pq.poll();
      if (p) result.add(p);
    }
    return result;
  }

  public deleteById(id: number): boolean {
    for (let i = 0; i < this.posts.size(); i++) {
      if (this.posts.get(i).getId() === id) {
        this.posts.removeAt(i);
        return true;
      }
    }
    return false;
  }

  public count(): number {
    return this.posts.size();
  }
}
