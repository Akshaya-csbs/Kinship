package com.kinship.app.exceptions;

/** Thrown when a requested row does not exist in the database (HTTP 404). */
public class EntityNotFoundException extends KinshipException {
    public EntityNotFoundException(String entityName, Object id) {
        super(entityName + " with identifier '" + id + "' was not found.", "ERR_ENTITY_NOT_FOUND", 404);
    }
}
