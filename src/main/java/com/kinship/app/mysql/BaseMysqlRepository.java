package com.kinship.app.mysql;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;

/**
 * Shared plumbing for the MySQL repositories (OOP: INHERITANCE of common behaviour).
 */
public abstract class BaseMysqlRepository {
    protected final MysqlDatabaseManager db;

    protected BaseMysqlRepository() {
        this.db = MysqlDatabaseManager.getInstance();
    }

    protected static Timestamp nowTimestamp() {
        return Timestamp.valueOf(LocalDateTime.now());
    }

    protected static LocalDateTime toLocal(Timestamp ts) {
        return ts != null ? ts.toLocalDateTime() : null;
    }

    /** Reads the AUTO_INCREMENT key produced by an INSERT prepared with RETURN_GENERATED_KEYS. */
    protected static long generatedKey(PreparedStatement ps) throws SQLException {
        try (ResultSet keys = ps.getGeneratedKeys()) {
            if (keys.next()) {
                return keys.getLong(1);
            }
        }
        throw new SQLException("INSERT did not return a generated key");
    }
}
