import { IRepository } from "../interfaces/IRepository";
import { CreatorUser } from "../models/CreatorUser";
import { HashMap } from "../collections/HashMap";
import { ArrayList } from "../collections/ArrayList";
import { List } from "../collections/List";
import { EntityNotFoundException } from "../exceptions/KinshipException";

/**
 * Repository for CreatorUser instances using Java Collection Framework (HashMap + ArrayList)
 */
export class CreatorRepository implements IRepository<CreatorUser, number> {
  private userMap: HashMap<number, CreatorUser>;

  constructor() {
    this.userMap = new HashMap<number, CreatorUser>();
  }

  public save(creator: CreatorUser): CreatorUser {
    this.userMap.put(creator.getId(), creator);
    return creator;
  }

  public findById(id: number): CreatorUser | null {
    return this.userMap.get(id);
  }

  public findByIdOrThrow(id: number): CreatorUser {
    const creator = this.findById(id);
    if (!creator) {
      throw new EntityNotFoundException("CreatorUser", id);
    }
    return creator;
  }

  public findAll(): List<CreatorUser> {
    const creators = this.userMap.values();
    return ArrayList.fromArray(creators);
  }

  public findByTalent(talent: string): List<CreatorUser> {
    const all = this.findAll();
    return all.filter((creator) => creator.hasTalent(talent));
  }

  public deleteById(id: number): boolean {
    return this.userMap.remove(id) !== null;
  }

  public count(): number {
    return this.userMap.size();
  }
}
