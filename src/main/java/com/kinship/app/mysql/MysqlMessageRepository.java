package com.kinship.app.mysql;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.models.Message;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * JDBC repository for direct messages.
 */
public class MysqlMessageRepository extends BaseMysqlRepository {

    /** One row of the inbox: the other person, the latest message and how many are unread. */
    public record Conversation(CreatorUser otherUser, Message lastMessage, int unread) {}

    private static Message map(ResultSet rs) throws SQLException {
        return new Message(rs.getLong("id"), rs.getLong("sender_id"), rs.getLong("receiver_id"),
                rs.getString("content"), rs.getBoolean("is_read"), toLocal(rs.getTimestamp("created_at")));
    }

    public Message send(long senderId, long receiverId, String content) throws DatabaseException {
        return db.execute("Send message", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("INSERT INTO messages (sender_id, receiver_id, content, "
                    + "created_at) VALUES (?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)) {
                ps.setLong(1, senderId);
                ps.setLong(2, receiverId);
                ps.setString(3, content);
                ps.setTimestamp(4, nowTimestamp());
                ps.executeUpdate();
                long id = generatedKey(ps);
                try (PreparedStatement sel = conn.prepareStatement("SELECT * FROM messages WHERE id = ?")) {
                    sel.setLong(1, id);
                    try (ResultSet rs = sel.executeQuery()) {
                        rs.next();
                        return map(rs);
                    }
                }
            }
        });
    }

    public List<Message> findThread(long userA, long userB) throws DatabaseException {
        return db.execute("Load thread", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?)"
                    + " OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at, id")) {
                ps.setLong(1, userA);
                ps.setLong(2, userB);
                ps.setLong(3, userB);
                ps.setLong(4, userA);
                List<Message> messages = new ArrayList<>();
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        messages.add(map(rs));
                    }
                }
                return messages;
            }
        });
    }

    public int markThreadRead(long readerId, long otherUserId) throws DatabaseException {
        return db.execute("Mark thread read", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE messages SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE")) {
                ps.setLong(1, readerId);
                ps.setLong(2, otherUserId);
                return ps.executeUpdate();
            }
        });
    }

    public List<Conversation> findConversations(long userId) throws DatabaseException {
        String sql = "SELECT m.*, " + MysqlUserRepository.userColumns("u", "u_") + ","
                + " (SELECT COUNT(*) FROM messages x WHERE x.sender_id = t.other_id AND x.receiver_id = ? AND x.is_read = FALSE) AS unread"
                + " FROM (SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id, MAX(id) AS last_id"
                + "       FROM messages WHERE sender_id = ? OR receiver_id = ? GROUP BY other_id) t"
                + " JOIN messages m ON m.id = t.last_id"
                + " JOIN users u ON u.id = t.other_id"
                + " ORDER BY m.created_at DESC, m.id DESC";
        return db.execute("Load conversations", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                for (int i = 1; i <= 4; i++) {
                    ps.setLong(i, userId);
                }
                List<Conversation> list = new ArrayList<>();
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        list.add(new Conversation(MysqlUserRepository.mapUser(rs, "u_"), map(rs), rs.getInt("unread")));
                    }
                }
                return list;
            }
        });
    }

    public int countUnread(long userId) throws DatabaseException {
        return db.execute("Count unread messages", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND is_read = FALSE")) {
                ps.setLong(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? rs.getInt(1) : 0;
                }
            }
        });
    }
}
