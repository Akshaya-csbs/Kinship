package com.kinship.app.models;

public class VideoPost extends Post {
    private final int durationSeconds;

    public VideoPost(long id, User creator, String content, String mediaUrl, int durationSeconds, int likes, int comments, int shares, String timestamp) {
        super(id, creator, content, mediaUrl, likes, comments, shares, timestamp);
        this.durationSeconds = durationSeconds;
    }

    public int getDurationSeconds() {
        return durationSeconds;
    }

    @Override
    public String getPostType() {
        return "video";
    }

    @Override
    public String renderBadgeLabel() {
        return "🎥 Video";
    }

    @Override
    public String getDisplaySummary() {
        return "[Video Post #" + getId() + "] (" + durationSeconds + "s) by " + getCreator().getName() + ": \"" + getContent() + "\"";
    }
}
