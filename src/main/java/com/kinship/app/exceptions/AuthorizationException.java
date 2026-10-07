package com.kinship.app.exceptions;

/** Thrown when a logged-in user tries to touch something they do not own (HTTP 403). */
public class AuthorizationException extends KinshipException {
    public AuthorizationException(String message) {
        super(message, "ERR_FORBIDDEN", 403);
    }
}
