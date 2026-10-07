import { CreatorRepository } from "./CreatorRepository";
import { OpportunityRepository } from "./OpportunityRepository";
import { ThreadPoolExecutor } from "../threading/ThreadPoolExecutor";
import { CreatorUser } from "../models/CreatorUser";
import { Opportunity } from "../models/Opportunity";
import { ArrayList } from "../collections/ArrayList";
import { List } from "../collections/List";

export interface MatchResult {
  creator: CreatorUser;
  opportunity: Opportunity;
  score: number;
}

/**
 * Multithreaded Talent Matching Engine Service
 */
export class TalentMatchingEngine {
  private creatorRepo: CreatorRepository;
  private oppRepo: OpportunityRepository;
  private executor: ThreadPoolExecutor;

  constructor(creatorRepo: CreatorRepository, oppRepo: OpportunityRepository) {
    this.creatorRepo = creatorRepo;
    this.oppRepo = oppRepo;
    this.executor = ThreadPoolExecutor.getInstance();
  }

  /**
   * Asynchronously compute talent match matrix using background thread pool
   */
  public async computeMatchesAsync(opportunityId: number): Promise<List<MatchResult>> {
    const opp = this.oppRepo.findById(opportunityId);
    if (!opp) return new ArrayList<MatchResult>();

    return new Promise((resolve) => {
      this.executor.submitTask(
        `ComputeTalentMatchForOpp-${opportunityId}`,
        async () => {
          // Simulate compute work in worker thread
          const creators = this.creatorRepo.findAll();
          const results = new ArrayList<MatchResult>();

          for (let i = 0; i < creators.size(); i++) {
            const creator = creators.get(i);
            const score = creator.getMatchScore([opp.getCategory()]);
            if (score > 0) {
              results.add({ creator, opportunity: opp, score });
            }
          }
          resolve(results);
        },
        1 // High priority thread task
      );
    });
  }
}
