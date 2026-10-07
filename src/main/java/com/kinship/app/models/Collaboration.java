package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Collaboration extends AbstractEntity {
    private final String title;
    private final String description;
    private final long ownerId;
    private final List<String> talents;
    private final int progress;
    private final String deadline;
    private final List<User> members;

    public Collaboration(long id, String title, String description, long ownerId, List<String> talents, int progress,
                         String deadline, List<User> members, LocalDateTime createdAt) {
        super(id, createdAt);
        this.title = title;
        this.description = description;
        this.ownerId = ownerId;
        this.talents = talents != null ? new ArrayList<>(talents) : new ArrayList<>();
        this.progress = progress;
        this.deadline = deadline;
        this.members = members != null ? new ArrayList<>(members) : new ArrayList<>();
    }

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public long getOwnerId() { return ownerId; }
    public List<String> getTalents() { return new ArrayList<>(talents); }
    public int getProgress() { return progress; }
    public String getDeadline() { return deadline; }
    public List<User> getMembers() { return new ArrayList<>(members); }

    @Override
    public String getDisplaySummary() {
        return "Collaboration '" + title + "' (" + members.size() + " members, " + progress + "%)";
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("title", title);
        json.put("description", description);
        json.put("ownerId", ownerId);
        json.put("talents", getTalents());
        json.put("progress", progress);
        json.put("deadline", deadline);
        json.put("members", members.stream().map(User::toJson).collect(Collectors.toList()));
        return json;
    }
}
