package com.kinship.app.controllers;

import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.exceptions.ValidationException;
import com.kinship.app.http.ApiRequest;
import com.kinship.app.http.ApiResponse;
import com.kinship.app.http.Router;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.models.Message;
import com.kinship.app.models.Notification;
import com.kinship.app.mysql.MysqlMessageRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.services.NotificationService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MessageController extends BaseController {
    private final MysqlMessageRepository messages;
    private final NotificationService notifications;

    public MessageController(MysqlUserRepository users, MysqlMessageRepository messages, NotificationService notifications) {
        super(users);
        this.messages = messages;
        this.notifications = notifications;
    }

    @Override
    public void registerRoutes(Router router) {
        router.get("/api/messages", this::conversations);
        router.get("/api/messages/{userId}", this::thread);
        router.post("/api/messages/{userId}", this::send);
    }

    private Object conversations(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        List<Map<String, Object>> list = new ArrayList<>();
        for (MysqlMessageRepository.Conversation c : messages.findConversations(me)) {
            list.add(obj("user", c.otherUser().toJson(), "lastMessage", c.lastMessage().toJson(),
                    "fromMe", c.lastMessage().getSenderId() == me, "unread", c.unread()));
        }
        return list;
    }

    private Object thread(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        CreatorUser other = requireUser(req.pathLong("userId"));
        messages.markThreadRead(me, other.getId());
        return obj("user", other.toJson(), "messages", toJsonList(messages.findThread(me, other.getId())));
    }

    private Object send(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        CreatorUser other = requireUser(req.pathLong("userId"));
        if (other.getId() == me) {
            throw new ValidationException("You cannot message yourself");
        }
        String content = req.requireString("content", 2000);
        Message message = messages.send(me, other.getId(), content);
        notifications.notifyAsync(other.getId(), me, Notification.Type.MESSAGE, "sent you a message",
                content.length() > 60 ? content.substring(0, 57) + "..." : content);
        return ApiResponse.created(message.toJson());
    }
}
