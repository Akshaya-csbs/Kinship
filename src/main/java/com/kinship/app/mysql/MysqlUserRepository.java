package com.kinship.app.mysql;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.ValidationException;
import com.kinship.app.interfaces.IRepository;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.util.TextUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

/**
 * JDBC repository for the users and follows tables.
 */
public class MysqlUserRepository extends BaseMysqlRepository implements IRepository<CreatorUser, Long> {

    /** Login data, kept out of the {@link CreatorUser} model on purpose. */
    public record Credentials(long userId, String passwordHash) {}

    /** Result of a follow/unfollow toggle. */
    public record FollowResult(boolean following, int followers) {}

    private static final String[] USER_COLUMNS = {
            "id", "name", "username", "email", "bio", "image", "location", "talents",
            "followers", "following", "verified", "achievements", "created_at"
    };

    /** "u.id AS u_id, u.name AS u_name, ..." so user columns can be joined into other queries. */
    public static String userColumns(String alias, String prefix) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < USER_COLUMNS.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(alias).append('.').append(USER_COLUMNS[i]).append(" AS ").append(prefix).append(USER_COLUMNS[i]);
        }
        return sb.toString();
    }

    /** Maps the (optionally prefixed) user columns of the current row to a {@link CreatorUser}. */
    public static CreatorUser mapUser(ResultSet rs, String prefix) throws SQLException {
        try {
            return new CreatorUser(
                    rs.getLong(prefix + "id"),
                    rs.getString(prefix + "name"),
                    rs.getString(prefix + "username"),
                    rs.getString(prefix + "email"),
                    rs.getString(prefix + "bio"),
                    rs.getString(prefix + "image"),
                    rs.getString(prefix + "location"),
                    TextUtil.splitList(rs.getString(prefix + "talents")),
                    rs.getInt(prefix + "followers"),
                    rs.getInt(prefix + "following"),
                    rs.getBoolean(prefix + "verified"),
                    TextUtil.splitList(rs.getString(prefix + "achievements")),
                    toLocal(rs.getTimestamp(prefix + "created_at")));
        } catch (ValidationException e) {
            throw new SQLException("Corrupt user row #" + rs.getLong(prefix + "id") + ": " + e.getMessage(), e);
        }
    }

    private static final String SELECT_USERS = "SELECT " + userColumns("u", "") + " FROM users u";

    // ------------------------------------------------------------------ IRepository

    /** Updates the editable profile columns of an existing user. */
    @Override
    public CreatorUser save(CreatorUser user) throws DatabaseException {
        if (user.getId() == 0) {
            throw new DatabaseException("New users must be created with register()");
        }
        String sql = "UPDATE users SET name = ?, bio = ?, image = ?, location = ?, talents = ? WHERE id = ?";
        db.execute("Update user", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, user.getName());
                ps.setString(2, user.getBio());
                ps.setString(3, user.getImage());
                ps.setString(4, user.getLocation());
                ps.setString(5, TextUtil.joinList(user.getTalents()));
                ps.setLong(6, user.getId());
                return ps.executeUpdate();
            }
        });
        return user;
    }

    @Override
    public Optional<CreatorUser> findById(Long id) throws DatabaseException {
        return db.execute("Find user", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(SELECT_USERS + " WHERE u.id = ?")) {
                ps.setLong(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? Optional.of(mapUser(rs, "")) : Optional.empty();
                }
            }
        });
    }

    @Override
    public List<CreatorUser> findAll() throws DatabaseException {
        return search(null, null);
    }

    @Override
    public boolean deleteById(Long id) throws DatabaseException {
        return db.execute("Delete user", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM users WHERE id = ?")) {
                ps.setLong(1, id);
                return ps.executeUpdate() > 0;
            }
        });
    }

    @Override
    public int count() throws DatabaseException {
        return db.execute("Count users", conn -> {
            try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM users")) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        });
    }

    // ------------------------------------------------------------------ auth

    public CreatorUser register(CreatorUser user, String passwordHash) throws DatabaseException {
        String sql = "INSERT INTO users (name, username, email, password_hash, bio, image, location, talents, created_at) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        long id = db.execute("Register user", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, user.getName());
                ps.setString(2, user.getUsername());
                ps.setString(3, user.getEmail());
                ps.setString(4, passwordHash);
                ps.setString(5, user.getBio());
                ps.setString(6, user.getImage());
                ps.setString(7, user.getLocation());
                ps.setString(8, TextUtil.joinList(user.getTalents()));
                ps.setTimestamp(9, nowTimestamp());
                ps.executeUpdate();
                return generatedKey(ps);
            }
        });
        user.assignId(id);
        return user;
    }

    public Optional<Credentials> findCredentialsByEmail(String email) throws DatabaseException {
        return db.execute("Find credentials", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT id, password_hash FROM users WHERE LOWER(email) = LOWER(?)")) {
                ps.setString(1, email);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? Optional.of(new Credentials(rs.getLong(1), rs.getString(2))) : Optional.empty();
                }
            }
        });
    }

    public boolean existsByEmail(String email) throws DatabaseException {
        return exists("SELECT 1 FROM users WHERE LOWER(email) = LOWER(?)", email);
    }

    public boolean existsByUsername(String username) throws DatabaseException {
        return exists("SELECT 1 FROM users WHERE LOWER(username) = LOWER(?)", username);
    }

    private boolean exists(String sql, String value) throws DatabaseException {
        return db.execute("Exists check", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, value);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next();
                }
            }
        });
    }

    // ------------------------------------------------------------------ search & stats

    /** Case-insensitive search on name/username/bio/talents, optionally limited to one talent. */
    public List<CreatorUser> search(String query, String talent) throws DatabaseException {
        StringBuilder sql = new StringBuilder(SELECT_USERS).append(" WHERE 1 = 1");
        List<String> params = new ArrayList<>();
        if (!TextUtil.isBlank(query)) {
            sql.append(" AND (LOWER(u.name) LIKE ? OR LOWER(u.username) LIKE ? OR LOWER(u.talents) LIKE ? OR LOWER(u.location) LIKE ?)");
            String like = "%" + query.toLowerCase().trim() + "%";
            for (int i = 0; i < 4; i++) params.add(like);
        }
        if (!TextUtil.isBlank(talent)) {
            sql.append(" AND LOWER(u.talents) LIKE ?");
            params.add("%" + talent.toLowerCase().trim() + "%");
        }
        sql.append(" ORDER BY u.followers DESC");
        return db.execute("Search users", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql.toString())) {
                for (int i = 0; i < params.size(); i++) {
                    ps.setString(i + 1, params.get(i));
                }
                List<CreatorUser> users = new ArrayList<>();
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        users.add(mapUser(rs, ""));
                    }
                }
                return users;
            }
        });
    }

    /** Number of creators per talent, most popular first. */
    public Map<String, Integer> talentCounts() throws DatabaseException {
        Map<String, Integer> counts = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        for (CreatorUser user : findAll()) {
            for (String talent : user.getTalents()) {
                counts.merge(talent, 1, Integer::sum);
            }
        }
        Map<String, Integer> sorted = new LinkedHashMap<>();
        counts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .forEach(e -> sorted.put(e.getKey(), e.getValue()));
        return sorted;
    }

    public int countPosts(long userId) throws DatabaseException {
        return db.execute("Count posts of user", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM posts WHERE creator_id = ?")) {
                ps.setLong(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? rs.getInt(1) : 0;
                }
            }
        });
    }

    // ------------------------------------------------------------------ follows

    public boolean isFollowing(long followerId, long followedId) throws DatabaseException {
        return db.execute("Check follow", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?")) {
                ps.setLong(1, followerId);
                ps.setLong(2, followedId);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next();
                }
            }
        });
    }

    /** Follows or unfollows in a single transaction and keeps both counters consistent. */
    public FollowResult toggleFollow(long followerId, long followedId) throws DatabaseException {
        return db.inTransaction("Toggle follow", conn -> {
            // lock both user rows in id order so concurrent follows cannot deadlock
            try (PreparedStatement lock = conn.prepareStatement(
                    "SELECT id FROM users WHERE id IN (?, ?) ORDER BY id FOR UPDATE")) {
                lock.setLong(1, followerId);
                lock.setLong(2, followedId);
                lock.executeQuery().close();
            }
            boolean nowFollowing;
            try (PreparedStatement del = conn.prepareStatement(
                    "DELETE FROM follows WHERE follower_id = ? AND followed_id = ?")) {
                del.setLong(1, followerId);
                del.setLong(2, followedId);
                nowFollowing = del.executeUpdate() == 0;
            }
            int delta = nowFollowing ? 1 : -1;
            if (nowFollowing) {
                try (PreparedStatement ins = conn.prepareStatement(
                        "INSERT INTO follows (follower_id, followed_id, created_at) VALUES (?, ?, ?)")) {
                    ins.setLong(1, followerId);
                    ins.setLong(2, followedId);
                    ins.setTimestamp(3, nowTimestamp());
                    ins.executeUpdate();
                } catch (SQLIntegrityConstraintViolationException concurrentFollow) {
                    delta = 0; // a parallel request already created this follow
                }
            }
            if (delta != 0) {
                adjustCounter(conn, "following", followerId, delta);
                adjustCounter(conn, "followers", followedId, delta);
            }
            try (PreparedStatement ps = conn.prepareStatement("SELECT followers FROM users WHERE id = ?")) {
                ps.setLong(1, followedId);
                try (ResultSet rs = ps.executeQuery()) {
                    return new FollowResult(nowFollowing, rs.next() ? rs.getInt(1) : 0);
                }
            }
        });
    }

    private static void adjustCounter(Connection conn, String column, long userId, int delta) throws SQLException {
        // column is one of two constants above, never user input
        try (PreparedStatement ps = conn.prepareStatement(
                "UPDATE users SET " + column + " = GREATEST(0, " + column + " + ?) WHERE id = ?")) {
            ps.setInt(1, delta);
            ps.setLong(2, userId);
            ps.executeUpdate();
        }
    }
}
