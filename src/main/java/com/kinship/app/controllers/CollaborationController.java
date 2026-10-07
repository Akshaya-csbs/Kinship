package com.kinship.app.controllers;

import com.kinship.app.exceptions.AuthorizationException;
import com.kinship.app.exceptions.EntityNotFoundException;
import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.exceptions.ValidationException;
import com.kinship.app.http.ApiRequest;
import com.kinship.app.http.ApiResponse;
import com.kinship.app.http.Router;
import com.kinship.app.models.CollaborationRequest;
import com.kinship.app.models.Notification;
import com.kinship.app.mysql.MysqlCollaborationRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.services.NotificationService;

import java.util.List;

public class CollaborationController extends BaseController {
    private final MysqlCollaborationRepository collaborations;
    private final NotificationService notifications;

    public CollaborationController(MysqlUserRepository users, MysqlCollaborationRepository collaborations,
                                   NotificationService notifications) {
        super(users);
        this.collaborations = collaborations;
        this.notifications = notifications;
    }

    @Override
    public void registerRoutes(Router router) {
        router.get("/api/collaborations", this::overview);
        router.post("/api/collaborations", this::create);
        router.put("/api/collaborations/{id}/progress", this::progress);
        router.post("/api/collaborations/requests", this::sendRequest);
        router.post("/api/collaborations/requests/{id}/accept", req -> respond(req, true));
        router.post("/api/collaborations/requests/{id}/decline", req -> respond(req, false));
    }

    private Object overview(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        return obj("requests", toJsonList(collaborations.findPendingFor(me)),
                "active", toJsonList(collaborations.findForUser(me)));
    }

    private Object create(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        String title = req.requireString("title", 255);
        String description = req.bodyString("description");
        List<String> talents = req.bodyStringList("talents");
        String deadline = req.bodyString("deadline");
        long id = collaborations.create(title, description, me, talents,
                deadline == null || deadline.isBlank() ? "Flexible" : deadline, List.of(me));
        return ApiResponse.created(obj("id", id, "title", title));
    }

    private Object progress(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        long id = req.pathLong("id");
        if (!collaborations.isMember(id, me)) {
            throw new AuthorizationException("Only members can update this collaboration");
        }
        Long progress = req.bodyLong("progress");
        if (progress == null || progress < 0 || progress > 100) {
            throw new ValidationException("'progress' must be between 0 and 100");
        }
        collaborations.updateProgress(id, progress.intValue());
        return obj("id", id, "progress", progress);
    }

    private Object sendRequest(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        Long to = req.bodyLong("toUserId");
        if (to == null) throw new ValidationException("'toUserId' is required");
        if (to == me) throw new ValidationException("You cannot invite yourself");
        requireUser(to);
        String project = req.requireString("project", 255);
        String message = req.bodyString("message");
        long id = collaborations.createRequest(me, to, project, message);
        notifications.notifyAsync(to, me, Notification.Type.COLLABORATION, "invited you to collaborate on", project);
        return ApiResponse.created(obj("id", id, "status", "pending"));
    }

    private Object respond(ApiRequest req, boolean accept) throws KinshipException {
        long me = req.requireUserId();
        long id = req.pathLong("id");
        CollaborationRequest request = collaborations.findRequest(id)
                .orElseThrow(() -> new EntityNotFoundException("Collaboration request", id));
        if (request.getToUserId() != me) {
            throw new AuthorizationException("This request was not sent to you");
        }
        if (request.getStatus() != CollaborationRequest.Status.PENDING) {
            throw new ValidationException("This request was already " + request.getStatus().name().toLowerCase());
        }
        long collaborationId = collaborations.respond(request, accept);
        notifications.notifyAsync(request.getFrom().getId(), me, Notification.Type.COLLABORATION,
                accept ? "accepted your collaboration request" : "declined your collaboration request",
                request.getProject());
        return obj("status", accept ? "accepted" : "declined", "collaborationId", collaborationId);
    }
}
