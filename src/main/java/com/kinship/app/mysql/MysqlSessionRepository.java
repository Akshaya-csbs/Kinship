package com.kinship.app.mysql;

import com.kinship.app.exceptions.DatabaseException;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Login sessions are stored in MySQL so users stay signed in when the server restarts.
 */
public class MysqlSessionRepository extends BaseMysqlRepository {

    public void create(String token, long userId, LocalDateTime expiresAt) throws DatabaseException {
        db.execute("Create session", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")) {
                ps.setString(1, token);
                ps.setLong(2, userId);
                ps.setTimestamp(3, Timestamp.valueOf(expiresAt));
                return ps.executeUpdate();
            }
        });
    }

    public Optional<Long> findValidUserId(String token) throws DatabaseException {
        return db.execute("Find session", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?")) {
                ps.setString(1, token);
                ps.setTimestamp(2, nowTimestamp());
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? Optional.of(rs.getLong(1)) : Optional.empty();
                }
            }
        });
    }

    public void delete(String token) throws DatabaseException {
        db.execute("Delete session", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM sessions WHERE token = ?")) {
                ps.setString(1, token);
                return ps.executeUpdate();
            }
        });
    }

    public int deleteExpired() throws DatabaseException {
        return db.execute("Delete expired sessions", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM sessions WHERE expires_at <= ?")) {
                ps.setTimestamp(1, nowTimestamp());
                return ps.executeUpdate();
            }
        });
    }
}
