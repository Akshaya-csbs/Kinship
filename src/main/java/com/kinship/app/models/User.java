package com.kinship.app.models;

import com.kinship.app.exceptions.ValidationException;
import com.kinship.app.interfaces.INotifiable;
import com.kinship.app.interfaces.ITalentSearchable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * OOP: ABSTRACTION, INHERITANCE, ENCAPSULATION, INTERFACES.
 * Validates its own state in the constructor and setters (throws {@link ValidationException}).
 */
public abstract class User extends AbstractEntity implements ITalentSearchable, INotifiable {
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private String name;
    private final String username;
    private final String email;
    private String bio;
    private String image;
    private String location;
    private int followers;
    private int following;
    private List<String> talents;

    protected User(long id, String name, String username, String email, String bio, String image, String location,
                   List<String> talents, int followers, int following, LocalDateTime createdAt) throws ValidationException {
        super(id, createdAt);
        if (username == null || !username.matches("^@[A-Za-z0-9_.]{2,30}$")) {
            throw new ValidationException("Username must start with '@' and contain 2-30 letters, digits, '_' or '.'");
        }
        if (email != null && !EMAIL.matcher(email).matches()) {
            throw new ValidationException("Email address is not valid");
        }
        setName(name);
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.image = image;
        this.location = location;
        this.followers = followers;
        this.following = following;
        this.talents = talents != null ? new ArrayList<>(talents) : new ArrayList<>();
    }

    public String getName() { return name; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getBio() { return bio; }
    public String getImage() { return image; }
    public String getLocation() { return location; }
    public int getFollowers() { return followers; }
    public int getFollowing() { return following; }

    @Override
    public String getDisplayName() {
        return name;
    }

    @Override
    public List<String> getTalents() {
        return new ArrayList<>(talents);
    }

    public void setName(String name) throws ValidationException {
        if (name == null || name.trim().length() < 2) {
            throw new ValidationException("Name must be at least 2 characters");
        }
        if (name.length() > 100) {
            throw new ValidationException("Name must be at most 100 characters");
        }
        this.name = name.trim();
    }

    public void setBio(String bio) throws ValidationException {
        if (bio != null && bio.length() > 500) {
            throw new ValidationException("Bio must be at most 500 characters");
        }
        this.bio = bio;
    }

    public void setLocation(String location) { this.location = location; }
    public void setImage(String image) { this.image = image; }

    public void setTalents(List<String> talents) throws ValidationException {
        if (talents == null || talents.isEmpty()) {
            throw new ValidationException("Select at least one talent");
        }
        this.talents = new ArrayList<>(talents);
    }

    /** Each concrete user type names itself. */
    public abstract String getUserType();

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("name", name);
        json.put("username", username);
        json.put("bio", bio);
        json.put("image", image);
        json.put("location", location);
        json.put("followers", followers);
        json.put("following", following);
        json.put("talents", getTalents());
        json.put("userType", getUserType());
        return json;
    }
}
