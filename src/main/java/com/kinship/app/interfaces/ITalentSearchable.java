package com.kinship.app.interfaces;

import java.util.List;

/**
 * Anything that owns a set of talents and can be matched against other talents.
 */
public interface ITalentSearchable {
    List<String> getTalents();

    default boolean hasTalent(String talentName) {
        return getTalents().stream().anyMatch(t -> t.equalsIgnoreCase(talentName));
    }

    /** Percentage (0-100) of {@code requiredTalents} this object covers. */
    default int getMatchScore(List<String> requiredTalents) {
        if (requiredTalents == null || requiredTalents.isEmpty()) {
            return 0;
        }
        long matches = requiredTalents.stream().filter(this::hasTalent).count();
        return (int) Math.round((double) matches / requiredTalents.size() * 100);
    }
}
