package com.kinship.app.models;

import com.kinship.app.exceptions.ValidationException;

import java.util.ArrayList;
import java.util.List;

/**
 * Java OOP Concept: INHERITANCE (extends User), POLYMORPHISM
 */
public class CreatorUser extends User {
    private final List<String> talents;
    private final List<String> achievements;
    private final boolean verified;

    public CreatorUser(long id, String name, String username, String bio, String image, String location,
                       List<String> talents, int followers, int following, boolean verified, List<String> achievements)
            throws ValidationException {
        super(id, name, username, bio, image, location, followers, following);
        this.talents = new ArrayList<>(talents);
        this.achievements = achievements != null ? new ArrayList<>(achievements) : new ArrayList<>();
        this.verified = verified;
    }

    @Override
    public List<String> getTalents() {
        return talents;
    }

    public List<String> getAchievements() {
        return achievements;
    }

    public boolean isVerified() {
        return verified;
    }

    @Override
    public String getDisplaySummary() {
        return "Creator: " + getName() + " (" + getUsername() + ") | Talents: " + String.join(", ", talents);
    }

    @Override
    public String getUserType() {
        return "Creator";
    }
}
