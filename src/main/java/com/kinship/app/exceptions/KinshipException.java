package com.kinship.app.exceptions;

import java.time.LocalDateTime;

/**
 * Base Custom Exception Hierarchy for Kinship Platform.
 */
public class KinshipException extends Exception {
    private final String errorCode;
    private final LocalDateTime timestamp;

    public KinshipException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    public String getErrorCode() {
        return errorCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
