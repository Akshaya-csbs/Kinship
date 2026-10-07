package com.kinship.app.interfaces;

import java.util.List;

/**
 * Generic Java Repository Interface.
 */
public interface IRepository<T, ID> {
    T save(T entity);
    T findById(ID id);
    List<T> findAll();
    boolean deleteById(ID id);
    int count();
}
