package com.kinship.app.interfaces;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * A unit of JDBC work executed on a {@link Connection}.
 */
@FunctionalInterface
public interface SqlFunction<R> {
    R apply(Connection connection) throws SQLException;
}
