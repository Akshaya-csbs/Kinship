package com.kinship.app.models;

public class ImagePost extends Post {
    public ImagePost(long id, User creator, String content, String mediaUrl, int likes, int comments, int shares, String timestamp) {
        super(id, creator, content, mediaUrl, likes, comments, shares, timestamp);
    }

    @Override
    public String getPostType() {
        return "image";
    }

    @Override
    public String renderBadgeLabel() {
        return "🖼️ Photo";
    }

    @Override
    public String getDisplaySummary() {
        return "[Image Post #" + getId() + "] by " + getCreator().getName() + ": \"" + getContent() + "\"";
    }
}
