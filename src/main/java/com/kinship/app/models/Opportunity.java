package com.kinship.app.models;

public abstract class Opportunity extends AbstractEntity {
    private final String title;
    private final String category;
    private final String location;
    private final String date;
    private final String description;
    private final String image;
    private int applicants;

    public Opportunity(long id, String title, String category, String location, String date, String description, String image, int applicants) {
        super(id);
        this.title = title;
        this.category = category;
        this.location = location;
        this.date = date;
        this.description = description;
        this.image = image;
        this.applicants = applicants;
    }

    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getLocation() { return location; }
    public String getDate() { return date; }
    public String getDescription() { return description; }
    public String getImage() { return image; }
    public int getApplicants() { return applicants; }

    public void apply() {
        this.applicants++;
        markUpdated();
    }

    public abstract String getType();

    @Override
    public String getDisplaySummary() {
        return "[" + getType() + "] " + title + " (" + location + ")";
    }
}
