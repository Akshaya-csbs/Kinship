package com.kinship.app.exceptions;

public class EntityNotFoundException extends KinshipException {
    public EntityNotFoundException(String entityName, Object id) {
        super(entityName + " with identifier '" + id + "' was not found.", "ERR_ENTITY_NOT_FOUND");
    }
}
