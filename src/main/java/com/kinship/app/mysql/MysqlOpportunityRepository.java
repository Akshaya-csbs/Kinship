package com.kinship.app.mysql;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.interfaces.IRepository;
import com.kinship.app.models.Opportunity;
import com.kinship.app.models.OpportunityFactory;
import com.kinship.app.util.TextUtil;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for opportunities and applications.
 */
public class MysqlOpportunityRepository extends BaseMysqlRepository implements IRepository<Opportunity, Long> {

    public record ApplyResult(boolean newlyApplied, int applicants) {}

    private static final String SELECT_OPPS = "SELECT o.*, EXISTS(SELECT 1 FROM applications a "
            + "WHERE a.opportunity_id = o.id AND a.user_id = ?) AS applied_by_viewer FROM opportunities o";

    private Opportunity map(ResultSet rs) throws SQLException {
        Opportunity o = OpportunityFactory.create(
                rs.getString("type"), rs.getLong("id"), rs.getString("title"), rs.getString("category"),
                rs.getString("organizer"), rs.getString("location"), rs.getString("event_date"),
                rs.getString("compensation"), rs.getString("deadline"), rs.getString("description"),
                rs.getString("image"), TextUtil.splitList(rs.getString("talents")), rs.getInt("applicants"),
                rs.getBoolean("featured"), toLocal(rs.getTimestamp("created_at")));
        o.setAppliedByViewer(rs.getBoolean("applied_by_viewer"));
        return o;
    }

    @Override
    public Opportunity save(Opportunity opp) throws DatabaseException {
        if (opp.getId() != 0) {
            throw new DatabaseException("Opportunities are immutable once published");
        }
        String sql = "INSERT INTO opportunities (title, type, category, organizer, location, event_date, compensation, "
                + "deadline, description, image, talents, featured, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        long id = db.execute("Insert opportunity", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, opp.getTitle());
                ps.setString(2, opp.getType());
                ps.setString(3, opp.getCategory());
                ps.setString(4, opp.getOrganizer());
                ps.setString(5, opp.getLocation());
                ps.setString(6, opp.getDate());
                ps.setString(7, opp.getCompensation());
                ps.setString(8, opp.getDeadline());
                ps.setString(9, opp.getDescription());
                ps.setString(10, opp.getImage());
                ps.setString(11, TextUtil.joinList(opp.getTalents()));
                ps.setBoolean(12, opp.isFeatured());
                ps.setTimestamp(13, nowTimestamp());
                ps.executeUpdate();
                return generatedKey(ps);
            }
        });
        opp.assignId(id);
        return opp;
    }

    @Override
    public Optional<Opportunity> findById(Long id) throws DatabaseException {
        return findById(id, 0);
    }

    public Optional<Opportunity> findById(long id, long viewerId) throws DatabaseException {
        return db.execute("Find opportunity", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(SELECT_OPPS + " WHERE o.id = ?")) {
                ps.setLong(1, viewerId);
                ps.setLong(2, id);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? Optional.of(map(rs)) : Optional.empty();
                }
            }
        });
    }

    @Override
    public List<Opportunity> findAll() throws DatabaseException {
        return findAll(0, null);
    }

    /** All opportunities, optionally only one type (Event, Gig, Collab, Competition, Workshop). */
    public List<Opportunity> findAll(long viewerId, String type) throws DatabaseException {
        boolean filter = !TextUtil.isBlank(type) && !"all".equalsIgnoreCase(type);
        String sql = SELECT_OPPS + (filter ? " WHERE LOWER(o.type) = LOWER(?)" : "")
                + " ORDER BY o.featured DESC, o.applicants DESC";
        return db.execute("Load opportunities", conn -> {
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setLong(1, viewerId);
                if (filter) {
                    ps.setString(2, type);
                }
                List<Opportunity> list = new ArrayList<>();
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        list.add(map(rs));
                    }
                }
                return list;
            }
        });
    }

    @Override
    public boolean deleteById(Long id) throws DatabaseException {
        return db.execute("Delete opportunity", conn -> {
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM opportunities WHERE id = ?")) {
                ps.setLong(1, id);
                return ps.executeUpdate() > 0;
            }
        });
    }

    @Override
    public int count() throws DatabaseException {
        return db.execute("Count opportunities", conn -> {
            try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM opportunities")) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        });
    }

    /**
     * Records an application. The (user, opportunity) primary key makes a second application fail with
     * {@link SQLIntegrityConstraintViolationException}, which is caught and reported as "already applied".
     */
    public ApplyResult apply(long userId, long opportunityId) throws DatabaseException {
        return db.inTransaction("Apply to opportunity", conn -> {
            boolean inserted;
            try (PreparedStatement ins = conn.prepareStatement(
                    "INSERT INTO applications (user_id, opportunity_id, created_at) VALUES (?, ?, ?)")) {
                ins.setLong(1, userId);
                ins.setLong(2, opportunityId);
                ins.setTimestamp(3, nowTimestamp());
                ins.executeUpdate();
                inserted = true;
            } catch (SQLIntegrityConstraintViolationException duplicate) {
                inserted = false;
            }
            if (inserted) {
                try (PreparedStatement upd = conn.prepareStatement(
                        "UPDATE opportunities SET applicants = applicants + 1 WHERE id = ?")) {
                    upd.setLong(1, opportunityId);
                    upd.executeUpdate();
                }
            }
            try (PreparedStatement ps = conn.prepareStatement("SELECT applicants FROM opportunities WHERE id = ?")) {
                ps.setLong(1, opportunityId);
                try (ResultSet rs = ps.executeQuery()) {
                    return new ApplyResult(inserted, rs.next() ? rs.getInt(1) : 0);
                }
            }
        });
    }
}
