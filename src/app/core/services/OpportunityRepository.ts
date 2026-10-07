import { IRepository } from "../interfaces/IRepository";
import { Opportunity } from "../models/Opportunity";
import { ArrayList } from "../collections/ArrayList";
import { List } from "../collections/List";
import { HashMap } from "../collections/HashMap";

/**
 * Repository for Opportunity objects using HashMap & ArrayList
 */
export class OpportunityRepository implements IRepository<Opportunity, number> {
  private oppMap: HashMap<number, Opportunity>;

  constructor() {
    this.oppMap = new HashMap<number, Opportunity>();
  }

  public save(opportunity: Opportunity): Opportunity {
    this.oppMap.put(opportunity.getId(), opportunity);
    return opportunity;
  }

  public findById(id: number): Opportunity | null {
    return this.oppMap.get(id);
  }

  public findAll(): List<Opportunity> {
    return ArrayList.fromArray(this.oppMap.values());
  }

  public findByCategory(category: string): List<Opportunity> {
    const all = this.findAll();
    return all.filter((opp) => opp.getCategory().toLowerCase() === category.toLowerCase());
  }

  public deleteById(id: number): boolean {
    return this.oppMap.remove(id) !== null;
  }

  public count(): number {
    return this.oppMap.size();
  }
}
