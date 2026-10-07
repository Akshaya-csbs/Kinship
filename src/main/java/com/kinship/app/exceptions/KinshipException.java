package com.kinship.app.exceptions;

import java.time.LocalDateTime;

/**
 * Base checked exception of the Kinship platform.
 * Every subclass carries a machine readable error code and the HTTP status the
 * REST layer should answer with, so controllers can simply let exceptions propagate.
 */
public class KinshipException extends Exception {
    private final String errorCode;
    private final int httpStatus;
    private final LocalDateTime timestamp;

    public KinshipException(String message, String errorCode) {
        this(message, errorCode, 500, null);
    }

    public KinshipException(String message, String errorCode, int httpStatus) {
        this(message, errorCode, httpStatus, null);
    }

    public KinshipException(String message, String errorCode, int httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.timestamp = LocalDateTime.now();
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
