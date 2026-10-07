package com.kinship.app.models;

import com.kinship.app.interfaces.INotifiable;
import com.kinship.app.interfaces.ITalentSearchable;
import com.kinship.app.exceptions.ValidationException;

import java.util.Collections;
import java.util.List;

/**
 * Java OOP Concept: ABSTRACTION, INHERITANCE, ENCAPSULATION, INTERFACES
 */
public abstract class User extends AbstractEntity implements ITalentSearchable, INotifiable {
    private String name;
    private String username;
    private String bio;
    private String image;
    private String location;
    private int followers;
    private int following;
    private int unreadNotifications;

    public User(long id, String name, String username, String bio, String image, String location, int followers, int following) throws ValidationException {
        super(id);
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Name cannot be empty", Collections.singletonList("Name field required"));
        }
        if (username == null || !username.startsWith("@")) {
            throw new ValidationException("Username must start with '@'", Collections.singletonList("Invalid username format"));
        }

        this.name = name;
        this.username = username;
        this.bio = bio;
        this.image = image;
        this.location = location;
        this.followers = followers;
        this.following = following;
        this.unreadNotifications = 0;
    }

    public String getName() { return name; }
    public String getUsername() { return username; }
    public String getBio() { return bio; }
    public String getImage() { return image; }
    public String getLocation() { return location; }
    public int getFollowers() { return followers; }
    public int getFollowing() { return following; }

    public void incrementFollowers() {
        this.followers++;
        markUpdated();
    }

    @Override
    public Object getId() {
        return super.getId();
    }

    @Override
    public void receiveNotification(String message, String type) {
        this.unreadNotifications++;
        System.out.println("[Notification] " + username + " received: " + message);
    }

    @Override
    public int getUnreadCount() {
        return unreadNotifications;
    }

    @Override
    public boolean hasTalent(String talentName) {
        return getTalents().stream().anyMatch(t -> t.equalsIgnoreCase(talentName));
    }

    @Override
    public int getMatchScore(List<String> requiredTalents) {
        if (requiredTalents == null || requiredTalents.isEmpty()) return 100;
        long matches = requiredTalents.stream()
                .filter(req -> getTalents().stream().anyMatch(t -> t.equalsIgnoreCase(req)))
                .count();
        return (int) Math.round(((double) matches / requiredTalents.size()) * 100);
    }

    public abstract String getUserType();
}
