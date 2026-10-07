package com.kinship.app.exceptions;

/** Thrown when a unique value (email, username, application...) already exists (HTTP 409). */
public class DuplicateEntityException extends KinshipException {
    public DuplicateEntityException(String message) {
        super(message, "ERR_DUPLICATE", 409);
    }
}
