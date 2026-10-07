package com.kinship.app.mysql;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.models.Notification;
import com.kinship.app.models.User;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

/**
 * JDBC repository for the notifications table.
 */
public class MysqlNotificationRepository extends BaseMysqlRepository {

    public void insert(long recipientId, Long actorId, Notification.Type type, String action, String content)
            throws DatabaseException {
        db.execute("Insert notification", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("INSERT INTO notifications (user_id, actor_id, type, action, "
                    + "content, created_at) VALUES (?, ?, ?, ?, ?, ?)")) {
                ps.setLong(1, recipientId);
                if (actorId == null) ps.setNull(2, Types.BIGINT);
                else ps.setLong(2, actorId);
                ps.setString(3, type.name());
                ps.setString(4, action);
                ps.setString(5, content);
                ps.setTimestamp(6, nowTimestamp());
                return ps.executeUpdate();
            }
        });
    }

    public List<Notification> findForUser(long userId) throws DatabaseException {
        String sql = "SELECT n.*, " + MysqlUserRepository.userColumns("u", "u_")
                + " FROM notifications n LEFT JOIN users u ON u.id = n.actor_id"
                + " WHERE n.user_id = ? ORDER BY n.created_at DESC, n.id DESC LIMIT 100";
        return db.execute("Load notifications", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setLong(1, userId);
                List<Notification> list = new ArrayList<>();
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        rs.getLong("u_id");
                        User actor = rs.wasNull() ? null : MysqlUserRepository.mapUser(rs, "u_");
                        list.add(new Notification(rs.getLong("id"), rs.getLong("user_id"), actor,
                                Notification.Type.valueOf(rs.getString("type")), rs.getString("action"),
                                rs.getString("content"), rs.getBoolean("is_read"), toLocal(rs.getTimestamp("created_at"))));
                    }
                }
                return list;
            }
        });
    }

    public int countUnread(long userId) throws DatabaseException {
        return db.execute("Count unread notifications", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE")) {
                ps.setLong(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? rs.getInt(1) : 0;
                }
            }
        });
    }

    public int markAllRead(long userId) throws DatabaseException {
        return db.execute("Mark notifications read", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE")) {
                ps.setLong(1, userId);
                return ps.executeUpdate();
            }
        });
    }

    public boolean markRead(long notificationId, long userId) throws DatabaseException {
        return db.execute("Mark notification read", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?")) {
                ps.setLong(1, notificationId);
                ps.setLong(2, userId);
                return ps.executeUpdate() > 0;
            }
        });
    }
}
