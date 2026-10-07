import { CreatorRepository } from "./CreatorRepository";
import { PostRepository } from "./PostRepository";
import { OpportunityRepository } from "./OpportunityRepository";
import { TalentMatchingEngine } from "./TalentMatchingEngine";
import { CreatorUser } from "../models/CreatorUser";
import { ImagePost } from "../models/ImagePost";
import { VideoPost } from "../models/VideoPost";
import { CollaborationPost } from "../models/CollaborationPost";
import { EventOpportunity, GigOpportunity, WorkshopOpportunity } from "../models/Opportunity";
import { ThreadPoolExecutor } from "../threading/ThreadPoolExecutor";
import { GlobalExceptionHandler } from "../exceptions/GlobalExceptionHandler";
import { EntityNotFoundException, ValidationException, KinshipException } from "../exceptions/KinshipException";
import { mockCreators, mockPosts, mockOpportunities } from "../../data/mockData";

/**
 * Singleton Facade - Central entrypoint for Kinship OOP Architecture Engine
 */
export class KinshipPlatformFacade {
  private static instance: KinshipPlatformFacade;

  private creatorRepo: CreatorRepository;
  private postRepo: PostRepository;
  private oppRepo: OpportunityRepository;
  private matchingEngine: TalentMatchingEngine;
  private threadPool: ThreadPoolExecutor;
  private exceptionHandler: GlobalExceptionHandler;

  private constructor() {
    this.creatorRepo = new CreatorRepository();
    this.postRepo = new PostRepository();
    this.oppRepo = new OpportunityRepository();
    this.threadPool = ThreadPoolExecutor.getInstance();
    this.exceptionHandler = GlobalExceptionHandler.getInstance();
    this.matchingEngine = new TalentMatchingEngine(this.creatorRepo, this.oppRepo);

    this.bootstrapMockData();
  }

  public static getInstance(): KinshipPlatformFacade {
    if (!KinshipPlatformFacade.instance) {
      KinshipPlatformFacade.instance = new KinshipPlatformFacade();
    }
    return KinshipPlatformFacade.instance;
  }

  private bootstrapMockData(): void {
    try {
      // Populate CreatorUser objects
      for (const creatorData of mockCreators) {
        const creator = new CreatorUser(
          creatorData.id,
          creatorData.name,
          creatorData.username,
          creatorData.bio,
          creatorData.image,
          creatorData.location,
          creatorData.talents,
          creatorData.followers,
          creatorData.following,
          creatorData.verified,
          creatorData.achievements
        );
        this.creatorRepo.save(creator);
      }

      // Populate Posts (Polymorphic instances)
      for (const p of mockPosts) {
        const creator = this.creatorRepo.findById(p.creator.id) || this.creatorRepo.findAll().get(0);

        if (p.type === "video") {
          const post = new VideoPost(p.id, creator, p.content, p.media, 45, p.likes, p.comments, p.shares, p.timestamp);
          this.postRepo.save(post);
        } else if (p.type === "collab") {
          const post = new CollaborationPost(p.id, creator, p.content, p.media, [], p.likes, p.comments, p.shares, p.timestamp);
          this.postRepo.save(post);
        } else {
          const post = new ImagePost(p.id, creator, p.content, p.media, p.likes, p.comments, p.shares, p.timestamp);
          this.postRepo.save(post);
        }
      }

      // Populate Opportunities
      for (const o of mockOpportunities) {
        if (o.type === "Event") {
          this.oppRepo.save(new EventOpportunity(o.id, o.title, o.category, o.location, o.date, o.description, o.image, o.applicants));
        } else if (o.type === "Gig") {
          this.oppRepo.save(new GigOpportunity(o.id, o.title, o.category, o.location, o.date, o.description, o.image, o.applicants));
        } else {
          this.oppRepo.save(new WorkshopOpportunity(o.id, o.title, o.category, o.location, o.date, o.description, o.image, o.applicants));
        }
      }
    } catch (err: any) {
      this.exceptionHandler.handleException(err);
    }
  }

  // Repository Accessors
  public getCreatorRepository(): CreatorRepository {
    return this.creatorRepo;
  }

  public getPostRepository(): PostRepository {
    return this.postRepo;
  }

  public getOpportunityRepository(): OpportunityRepository {
    return this.oppRepo;
  }

  public getThreadPool(): ThreadPoolExecutor {
    return this.threadPool;
  }

  public getExceptionHandler(): GlobalExceptionHandler {
    return this.exceptionHandler;
  }

  // Convenience methods returning JSON-serializable structures for React screens
  public getFeedPostsJSON(): any[] {
    return this.postRepo.getTrendingPosts().map((p) => p.toJSON()).toArray();
  }

  public getCreatorsJSON(): any[] {
    return this.creatorRepo.findAll().map((c) => c.toJSON()).toArray();
  }

  public getOpportunitiesJSON(): any[] {
    return this.oppRepo.findAll().map((o) => o.toJSON()).toArray();
  }

  public createPost(content: string, type: "image" | "video" | "collab" = "image", mediaUrl: string): any {
    try {
      if (!content || content.trim().length === 0) {
        throw new ValidationException("Post content cannot be empty", ["Content is required"]);
      }

      const creator = this.creatorRepo.findAll().get(0); // Current logged-in user
      const id = Date.now();
      let post: any;

      if (type === "video") {
        post = new VideoPost(id, creator, content, mediaUrl, 30, 0, 0, 0, "Just now");
      } else if (type === "collab") {
        post = new CollaborationPost(id, creator, content, mediaUrl, [], 0, 0, 0, "Just now");
      } else {
        post = new ImagePost(id, creator, content, mediaUrl, 0, 0, 0, "Just now");
      }

      this.postRepo.save(post);

      // Async thread task to index post for feed
      this.threadPool.submitTask(`IndexFeedPost-${id}`, async () => {
        console.log(`[ThreadPool] Feed indexer processed post #${id}`);
      }, 3);

      return post.toJSON();
    } catch (err: any) {
      this.exceptionHandler.handleException(err);
      throw err;
    }
  }

  public triggerDemoException(type: "NOT_FOUND" | "VALIDATION" | "GENERIC"): void {
    try {
      if (type === "NOT_FOUND") {
        throw new EntityNotFoundException("CreatorUser", 9999);
      } else if (type === "VALIDATION") {
        throw new ValidationException("Invalid email address format.", ["Email field missing '@' domain"]);
      } else {
        throw new KinshipException("Critical system sync operation timed out.", "ERR_SYNC_TIMEOUT");
      }
    } catch (err: any) {
      this.exceptionHandler.handleException(err);
    }
  }

  public triggerDemoThreadTask(): void {
    const taskId = Math.floor(Math.random() * 100);
    this.threadPool.submitTask(
      `TalentMatchingWorker-#${taskId}`,
      async () => {
        let count = 0;
        for (let i = 0; i < 5000000; i++) {
          count += i;
        }
      },
      Math.floor(Math.random() * 5) + 1
    );
  }
}
