/**
 * Interface contract for domain entities that can be searched by talents
 */
export interface ITalentSearchable {
  getTalents(): string[];
  hasTalent(talentName: string): boolean;
  getMatchScore(requiredTalents: string[]): number;
}
