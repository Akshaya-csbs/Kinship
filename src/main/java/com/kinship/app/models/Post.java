package com.kinship.app.models;

public abstract class Post extends AbstractEntity {
    private final User creator;
    private final String content;
    private final String mediaUrl;
    private int likes;
    private int comments;
    private int shares;
    private final String timestamp;

    public Post(long id, User creator, String content, String mediaUrl, int likes, int comments, int shares, String timestamp) {
        super(id);
        this.creator = creator;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.likes = likes;
        this.comments = comments;
        this.shares = shares;
        this.timestamp = timestamp;
    }

    public User getCreator() { return creator; }
    public String getContent() { return content; }
    public String getMediaUrl() { return mediaUrl; }
    public int getLikes() { return likes; }
    public int getComments() { return comments; }
    public int getShares() { return shares; }
    public String getTimestamp() { return timestamp; }

    public void likePost() {
        this.likes++;
        markUpdated();
    }

    public abstract String getPostType();
    public abstract String renderBadgeLabel();
}
