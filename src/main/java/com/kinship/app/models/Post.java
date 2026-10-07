package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * OOP: ABSTRACTION. Concrete post types decide their type name and badge (polymorphism).
 */
public abstract class Post extends AbstractEntity {
    private final User creator;
    private final String content;
    private final String mediaUrl;
    private final int likes;
    private final int comments;
    private final int shares;
    private boolean likedByViewer;

    protected Post(long id, User creator, String content, String mediaUrl, int likes, int comments, int shares,
                   LocalDateTime createdAt) {
        super(id, createdAt);
        this.creator = creator;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.likes = likes;
        this.comments = comments;
        this.shares = shares;
    }

    public User getCreator() { return creator; }
    public String getContent() { return content; }
    public String getMediaUrl() { return mediaUrl; }
    public int getLikes() { return likes; }
    public int getComments() { return comments; }
    public int getShares() { return shares; }
    public boolean isLikedByViewer() { return likedByViewer; }
    public void setLikedByViewer(boolean likedByViewer) { this.likedByViewer = likedByViewer; }

    public abstract String getPostType();

    public abstract String renderBadgeLabel();

    @Override
    public String getDisplaySummary() {
        return "[" + getPostType() + " post #" + getId() + "] by " + creator.getName() + ": \"" + content + "\"";
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("type", getPostType());
        json.put("badge", renderBadgeLabel());
        json.put("content", content);
        json.put("caption", content);
        json.put("media", mediaUrl);
        json.put("likes", likes);
        json.put("comments", comments);
        json.put("shares", shares);
        json.put("liked", likedByViewer);
        json.put("creator", creator.toJson());
        return json;
    }
}
