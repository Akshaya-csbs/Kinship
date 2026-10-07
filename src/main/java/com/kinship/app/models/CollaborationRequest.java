package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.Map;

public class CollaborationRequest extends AbstractEntity {
    public enum Status { PENDING, ACCEPTED, DECLINED }

    private final User from;
    private final long toUserId;
    private final String project;
    private final String message;
    private final Status status;

    public CollaborationRequest(long id, User from, long toUserId, String project, String message, Status status,
                                LocalDateTime createdAt) {
        super(id, createdAt);
        this.from = from;
        this.toUserId = toUserId;
        this.project = project;
        this.message = message;
        this.status = status;
    }

    public User getFrom() { return from; }
    public long getToUserId() { return toUserId; }
    public String getProject() { return project; }
    public String getMessage() { return message; }
    public Status getStatus() { return status; }

    @Override
    public String getDisplaySummary() {
        return "CollabRequest '" + project + "' from " + from.getUsername() + " [" + status + "]";
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("from", from.toJson());
        json.put("toUserId", toUserId);
        json.put("project", project);
        json.put("message", message);
        json.put("status", status.name().toLowerCase());
        return json;
    }
}
