package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.Map;

public class VideoPost extends Post {
    private final int durationSeconds;

    public VideoPost(long id, User creator, String content, String mediaUrl, int durationSeconds, int likes,
                     int comments, int shares, LocalDateTime createdAt) {
        super(id, creator, content, mediaUrl, likes, comments, shares, createdAt);
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
        return "Video";
    }

    @Override
    public String getDisplaySummary() {
        return super.getDisplaySummary() + " (" + durationSeconds + "s)";
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("durationSeconds", durationSeconds);
        return json;
    }
}
