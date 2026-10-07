package com.kinship.app.controllers;

import com.kinship.app.exceptions.AuthorizationException;
import com.kinship.app.exceptions.EntityNotFoundException;
import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.exceptions.ValidationException;
import com.kinship.app.http.ApiRequest;
import com.kinship.app.http.ApiResponse;
import com.kinship.app.http.Router;
import com.kinship.app.models.Comment;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.models.Notification;
import com.kinship.app.models.Post;
import com.kinship.app.models.PostFactory;
import com.kinship.app.mysql.MysqlPostRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.services.NotificationService;

/**
 * Home feed: create / delete posts, like, comment and share.
 */
public class FeedController extends BaseController {
    private static final String DEFAULT_MEDIA = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080";

    private final MysqlPostRepository posts;
    private final NotificationService notifications;

    public FeedController(MysqlUserRepository users, MysqlPostRepository posts, NotificationService notifications) {
        super(users);
        this.posts = posts;
        this.notifications = notifications;
    }

    @Override
    public void registerRoutes(Router router) {
        router.get("/api/feed", req -> toJsonList(posts.findFeed(req.viewerId())));
        router.post("/api/feed", this::create);
        router.delete("/api/feed/{id}", this::delete);
        router.post("/api/feed/{id}/like", this::toggleLike);
        router.get("/api/feed/{id}/comments", this::comments);
        router.post("/api/feed/{id}/comments", this::addComment);
        router.post("/api/feed/{id}/share", this::share);
    }

    private Post requirePost(long id, long viewerId) throws KinshipException {
        return posts.findById(id, viewerId).orElseThrow(() -> new EntityNotFoundException("Post", id));
    }

    private Object create(ApiRequest req) throws KinshipException {
        CreatorUser me = requireUser(req.requireUserId());
        String content = req.requireString("content", 2000);
        String type = req.bodyString("type");
        type = type == null || type.isBlank() ? "image" : type.toLowerCase();
        if (!PostFactory.isSupportedType(type)) {
            throw new ValidationException("Post type must be image, video or collab");
        }
        String media = optionalUrl(req.bodyString("mediaUrl"));
        Post post = PostFactory.create(type, 0, me, content, media != null ? media : DEFAULT_MEDIA, 0, 0, 0, null);
        posts.save(post);
        return ApiResponse.created(requirePost(post.getId(), me.getId()).toJson());
    }

    private Object delete(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        Post post = requirePost(req.pathLong("id"), me);
        if (post.getCreator().getId() != me) {
            throw new AuthorizationException("You can only delete your own posts");
        }
        posts.deleteById(post.getId());
        return obj("deleted", true, "id", post.getId());
    }

    private Object toggleLike(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        Post post = requirePost(req.pathLong("id"), me);
        MysqlPostRepository.LikeResult result = posts.toggleLike(me, post.getId());
        if (result.liked()) {
            notifications.notifyAsync(post.getCreator().getId(), me, Notification.Type.LIKE, "liked your post",
                    preview(post.getContent()));
        }
        return obj("liked", result.liked(), "likes", result.likes());
    }

    private Object comments(ApiRequest req) throws KinshipException {
        Post post = requirePost(req.pathLong("id"), req.viewerId());
        return toJsonList(posts.findComments(post.getId()));
    }

    private Object addComment(ApiRequest req) throws KinshipException {
        long me = req.requireUserId();
        Post post = requirePost(req.pathLong("id"), me);
        String content = req.requireString("content", 1000);
        Comment comment = posts.addComment(post.getId(), me, content);
        notifications.notifyAsync(post.getCreator().getId(), me, Notification.Type.COMMENT, "commented on your post",
                preview(content));
        return ApiResponse.created(comment.toJson());
    }

    private Object share(ApiRequest req) throws KinshipException {
        Post post = requirePost(req.pathLong("id"), req.viewerId());
        return obj("shares", posts.incrementShares(post.getId()));
    }

    private static String preview(String text) {
        return text.length() > 60 ? text.substring(0, 57) + "..." : text;
    }
}
