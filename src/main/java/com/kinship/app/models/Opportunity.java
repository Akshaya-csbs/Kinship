package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * OOP: ABSTRACTION. Concrete opportunity kinds (Event, Gig, Collab, Competition, Workshop)
 * define their own type label and call-to-action text.
 */
public abstract class Opportunity extends AbstractEntity {
    private final String title;
    private final String category;
    private final String organizer;
    private final String location;
    private final String date;
    private final String compensation;
    private final String deadline;
    private final String description;
    private final String image;
    private final List<String> talents;
    private final int applicants;
    private final boolean featured;
    private boolean appliedByViewer;

    protected Opportunity(long id, String title, String category, String organizer, String location, String date,
                          String compensation, String deadline, String description, String image, List<String> talents,
                          int applicants, boolean featured, LocalDateTime createdAt) {
        super(id, createdAt);
        this.title = title;
        this.category = category;
        this.organizer = organizer;
        this.location = location;
        this.date = date;
        this.compensation = compensation;
        this.deadline = deadline;
        this.description = description;
        this.image = image;
        this.talents = talents != null ? new ArrayList<>(talents) : new ArrayList<>();
        this.applicants = applicants;
        this.featured = featured;
    }

    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getOrganizer() { return organizer; }
    public String getLocation() { return location; }
    public String getDate() { return date; }
    public String getCompensation() { return compensation; }
    public String getDeadline() { return deadline; }
    public String getDescription() { return description; }
    public String getImage() { return image; }
    public List<String> getTalents() { return new ArrayList<>(talents); }
    public int getApplicants() { return applicants; }
    public boolean isFeatured() { return featured; }
    public boolean isAppliedByViewer() { return appliedByViewer; }
    public void setAppliedByViewer(boolean appliedByViewer) { this.appliedByViewer = appliedByViewer; }

    /** "Event", "Gig", ... stored in the type column. */
    public abstract String getType();

    /** Label for the apply button. */
    public String getActionLabel() {
        return "Apply Now";
    }

    @Override
    public String getDisplaySummary() {
        return "[" + getType() + "] " + title + " (" + location + ")";
    }

    @Override
    public Map<String, Object> toJson() {
        Map<String, Object> json = super.toJson();
        json.put("title", title);
        json.put("type", getType());
        json.put("category", category);
        json.put("organizer", organizer);
        json.put("location", location);
        json.put("date", date);
        json.put("compensation", compensation);
        json.put("deadline", deadline);
        json.put("description", description);
        json.put("image", image);
        json.put("talents", getTalents());
        json.put("applicants", applicants);
        json.put("featured", featured);
        json.put("applied", appliedByViewer);
        json.put("actionLabel", getActionLabel());
        return json;
    }
}
