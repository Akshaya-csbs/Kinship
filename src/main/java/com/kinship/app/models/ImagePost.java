package com.kinship.app.models;

import java.time.LocalDateTime;

public class ImagePost extends Post {
    public ImagePost(long id, User creator, String content, String mediaUrl, int likes, int comments, int shares,
                     LocalDateTime createdAt) {
        super(id, creator, content, mediaUrl, likes, comments, shares, createdAt);
    }

    @Override
    public String getPostType() {
        return "image";
    }

    @Override
    public String renderBadgeLabel() {
        return "Photo";
    }
}
