package com.kinship.app.exceptions;

import java.util.List;

public class ValidationException extends KinshipException {
    private final List<String> errors;

    public ValidationException(String message, List<String> errors) {
        super(message, "ERR_VALIDATION_FAILED");
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
