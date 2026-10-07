package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.Map;

public class Comment extends AbstractEntity {
    private final long postId;
    private final User author;
    private final String content;

    public Comment(long id, long postId, User author, String content, LocalDateTime createdAt) {
        super(id, createdAt);
        this.postId = postId;
        this.author = author;
        this.content = content;
    }

    public long getPostId() { return postId; }
    public User getAuthor() { return author; }
    public String getContent() { return content; }

    @Override
    public String getDisplaySummary() {
        return author.getUsername() + " on post #" + postId + ": " + content;
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("postId", postId);
        json.put("content", content);
        json.put("author", author.toJson());
        return json;
    }
}
