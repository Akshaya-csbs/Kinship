package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.List;

public class CompetitionOpportunity extends Opportunity {
    public CompetitionOpportunity(long id, String title, String category, String organizer, String location, String date,
                    String compensation, String deadline, String description, String image, List<String> talents,
                    int applicants, boolean featured, LocalDateTime createdAt) {
        super(id, title, category, organizer, location, date, compensation, deadline, description, image, talents,
                applicants, featured, createdAt);
    }

    @Override
    public String getType() {
        return "Competition";
    }

    @Override
    public String getActionLabel() {
        return "Enter Competition";
    }
}
