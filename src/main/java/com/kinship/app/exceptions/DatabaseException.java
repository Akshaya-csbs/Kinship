package com.kinship.app.exceptions;

import java.sql.SQLException;

/** Wraps a JDBC {@link SQLException} so callers get a meaningful message (HTTP 500). */
public class DatabaseException extends KinshipException {
    public DatabaseException(String message, SQLException cause) {
        super(message + (cause != null ? " [SQLState: " + cause.getSQLState() + "]: " + cause.getMessage() : ""),
                "ERR_DATABASE_FAILURE", 500, cause);
    }

    public DatabaseException(String message) {
        super(message, "ERR_DATABASE_FAILURE", 500);
    }
}
