package com.kinship.app.interfaces;

import com.kinship.app.exceptions.DatabaseException;

import java.util.List;
import java.util.Optional;

/**
 * Generic repository contract (CRUD) implemented by every MySQL JDBC repository.
 *
 * @param <T>  entity type
 * @param <ID> primary key type
 */
public interface IRepository<T, ID> {
    T save(T entity) throws DatabaseException;

    Optional<T> findById(ID id) throws DatabaseException;

    List<T> findAll() throws DatabaseException;

    boolean deleteById(ID id) throws DatabaseException;

    int count() throws DatabaseException;
}
