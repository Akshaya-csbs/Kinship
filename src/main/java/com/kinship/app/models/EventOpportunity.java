package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.List;

public class EventOpportunity extends Opportunity {
    public EventOpportunity(long id, String title, String category, String organizer, String location, String date,
                    String compensation, String deadline, String description, String image, List<String> talents,
                    int applicants, boolean featured, LocalDateTime createdAt) {
        super(id, title, category, organizer, location, date, compensation, deadline, description, image, talents,
                applicants, featured, createdAt);
    }

    @Override
    public String getType() {
        return "Event";
    }

    @Override
    public String getActionLabel() {
        return "Apply to Perform";
    }
}
