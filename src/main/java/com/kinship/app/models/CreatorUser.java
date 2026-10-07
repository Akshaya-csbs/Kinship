package com.kinship.app.models;

import com.kinship.app.exceptions.ValidationException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * OOP: INHERITANCE. A concrete {@link User} that publishes creative work.
 */
public class CreatorUser extends User {
    private final List<String> achievements;
    private final boolean verified;

    public CreatorUser(long id, String name, String username, String email, String bio, String image, String location,
                       List<String> talents, int followers, int following, boolean verified, List<String> achievements,
                       LocalDateTime createdAt) throws ValidationException {
        super(id, name, username, email, bio, image, location, talents, followers, following, createdAt);
        this.achievements = achievements != null ? new ArrayList<>(achievements) : new ArrayList<>();
        this.verified = verified;
    }

    public List<String> getAchievements() {
        return new ArrayList<>(achievements);
    }

    public boolean isVerified() {
        return verified;
    }

    @Override
    public String getUserType() {
        return "Creator";
    }

    @Override
    public String getDisplaySummary() {
        return "Creator: " + getName() + " (" + getUsername() + ") | Talents: " + String.join(", ", getTalents());
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("verified", verified);
        json.put("achievements", getAchievements());
        return json;
    }
}
