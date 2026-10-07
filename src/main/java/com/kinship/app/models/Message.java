package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.Map;

public class Message extends AbstractEntity {
    private final long senderId;
    private final long receiverId;
    private final String content;
    private final boolean read;

    public Message(long id, long senderId, long receiverId, String content, boolean read, LocalDateTime createdAt) {
        super(id, createdAt);
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.read = read;
    }

    public long getSenderId() { return senderId; }
    public long getReceiverId() { return receiverId; }
    public String getContent() { return content; }
    public boolean isRead() { return read; }

    @Override
    public String getDisplaySummary() {
        return "Message #" + getId() + " " + senderId + " -> " + receiverId;
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("senderId", senderId);
        json.put("receiverId", receiverId);
        json.put("content", content);
        json.put("read", read);
        return json;
    }
}
