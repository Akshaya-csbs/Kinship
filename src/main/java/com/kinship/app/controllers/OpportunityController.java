package com.kinship.app.controllers;

import com.kinship.app.exceptions.EntityNotFoundException;
import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.http.ApiRequest;
import com.kinship.app.http.Router;
import com.kinship.app.models.Notification;
import com.kinship.app.models.Opportunity;
import com.kinship.app.mysql.MysqlOpportunityRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.services.NotificationService;

public class OpportunityController extends BaseController {
    private final MysqlOpportunityRepository opportunities;
    private final NotificationService notifications;

    public OpportunityController(MysqlUserRepository users, MysqlOpportunityRepository opportunities,
                                 NotificationService notifications) {
        super(users);
        this.opportunities = opportunities;
        this.notifications = notifications;
    }

    @Override
    public void registerRoutes(Router router) {
        router.get("/api/opportunities", req -> toJsonList(opportunities.findAll(req.viewerId(), req.query("type"))));
        router.get("/api/opportunities/{id}", this::details);
        router.post("/api/opportunities/{id}/apply", this::apply);
    }

    private Opportunity requireOpportunity(long id, long viewerId) throws KinshipException {
        return opportunities.findById(id, viewerId).orElseThrow(() -> new EntityNotFoundException("Opportunity", id));
    }

    private Object details(ApiRequest req) throws KinshipException {
        return requireOpportunity(req.pathLong("id"), req.viewerId()).toJson();
    }

    private Object apply(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        Opportunity opp = requireOpportunity(req.pathLong("id"), me);
        MysqlOpportunityRepository.ApplyResult result = opportunities.apply(me, opp.getId());
        if (result.newlyApplied()) {
            notifications.notifyAsync(me, null, Notification.Type.SYSTEM,
                    "Your application was sent to " + opp.getOrganizer(), opp.getTitle());
        }
        return obj("applied", true, "alreadyApplied", !result.newlyApplied(), "applicants", result.applicants());
    }
}
