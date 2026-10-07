package com.kinship.app.models;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Factory pattern: maps the type column to the matching {@link Opportunity} subclass.
 */
public final class OpportunityFactory {
    private OpportunityFactory() {}

    public static Opportunity create(String type, long id, String title, String category, String organizer,
                                     String location, String date, String compensation, String deadline,
                                     String description, String image, List<String> talents, int applicants,
                                     boolean featured, LocalDateTime createdAt) {
        String normalized = type == null ? "" : type.toLowerCase();
        return switch (normalized) {
            case "gig" -> new GigOpportunity(id, title, category, organizer, location, date, compensation, deadline,
                    description, image, talents, applicants, featured, createdAt);
            case "collab" -> new CollabOpportunity(id, title, category, organizer, location, date, compensation,
                    deadline, description, image, talents, applicants, featured, createdAt);
            case "competition" -> new CompetitionOpportunity(id, title, category, organizer, location, date,
                    compensation, deadline, description, image, talents, applicants, featured, createdAt);
            case "workshop" -> new WorkshopOpportunity(id, title, category, organizer, location, date, compensation,
                    deadline, description, image, talents, applicants, featured, createdAt);
            default -> new EventOpportunity(id, title, category, organizer, location, date, compensation, deadline,
                    description, image, talents, applicants, featured, createdAt);
        };
    }
}
