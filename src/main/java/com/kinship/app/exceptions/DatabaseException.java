package com.kinship.app.exceptions;

import java.sql.SQLException;

public class DatabaseException extends KinshipException {
    public DatabaseException(String message, SQLException cause) {
        super(message + (cause != null ? " [SQLState: " + cause.getSQLState() + "]: " + cause.getMessage() : ""), "ERR_DATABASE_FAILURE");
    }

    public DatabaseException(String message) {
        super(message, "ERR_DATABASE_FAILURE");
    }
}
