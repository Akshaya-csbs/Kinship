package com.kinship.app.models;

public class EventOpportunity extends Opportunity {
    public EventOpportunity(long id, String title, String category, String location, String date, String description, String image, int applicants) {
        super(id, title, category, location, date, description, image, applicants);
    }

    @Override
    public String getType() {
        return "Event";
    }
}
