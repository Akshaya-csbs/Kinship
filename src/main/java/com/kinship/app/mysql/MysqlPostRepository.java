package com.kinship.app.mysql;

import com.kinship.app.interfaces.IRepository;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.models.ImagePost;
import com.kinship.app.models.Post;
import com.kinship.app.models.VideoPost;
import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.GlobalExceptionHandler;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MysqlPostRepository implements IRepository<Post, Long> {
    private final MysqlDatabaseManager dbManager;
    private final MysqlUserRepository userRepo;

    public MysqlPostRepository() {
        this.dbManager = MysqlDatabaseManager.getInstance();
        this.userRepo = new MysqlUserRepository();
    }

    @Override
    public Post save(Post post) {
        String sql = "REPLACE INTO posts (id, creator_id, post_type, content, media_url, likes, comments, shares, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, post.getId());
            stmt.setLong(2, (Long) post.getCreator().getId());
            stmt.setString(3, post.getPostType());
            stmt.setString(4, post.getContent());
            stmt.setString(5, post.getMediaUrl());
            stmt.setInt(6, post.getLikes());
            stmt.setInt(7, post.getComments());
            stmt.setInt(8, post.getShares());
            stmt.setString(9, post.getTimestamp());

            stmt.executeUpdate();
            return post;
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL Post save failed", e));
            return null;
        }
    }

    @Override
    public Post findById(Long id) {
        String sql = "SELECT * FROM posts WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToPost(rs);
                }
            }
        } catch (Exception e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL Post findById failed", null));
        }
        return null;
    }

    @Override
    public List<Post> findAll() {
        List<Post> list = new ArrayList<>();
        String sql = "SELECT * FROM posts ORDER BY likes DESC";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Post p = mapRowToPost(rs);
                if (p != null) list.add(p);
            }
        } catch (Exception e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL Post findAll failed", null));
        }
        return list;
    }

    public boolean incrementLike(Long id) {
        String sql = "UPDATE posts SET likes = likes + 1 WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL incrementLike failed", e));
            return false;
        }
    }

    @Override
    public boolean deleteById(Long id) {
        String sql = "DELETE FROM posts WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL Post delete failed", e));
            return false;
        }
    }

    @Override
    public int count() {
        String sql = "SELECT COUNT(*) FROM posts";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL count failed", e));
        }
        return 0;
    }

    private Post mapRowToPost(ResultSet rs) throws SQLException {
        long id = rs.getLong("id");
        long creatorId = rs.getLong("creator_id");
        String postType = rs.getString("post_type");
        String content = rs.getString("content");
        String mediaUrl = rs.getString("media_url");
        int likes = rs.getInt("likes");
        int comments = rs.getInt("comments");
        int shares = rs.getInt("shares");
        String timestamp = rs.getString("created_at");

        CreatorUser creator = userRepo.findById(creatorId);
        if (creator == null) {
            try {
                creator = new CreatorUser(creatorId, "Kinship User", "@kinshipuser", "Creative Member", "", "Global", new ArrayList<>(), 100, 50, false, new ArrayList<>());
            } catch (Exception ignored) {}
        }

        if ("video".equalsIgnoreCase(postType)) {
            return new VideoPost(id, creator, content, mediaUrl, 45, likes, comments, shares, timestamp);
        } else {
            return new ImagePost(id, creator, content, mediaUrl, likes, comments, shares, timestamp);
        }
    }
}
