package com.kinship.app.interfaces;

import java.util.List;

/**
 * Java Interface contract for talent searchable entities.
 */
public interface ITalentSearchable {
    List<String> getTalents();
    boolean hasTalent(String talentName);
    int getMatchScore(List<String> requiredTalents);
}
