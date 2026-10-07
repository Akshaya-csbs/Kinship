package com.kinship.app.exceptions;

import java.util.Collections;
import java.util.List;

/** Thrown when user input breaks a business rule (HTTP 400). */
public class ValidationException extends KinshipException {
    private final List<String> errors;

    public ValidationException(String message) {
        this(message, Collections.singletonList(message));
    }

    public ValidationException(String message, List<String> errors) {
        super(message, "ERR_VALIDATION_FAILED", 400);
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
