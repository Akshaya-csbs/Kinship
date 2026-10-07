package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.Map;

public class Notification extends AbstractEntity {
    public enum Type { LIKE, COMMENT, FOLLOW, COLLABORATION, MESSAGE, ACHIEVEMENT, SYSTEM }

    private final long recipientId;
    private final User actor;
    private final Type type;
    private final String action;
    private final String content;
    private final boolean read;

    public Notification(long id, long recipientId, User actor, Type type, String action, String content, boolean read,
                        LocalDateTime createdAt) {
        super(id, createdAt);
        this.recipientId = recipientId;
        this.actor = actor;
        this.type = type;
        this.action = action;
        this.content = content;
        this.read = read;
    }

    public long getRecipientId() { return recipientId; }
    public User getActor() { return actor; }
    public Type getType() { return type; }
    public String getAction() { return action; }
    public String getContent() { return content; }
    public boolean isRead() { return read; }

    @Override
    public String getDisplaySummary() {
        return "Notification[" + type + "] to user #" + recipientId + ": " + action;
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("type", type.name().toLowerCase());
        json.put("action", action);
        json.put("content", content);
        json.put("read", read);
        json.put("user", actor != null ? actor.toJson() : null);
        return json;
    }
}
