package com.kinship.app.mysql;

import com.kinship.app.interfaces.IRepository;
import com.kinship.app.models.EventOpportunity;
import com.kinship.app.models.Opportunity;
import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.GlobalExceptionHandler;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MysqlOpportunityRepository implements IRepository<Opportunity, Long> {
    private final MysqlDatabaseManager dbManager;

    public MysqlOpportunityRepository() {
        this.dbManager = MysqlDatabaseManager.getInstance();
    }

    @Override
    public Opportunity save(Opportunity opp) {
        String sql = "REPLACE INTO opportunities (id, title, type, category, location, date, description, image, applicants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, opp.getId());
            stmt.setString(2, opp.getTitle());
            stmt.setString(3, opp.getType());
            stmt.setString(4, opp.getCategory());
            stmt.setString(5, opp.getLocation());
            stmt.setString(6, opp.getDate());
            stmt.setString(7, opp.getDescription());
            stmt.setString(8, opp.getImage());
            stmt.setInt(9, opp.getApplicants());

            stmt.executeUpdate();
            return opp;
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL Opportunity save failed", e));
            return null;
        }
    }

    @Override
    public Opportunity findById(Long id) {
        String sql = "SELECT * FROM opportunities WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToOpportunity(rs);
                }
            }
        } catch (Exception e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL Opportunity findById failed", null));
        }
        return null;
    }

    @Override
    public List<Opportunity> findAll() {
        List<Opportunity> list = new ArrayList<>();
        String sql = "SELECT * FROM opportunities ORDER BY applicants DESC";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Opportunity o = mapRowToOpportunity(rs);
                if (o != null) list.add(o);
            }
        } catch (Exception e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL Opportunity findAll failed", null));
        }
        return list;
    }

    @Override
    public boolean deleteById(Long id) {
        String sql = "DELETE FROM opportunities WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL Opportunity delete failed", e));
            return false;
        }
    }

    @Override
    public int count() {
        String sql = "SELECT COUNT(*) FROM opportunities";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL count failed", e));
        }
        return 0;
    }

    public boolean applyToOpportunity(Long id) {
        String sql = "UPDATE opportunities SET applicants = applicants + 1 WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("MySQL apply failed", e));
            return false;
        }
    }

    private Opportunity mapRowToOpportunity(ResultSet rs) throws SQLException {
        long id = rs.getLong("id");
        String title = rs.getString("title");
        String type = rs.getString("type");
        String category = rs.getString("category");
        String location = rs.getString("location");
        String date = rs.getString("date");
        String description = rs.getString("description");
        String image = rs.getString("image");
        int applicants = rs.getInt("applicants");

        if ("Event".equalsIgnoreCase(type)) {
            return new EventOpportunity(id, title, category, location, date, description, image, applicants);
        } else if ("Gig".equalsIgnoreCase(type)) {
            return new EventOpportunity(id, title, category, location, date, description, image, applicants);
        } else {
            return new EventOpportunity(id, title, category, location, date, description, image, applicants);
        }
    }
}
