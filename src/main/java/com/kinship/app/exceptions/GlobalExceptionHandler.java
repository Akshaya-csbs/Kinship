package com.kinship.app.exceptions;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Central place that turns any exception into a log entry and a JSON error body.
 * Thread-safe singleton: it is called concurrently from every HTTP worker thread.
 */
public final class GlobalExceptionHandler {
    private static final int MAX_LOGS = 50;
    private static volatile GlobalExceptionHandler instance;

    private final List<String> exceptionLogs = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong handledCount = new AtomicLong();

    private GlobalExceptionHandler() {}

    /** Double-checked locking singleton. */
    public static GlobalExceptionHandler getInstance() {
        if (instance == null) {
            synchronized (GlobalExceptionHandler.class) {
                if (instance == null) {
                    instance = new GlobalExceptionHandler();
                }
            }
        }
        return instance;
    }

    public void handleException(Throwable t) {
        handledCount.incrementAndGet();
        String logEntry = "[" + LocalDateTime.now() + "] [" + Thread.currentThread().getName() + "] "
                + t.getClass().getSimpleName() + ": " + t.getMessage();
        System.err.println("[GlobalExceptionHandler] " + logEntry);
        synchronized (exceptionLogs) {
            exceptionLogs.add(0, logEntry);
            if (exceptionLogs.size() > MAX_LOGS) {
                exceptionLogs.remove(exceptionLogs.size() - 1);
            }
        }
    }

    /** HTTP status to answer with for the given exception. */
    public int statusFor(Throwable t) {
        if (t instanceof KinshipException ke) {
            return ke.getHttpStatus();
        }
        return 500;
    }

    /** JSON-ready error body for the given exception. */
    public Map<String, Object> toErrorBody(Throwable t) {
        Map<String, Object> body = new LinkedHashMap<>();
        if (t instanceof KinshipException ke) {
            body.put("error", ke.getMessage());
            body.put("code", ke.getErrorCode());
            if (ke instanceof ValidationException ve) {
                body.put("details", ve.getErrors());
            }
        } else {
            body.put("error", "Internal server error");
            body.put("code", "ERR_INTERNAL");
        }
        return body;
    }

    public List<String> getExceptionLogs() {
        synchronized (exceptionLogs) {
            return new ArrayList<>(exceptionLogs);
        }
    }

    public long getHandledCount() {
        return handledCount.get();
    }
}
