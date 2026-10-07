package com.kinship.app.mysql;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.interfaces.IRepository;
import com.kinship.app.models.Comment;
import com.kinship.app.models.Post;
import com.kinship.app.models.PostFactory;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for posts, likes and comments.
 */
public class MysqlPostRepository extends BaseMysqlRepository implements IRepository<Post, Long> {

    public record LikeResult(boolean liked, int likes) {}

    /** viewer id is bound to the first parameter so each post knows if the viewer liked it. */
    private static final String SELECT_POSTS = "SELECT p.*, " + MysqlUserRepository.userColumns("u", "u_")
            + ", EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS liked_by_viewer"
            + " FROM posts p JOIN users u ON u.id = p.creator_id";

    private Post mapPost(ResultSet rs) throws SQLException {
        Post post = PostFactory.create(
                rs.getString("post_type"),
                rs.getLong("id"),
                MysqlUserRepository.mapUser(rs, "u_"),
                rs.getString("content"),
                rs.getString("media_url"),
                rs.getInt("likes"),
                rs.getInt("comments"),
                rs.getInt("shares"),
                toLocal(rs.getTimestamp("created_at")));
        post.setLikedByViewer(rs.getBoolean("liked_by_viewer"));
        return post;
    }

    private List<Post> query(String where, long viewerId, Long param) throws DatabaseException {
        String sql = SELECT_POSTS + where + " ORDER BY p.created_at DESC, p.id DESC";
        return db.execute("Load posts", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setLong(1, viewerId);
                if (param != null) {
                    ps.setLong(2, param);
                }
                List<Post> posts = new ArrayList<>();
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        posts.add(mapPost(rs));
                    }
                }
                return posts;
            }
        });
    }

    // ------------------------------------------------------------------ IRepository

    /** Inserts a new post and returns it reloaded from the database. */
    @Override
    public Post save(Post post) throws DatabaseException {
        if (post.getId() != 0) {
            db.execute("Update post", conn -> {
                try (PreparedStatement ps = conn.prepareStatement("UPDATE posts SET content = ?, media_url = ? WHERE id = ?")) {
                    ps.setString(1, post.getContent());
                    ps.setString(2, post.getMediaUrl());
                    ps.setLong(3, post.getId());
                    return ps.executeUpdate();
                }
            });
            return post;
        }
        String sql = "INSERT INTO posts (creator_id, post_type, content, media_url, created_at) VALUES (?, ?, ?, ?, ?)";
        long id = db.execute("Insert post", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setLong(1, post.getCreator().getId());
                ps.setString(2, post.getPostType());
                ps.setString(3, post.getContent());
                ps.setString(4, post.getMediaUrl());
                ps.setTimestamp(5, nowTimestamp());
                ps.executeUpdate();
                return generatedKey(ps);
            }
        });
        post.assignId(id);
        return post;
    }

    @Override
    public Optional<Post> findById(Long id) throws DatabaseException {
        return findById(id, 0);
    }

    public Optional<Post> findById(long id, long viewerId) throws DatabaseException {
        return query(" WHERE p.id = ?", viewerId, id).stream().findFirst();
    }

    @Override
    public List<Post> findAll() throws DatabaseException {
        return findFeed(0);
    }

    public List<Post> findFeed(long viewerId) throws DatabaseException {
        return query("", viewerId, null);
    }

    public List<Post> findByCreator(long creatorId, long viewerId) throws DatabaseException {
        return query(" WHERE p.creator_id = ?", viewerId, creatorId);
    }

    @Override
    public boolean deleteById(Long id) throws DatabaseException {
        return db.execute("Delete post", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM posts WHERE id = ?")) {
                ps.setLong(1, id);
                return ps.executeUpdate() > 0;
            }
        });
    }

    @Override
    public int count() throws DatabaseException {
        return db.execute("Count posts", conn -> {
            try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM posts")) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        });
    }

    // ------------------------------------------------------------------ likes, shares, comments

    /** Likes or unlikes the post atomically (transaction) and returns the new state. */
    public LikeResult toggleLike(long userId, long postId) throws DatabaseException {
        return db.inTransaction("Toggle like", conn -> {
            boolean liked;
            try (PreparedStatement del = conn.prepareStatement("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?")) {
                del.setLong(1, userId);
                del.setLong(2, postId);
                liked = del.executeUpdate() == 0;
            }
            boolean changed = true;
            if (liked) {
                try (PreparedStatement ins = conn.prepareStatement(
                        "INSERT INTO post_likes (user_id, post_id, created_at) VALUES (?, ?, ?)")) {
                    ins.setLong(1, userId);
                    ins.setLong(2, postId);
                    ins.setTimestamp(3, nowTimestamp());
                    ins.executeUpdate();
                } catch (SQLIntegrityConstraintViolationException concurrentLike) {
                    changed = false; // a parallel request from the same user already inserted the like
                }
            }
            if (changed) {
                try (PreparedStatement upd = conn.prepareStatement(
                        "UPDATE posts SET likes = GREATEST(0, likes + ?) WHERE id = ?")) {
                    upd.setInt(1, liked ? 1 : -1);
                    upd.setLong(2, postId);
                    upd.executeUpdate();
                }
            }
            return new LikeResult(liked, readCounter(conn, "likes", postId));
        });
    }

    public int incrementShares(long postId) throws DatabaseException {
        return db.inTransaction("Share post", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("UPDATE posts SET shares = shares + 1 WHERE id = ?")) {
                ps.setLong(1, postId);
                ps.executeUpdate();
            }
            return readCounter(conn, "shares", postId);
        });
    }

    public Comment addComment(long postId, long userId, String content) throws DatabaseException {
        long commentId = db.inTransaction("Add comment", conn -> {
            long id;
            try (PreparedStatement ins = conn.prepareStatement(
                    "INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS)) {
                ins.setLong(1, postId);
                ins.setLong(2, userId);
                ins.setString(3, content);
                ins.setTimestamp(4, nowTimestamp());
                ins.executeUpdate();
                id = generatedKey(ins);
            }
            try (PreparedStatement upd = conn.prepareStatement("UPDATE posts SET comments = comments + 1 WHERE id = ?")) {
                upd.setLong(1, postId);
                upd.executeUpdate();
            }
            return id;
        });
        return findComments(postId).stream()
                .filter(c -> c.getId() == commentId)
                .findFirst()
                .orElseThrow(() -> new DatabaseException("Comment was not saved"));
    }

    public List<Comment> findComments(long postId) throws DatabaseException {
        String sql = "SELECT c.id, c.post_id, c.content, c.created_at, " + MysqlUserRepository.userColumns("u", "u_")
                + " FROM comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = ? ORDER BY c.created_at, c.id";
        return db.execute("Load comments", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setLong(1, postId);
                List<Comment> comments = new ArrayList<>();
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        comments.add(new Comment(rs.getLong("id"), rs.getLong("post_id"),
                                MysqlUserRepository.mapUser(rs, "u_"), rs.getString("content"),
                                toLocal(rs.getTimestamp("created_at"))));
                    }
                }
                return comments;
            }
        });
    }

    private static int readCounter(java.sql.Connection conn, String column, long postId) throws SQLException {
        // column is a constant chosen by this class, never user input
        try (PreparedStatement ps = conn.prepareStatement("SELECT " + column + " FROM posts WHERE id = ?")) {
            ps.setLong(1, postId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }
}
