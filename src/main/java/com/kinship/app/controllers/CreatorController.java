package com.kinship.app.controllers;

import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.exceptions.ValidationException;
import com.kinship.app.http.ApiRequest;
import com.kinship.app.http.Router;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.models.Notification;
import com.kinship.app.mysql.MysqlPostRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.services.BackgroundScheduler;
import com.kinship.app.services.NotificationService;
import com.kinship.app.services.TalentMatchingService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Creators (users): search, profiles, follow, profile editing and talent recommendations.
 */
public class CreatorController extends BaseController {
    private static final int MAX_TALENTS = 10;

    private final MysqlPostRepository posts;
    private final NotificationService notifications;
    private final TalentMatchingService matcher;
    private final BackgroundScheduler scheduler;

    public CreatorController(MysqlUserRepository users, MysqlPostRepository posts, NotificationService notifications,
                             TalentMatchingService matcher, BackgroundScheduler scheduler) {
        super(users);
        this.posts = posts;
        this.notifications = notifications;
        this.matcher = matcher;
        this.scheduler = scheduler;
    }

    @Override
    public void registerRoutes(Router router) {
        router.get("/api/creators", this::search);
        router.get("/api/creators/trending", this::trending);
        router.get("/api/creators/recommended", this::recommended);
        router.get("/api/creators/talents", req -> users.talentCounts());
        router.get("/api/creators/{id}", this::profile);
        router.get("/api/creators/{id}/posts", this::creatorPosts);
        router.post("/api/creators/{id}/follow", this::toggleFollow);
        router.put("/api/users/me", this::updateProfile);
        router.put("/api/users/me/talents", this::updateTalents);
    }

    private Map<String, Object> withFollowState(CreatorUser user, long viewerId) throws KinshipException {
        Map<String, Object> json = user.toJson();
        json.put("isFollowing", viewerId != 0 && users.isFollowing(viewerId, user.getId()));
        json.put("isMe", viewerId == user.getId());
        return json;
    }

    private Object search(ApiRequest req) throws KinshipException {
        List<Map<String, Object>> result = new ArrayList<>();
        for (CreatorUser user : users.search(req.query("q"), req.query("talent"))) {
            result.add(withFollowState(user, req.viewerId()));
        }
        return result;
    }

    /** Uses the list computed by the background scheduler thread. */
    private Object trending(ApiRequest req) throws KinshipException {
        Map<Long, CreatorUser> byId = users.findAll().stream()
                .collect(Collectors.toMap(CreatorUser::getId, Function.identity()));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Long id : scheduler.getTrendingCreatorIds()) {
            CreatorUser user = byId.get(id);
            if (user != null) {
                result.add(withFollowState(user, req.viewerId()));
            }
        }
        return result;
    }

    private Object recommended(ApiRequest req) throws KinshipException {
        CreatorUser viewer = requireUser(req.requireUserId());
        List<TalentMatchingService.Match> matches;
        try {
            matches = matcher.recommend(viewer, users.findAll(), 10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new KinshipException("Recommendation was interrupted", "ERR_INTERRUPTED", 503);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (TalentMatchingService.Match match : matches) {
            Map<String, Object> json = withFollowState(match.creator(), viewer.getId());
            json.put("matchScore", match.score());
            json.put("matchReason", match.matchedBy());
            result.add(json);
        }
        return result;
    }

    private Object profile(ApiRequest req) throws KinshipException {
        CreatorUser user = requireUser(req.pathLong("id"));
        Map<String, Object> json = withFollowState(user, req.viewerId());
        json.put("postCount", users.countPosts(user.getId()));
        return json;
    }

    private Object creatorPosts(ApiRequest req) throws KinshipException {
        long id = req.pathLong("id");
        requireUser(id);
        return toJsonList(posts.findByCreator(id, req.viewerId()));
    }

    private Object toggleFollow(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        long target = req.pathLong("id");
        if (me == target) {
            throw new ValidationException("You cannot follow yourself");
        }
        requireUser(target);
        MysqlUserRepository.FollowResult result = users.toggleFollow(me, target);
        if (result.following()) {
            notifications.notifyAsync(target, me, Notification.Type.FOLLOW, "started following you", null);
        }
        return obj("following", result.following(), "followers", result.followers());
    }

    private Object updateProfile(ApiRequest req) throws KinshipException {
        CreatorUser me = requireUser(req.requireUserId());
        String name = req.bodyString("name");
        String bio = req.bodyString("bio");
        String location = req.bodyString("location");
        String image = optionalUrl(req.bodyString("image"));
        if (name != null) me.setName(name);
        if (bio != null) me.setBio(bio);
        if (location != null) me.setLocation(location.length() > 100 ? location.substring(0, 100) : location);
        if (image != null) me.setImage(image);
        users.save(me);
        return me.toJson();
    }

    private Object updateTalents(ApiRequest req) throws KinshipException {
        CreatorUser me = requireUser(req.requireUserId());
        List<String> talents = req.bodyStringList("talents");
        if (talents.size() > MAX_TALENTS) {
            throw new ValidationException("Choose at most " + MAX_TALENTS + " talents");
        }
        me.setTalents(talents);
        users.save(me);
        return me.toJson();
    }
}
