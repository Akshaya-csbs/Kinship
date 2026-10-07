package com.kinship.app.mysql;

import com.kinship.app.interfaces.IRepository;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.GlobalExceptionHandler;

import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MysqlUserRepository implements IRepository<CreatorUser, Long> {
    private final MysqlDatabaseManager dbManager;

    public MysqlUserRepository() {
        this.dbManager = MysqlDatabaseManager.getInstance();
    }

    @Override
    public CreatorUser save(CreatorUser user) {
        String sql = "REPLACE INTO users (id, name, username, bio, image, location, talents, followers, following, verified, achievements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, user.getId());
            stmt.setString(2, user.getName());
            stmt.setString(3, user.getUsername());
            stmt.setString(4, user.getBio());
            stmt.setString(5, user.getImage());
            stmt.setString(6, user.getLocation());
            stmt.setString(7, String.join(", ", user.getTalents()));
            stmt.setInt(8, user.getFollowers());
            stmt.setInt(9, user.getFollowing());
            stmt.setBoolean(10, user.isVerified());
            stmt.setString(11, String.join(", ", user.getAchievements()));

            stmt.executeUpdate();
            return user;
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL User save failed", e));
            return null;
        }
    }

    @Override
    public CreatorUser findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToCreatorUser(rs);
                }
            }
        } catch (Exception e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL User findById failed", null));
        }
        return null;
    }

    @Override
    public List<CreatorUser> findAll() {
        List<CreatorUser> list = new ArrayList<>();
        String sql = "SELECT * FROM users ORDER BY followers DESC";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                CreatorUser user = mapRowToCreatorUser(rs);
                if (user != null) list.add(user);
            }
        } catch (Exception e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL User findAll failed", null));
        }
        return list;
    }

    @Override
    public boolean deleteById(Long id) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL User delete failed", e));
            return false;
        }
    }

    @Override
    public int count() {
        String sql = "SELECT COUNT(*) FROM users";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL count failed", e));
        }
        return 0;
    }

    public boolean followUser(Long followerId, Long followedId) {
        String sql = "INSERT IGNORE INTO connections (follower_id, followed_id) VALUES (?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, followerId);
            stmt.setLong(2, followedId);
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                // Update follower and following counts
                try (Statement updateStmt = conn.createStatement()) {
                    updateStmt.execute("UPDATE users SET following = following + 1 WHERE id = " + followerId);
                    updateStmt.execute("UPDATE users SET followers = followers + 1 WHERE id = " + followedId);
                }
                return true;
            }
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL followUser failed", e));
        }
        return false;
    }

    private CreatorUser mapRowToCreatorUser(ResultSet rs) {
        try {
            long id = rs.getLong("id");
            String name = rs.getString("name");
            String username = rs.getString("username");
            String bio = rs.getString("bio");
            String image = rs.getString("image");
            String location = rs.getString("location");
            String talentsStr = rs.getString("talents");
            int followers = rs.getInt("followers");
            int following = rs.getInt("following");
            boolean verified = rs.getBoolean("verified");
            String achievementsStr = rs.getString("achievements");

            List<String> talents = talentsStr != null && !talentsStr.isEmpty() ? Arrays.asList(talentsStr.split("\\s*,\\s*")) : new ArrayList<>();
            List<String> achievements = achievementsStr != null && !achievementsStr.isEmpty() ? Arrays.asList(achievementsStr.split("\\s*,\\s*")) : new ArrayList<>();

            return new CreatorUser(id, name, username, bio, image, location, talents, followers, following, verified, achievements);
        } catch (Exception e) {
            GlobalExceptionHandler.getInstance().handleException(e);
            return null;
        }
    }
}
