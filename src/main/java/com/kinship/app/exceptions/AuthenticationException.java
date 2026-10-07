package com.kinship.app.exceptions;

/** Thrown when credentials are wrong or a session token is missing/expired (HTTP 401). */
public class AuthenticationException extends KinshipException {
    public AuthenticationException(String message) {
        super(message, "ERR_UNAUTHORIZED", 401);
    }
}
