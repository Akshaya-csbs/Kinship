package com.kinship.app.models;

import java.time.LocalDateTime;

/** A post where the creator is looking for collaborators. */
public class CollabPost extends Post {
    public CollabPost(long id, User creator, String content, String mediaUrl, int likes, int comments, int shares,
                      LocalDateTime createdAt) {
        super(id, creator, content, mediaUrl, likes, comments, shares, createdAt);
    }

    @Override
    public String getPostType() {
        return "collab";
    }

    @Override
    public String renderBadgeLabel() {
        return "Looking for Collab";
    }
}
