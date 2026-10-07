import { List } from "../collections/List";

/**
 * Generic Repository interface contract
 */
export interface IRepository<T, ID = number> {
  save(entity: T): T;
  findById(id: ID): T | null;
  findAll(): List<T>;
  deleteById(id: ID): boolean;
  count(): number;
}
