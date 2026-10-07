package com.kinship.app.mysql;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.models.Collaboration;
import com.kinship.app.models.CollaborationRequest;
import com.kinship.app.models.User;
import com.kinship.app.util.TextUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for collaborations, their members and collaboration requests.
 */
public class MysqlCollaborationRepository extends BaseMysqlRepository {

    public List<Collaboration> findForUser(long userId) throws DatabaseException {
        return db.execute("Load collaborations", conn -> {
            List<Collaboration> list = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement("SELECT c.* FROM collaborations c "
                    + "JOIN collaboration_members cm ON cm.collaboration_id = c.id WHERE cm.user_id = ? "
                    + "ORDER BY c.created_at DESC, c.id DESC")) {
                ps.setLong(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        long id = rs.getLong("id");
                        list.add(new Collaboration(id, rs.getString("title"), rs.getString("description"),
                                rs.getLong("owner_id"), TextUtil.splitList(rs.getString("talents")), rs.getInt("progress"),
                                rs.getString("deadline"), loadMembers(conn, id), toLocal(rs.getTimestamp("created_at"))));
                    }
                }
            }
            return list;
        });
    }

    private List<User> loadMembers(Connection conn, long collaborationId) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement("SELECT " + MysqlUserRepository.userColumns("u", "")
                + " FROM collaboration_members cm JOIN users u ON u.id = cm.user_id WHERE cm.collaboration_id = ?")) {
            ps.setLong(1, collaborationId);
            List<User> members = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    members.add(MysqlUserRepository.mapUser(rs, ""));
                }
            }
            return members;
        }
    }

    /** Creates the collaboration and adds every member in one transaction. */
    public long create(String title, String description, long ownerId, List<String> talents, String deadline,
                       List<Long> memberIds) throws DatabaseException {
        return db.inTransaction("Create collaboration", conn -> createInTransaction(conn, title, description, ownerId,
                talents, deadline, memberIds));
    }

    private long createInTransaction(Connection conn, String title, String description, long ownerId,
                                     List<String> talents, String deadline, List<Long> memberIds) throws SQLException {
        long id;
        try (PreparedStatement ps = conn.prepareStatement("INSERT INTO collaborations (title, description, owner_id, "
                + "talents, progress, deadline, created_at) VALUES (?, ?, ?, ?, 0, ?, ?)", Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, title);
            ps.setString(2, description);
            ps.setLong(3, ownerId);
            ps.setString(4, TextUtil.joinList(talents));
            ps.setString(5, deadline);
            ps.setTimestamp(6, nowTimestamp());
            ps.executeUpdate();
            id = generatedKey(ps);
        }
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT IGNORE INTO collaboration_members (collaboration_id, user_id) VALUES (?, ?)")) {
            for (Long memberId : memberIds) {
                ps.setLong(1, id);
                ps.setLong(2, memberId);
                ps.addBatch();
            }
            ps.executeBatch();
        }
        return id;
    }

    public void updateProgress(long collaborationId, int progress) throws DatabaseException {
        db.execute("Update progress", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("UPDATE collaborations SET progress = ? WHERE id = ?")) {
                ps.setInt(1, progress);
                ps.setLong(2, collaborationId);
                return ps.executeUpdate();
            }
        });
    }

    public boolean isMember(long collaborationId, long userId) throws DatabaseException {
        return db.execute("Check membership", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT 1 FROM collaboration_members WHERE collaboration_id = ? AND user_id = ?")) {
                ps.setLong(1, collaborationId);
                ps.setLong(2, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next();
                }
            }
        });
    }

    // ------------------------------------------------------------------ requests

    private static final String SELECT_REQUESTS = "SELECT r.*, " + MysqlUserRepository.userColumns("u", "u_")
            + " FROM collaboration_requests r JOIN users u ON u.id = r.from_user_id";

    private static CollaborationRequest mapRequest(ResultSet rs) throws SQLException {
        return new CollaborationRequest(rs.getLong("id"), MysqlUserRepository.mapUser(rs, "u_"), rs.getLong("to_user_id"),
                rs.getString("project"), rs.getString("message"),
                CollaborationRequest.Status.valueOf(rs.getString("status")), toLocal(rs.getTimestamp("created_at")));
    }

    public List<CollaborationRequest> findPendingFor(long userId) throws DatabaseException {
        return db.execute("Load collaboration requests", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(SELECT_REQUESTS
                    + " WHERE r.to_user_id = ? AND r.status = 'PENDING' ORDER BY r.created_at DESC, r.id DESC")) {
                ps.setLong(1, userId);
                List<CollaborationRequest> list = new ArrayList<>();
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        list.add(mapRequest(rs));
                    }
                }
                return list;
            }
        });
    }

    public Optional<CollaborationRequest> findRequest(long requestId) throws DatabaseException {
        return db.execute("Find collaboration request", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(SELECT_REQUESTS + " WHERE r.id = ?")) {
                ps.setLong(1, requestId);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? Optional.of(mapRequest(rs)) : Optional.empty();
                }
            }
        });
    }

    public long createRequest(long fromUserId, long toUserId, String project, String message) throws DatabaseException {
        return db.execute("Create collaboration request", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("INSERT INTO collaboration_requests (from_user_id, to_user_id, "
                    + "project, message, status, created_at) VALUES (?, ?, ?, ?, 'PENDING', ?)", Statement.RETURN_GENERATED_KEYS)) {
                ps.setLong(1, fromUserId);
                ps.setLong(2, toUserId);
                ps.setString(3, project);
                ps.setString(4, message);
                ps.setTimestamp(5, nowTimestamp());
                ps.executeUpdate();
                return generatedKey(ps);
            }
        });
    }

    /**
     * Accepts or declines a pending request. Accepting also creates the collaboration with both users,
     * all inside one transaction. Returns the new collaboration id (or 0 when declined / not pending).
     */
    public long respond(CollaborationRequest request, boolean accept) throws DatabaseException {
        return db.inTransaction("Respond to collaboration request", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE collaboration_requests SET status = ? WHERE id = ? AND status = 'PENDING'")) {
                ps.setString(1, accept ? "ACCEPTED" : "DECLINED");
                ps.setLong(2, request.getId());
                if (ps.executeUpdate() == 0) {
                    return 0L;
                }
            }
            if (!accept) {
                return 0L;
            }
            long ownerId = request.getFrom().getId();
            List<String> talents = request.getFrom().getTalents();
            return createInTransaction(conn, request.getProject(), request.getMessage(), ownerId, talents, "TBD",
                    List.of(ownerId, request.getToUserId()));
        });
    }
}
