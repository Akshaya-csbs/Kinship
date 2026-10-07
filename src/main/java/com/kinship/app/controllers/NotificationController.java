package com.kinship.app.controllers;

import com.kinship.app.exceptions.EntityNotFoundException;
import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.http.ApiRequest;
import com.kinship.app.http.Router;
import com.kinship.app.mysql.MysqlNotificationRepository;
import com.kinship.app.mysql.MysqlUserRepository;

public class NotificationController extends BaseController {
    private final MysqlNotificationRepository notifications;

    public NotificationController(MysqlUserRepository users, MysqlNotificationRepository notifications) {
        super(users);
        this.notifications = notifications;
    }

    @Override
    public void registerRoutes(Router router) {
        router.get("/api/notifications", this::list);
        router.post("/api/notifications/read-all", this::readAll);
        router.post("/api/notifications/{id}/read", this::read);
    }

    private Object list(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        return obj("unread", notifications.countUnread(me), "items", toJsonList(notifications.findForUser(me)));
    }

    private Object readAll(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        return obj("updated", notifications.markAllRead(me), "unread", 0);
    }

    private Object read(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        long id = req.pathLong("id");
        if (!notifications.markRead(id, me)) {
            throw new EntityNotFoundException("Notification", id);
        }
        return obj("read", true, "unread", notifications.countUnread(me));
    }
}
