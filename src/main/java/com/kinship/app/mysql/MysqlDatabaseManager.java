package com.kinship.app.mysql;

import com.kinship.app.config.DatabaseConfig;
import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.interfaces.SqlFunction;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.concurrent.atomic.AtomicLong;

/**
 * JDBC connection manager for MySQL (thread-safe singleton).
 * Opens a fresh connection per unit of work, so every HTTP worker thread uses its own connection.
 */
public final class MysqlDatabaseManager {
    /** Bump when the table layout changes; older layouts are dropped and recreated. */
    static final int SCHEMA_VERSION = 2;

    private static volatile MysqlDatabaseManager instance;

    private final DatabaseConfig config;
    private final AtomicLong queryCount = new AtomicLong();
    private volatile String serverVersion = "unknown";

    private MysqlDatabaseManager(DatabaseConfig config) {
        this.config = config;
    }

    public static MysqlDatabaseManager getInstance() {
        if (instance == null) {
            synchronized (MysqlDatabaseManager.class) {
                if (instance == null) {
                    instance = new MysqlDatabaseManager(DatabaseConfig.load());
                }
            }
        }
        return instance;
    }

    /** Loads the driver, checks the connection, creates tables and seed data. */
    public void initialize() throws DatabaseException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new DatabaseException("MySQL JDBC driver (mysql-connector-j) is not on the classpath");
        }
        try (Connection conn = getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            serverVersion = meta.getDatabaseProductName() + " " + meta.getDatabaseProductVersion();
            System.out.println("[MySQL] Connected to " + serverVersion + " at " + config.getUrl());
        } catch (SQLException e) {
            throw new DatabaseException("Cannot connect to MySQL at " + config.getUrl() + " as '" + config.getUser()
                    + "'. Is MySQL running and are the credentials in db.properties correct?", e);
        }
        new SchemaInitializer(this).initialize();
    }

    public Connection getConnection() throws SQLException {
        queryCount.incrementAndGet();
        return DriverManager.getConnection(config.getUrl(), config.getUser(), config.getPassword());
    }

    /** Runs work on its own connection (auto-commit). */
    public <R> R execute(String operation, SqlFunction<R> work) throws DatabaseException {
        try (Connection conn = getConnection()) {
            return work.apply(conn);
        } catch (SQLException e) {
            throw new DatabaseException(operation + " failed", e);
        }
    }

    /**
     * Runs work inside one transaction: commit on success, rollback on any failure.
     * If MySQL aborts the transaction because of a deadlock between concurrent requests,
     * it is retried (up to {@value #MAX_DEADLOCK_RETRIES} times) before giving up.
     */
    public <R> R inTransaction(String operation, SqlFunction<R> work) throws DatabaseException {
        for (int attempt = 1; ; attempt++) {
            try {
                return runTransaction(operation, work);
            } catch (DatabaseException e) {
                if (attempt >= MAX_DEADLOCK_RETRIES || !isDeadlock(e.getCause())) {
                    throw e;
                }
                try {
                    Thread.sleep(10L * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw e;
                }
            }
        }
    }

    private static final int MAX_DEADLOCK_RETRIES = 3;

    /** SQLState 40001 / MySQL error 1213 (deadlock) and 1205 (lock wait timeout). */
    private static boolean isDeadlock(Throwable t) {
        return t instanceof SQLException sql
                && ("40001".equals(sql.getSQLState()) || sql.getErrorCode() == 1213 || sql.getErrorCode() == 1205);
    }

    private <R> R runTransaction(String operation, SqlFunction<R> work) throws DatabaseException {
        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try {
                R result = work.apply(conn);
                conn.commit();
                return result;
            } catch (SQLException | RuntimeException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DatabaseException(operation + " failed (rolled back)", e);
        }
    }

    public boolean isHealthy() {
        try (Connection conn = getConnection(); Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT 1")) {
            return rs.next();
        } catch (SQLException e) {
            return false;
        }
    }

    public long getQueryCount() { return queryCount.get(); }
    public String getServerVersion() { return serverVersion; }
    public String getUrl() { return config.getUrl(); }
}
