package com.kinship.app.models;

import java.time.LocalDateTime;

/**
 * Factory pattern: builds the right {@link Post} subclass from the post_type column.
 */
public final class PostFactory {
    public static final int DEFAULT_VIDEO_SECONDS = 45;

    private PostFactory() {}

    public static Post create(String type, long id, User creator, String content, String mediaUrl,
                              int likes, int comments, int shares, LocalDateTime createdAt) {
        String normalized = type == null ? "image" : type.toLowerCase();
        return switch (normalized) {
            case "video" -> new VideoPost(id, creator, content, mediaUrl, DEFAULT_VIDEO_SECONDS, likes, comments, shares, createdAt);
            case "collab" -> new CollabPost(id, creator, content, mediaUrl, likes, comments, shares, createdAt);
            default -> new ImagePost(id, creator, content, mediaUrl, likes, comments, shares, createdAt);
        };
    }

    public static boolean isSupportedType(String type) {
        return "image".equals(type) || "video".equals(type) || "collab".equals(type);
    }
}
