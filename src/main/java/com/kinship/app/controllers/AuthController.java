package com.kinship.app.controllers;

import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.http.ApiRequest;
import com.kinship.app.http.ApiResponse;
import com.kinship.app.http.Router;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.mysql.MysqlMessageRepository;
import com.kinship.app.mysql.MysqlNotificationRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.services.AuthService;

import java.util.Map;

public class AuthController extends BaseController {
    private final AuthService auth;
    private final MysqlNotificationRepository notifications;
    private final MysqlMessageRepository messages;

    public AuthController(MysqlUserRepository users, AuthService auth, MysqlNotificationRepository notifications,
                          MysqlMessageRepository messages) {
        super(users);
        this.auth = auth;
        this.notifications = notifications;
        this.messages = messages;
    }

    @Override
    public void registerRoutes(Router router) {
        router.post("/api/auth/register", this::register);
        router.post("/api/auth/login", this::login);
        router.post("/api/auth/google", this::google);
        router.post("/api/auth/logout", this::logout);
        router.get("/api/auth/me", this::me);
    }

    private Object register(ApiRequest req) throws KinshipException {
        AuthService.AuthResult result = auth.register(req.requireString("name", 100), req.requireString("email", 255),
                req.bodyString("password"));
        return ApiResponse.created(obj("token", result.token(), "user", result.user().toJson()));
    }

    private Object login(ApiRequest req) throws KinshipException {
        AuthService.AuthResult result = auth.login(req.requireString("email", 255), req.bodyString("password"));
        return obj("token", result.token(), "user", result.user().toJson());
    }

    private Object google(ApiRequest req) throws KinshipException {
        AuthService.AuthResult result = auth.googleSignIn();
        return obj("token", result.token(), "user", result.user().toJson());
    }

    private Object logout(ApiRequest req) throws KinshipException {
        auth.logout(req.getToken());
        return obj("status", "logged out");
    }

    private Object me(ApiRequest req) throws KinshipException {
        long userId = req.requireUserId();
        CreatorUser user = requireUser(userId);
        Map<String, Object> json = user.toJson();
        json.put("email", user.getEmail());
        json.put("postCount", users.countPosts(userId));
        json.put("unreadNotifications", notifications.countUnread(userId));
        json.put("unreadMessages", messages.countUnread(userId));
        return json;
    }
}
