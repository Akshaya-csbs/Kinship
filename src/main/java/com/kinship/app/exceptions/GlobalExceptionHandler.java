package com.kinship.app.exceptions;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class GlobalExceptionHandler {
    private static GlobalExceptionHandler instance;
    private final List<String> exceptionLogs = Collections.synchronizedList(new ArrayList<>());

    private GlobalExceptionHandler() {}

    public static synchronized GlobalExceptionHandler getInstance() {
        if (instance == null) {
            instance = new GlobalExceptionHandler();
        }
        return instance;
    }

    public void handleException(Throwable t) {
        String logEntry = "[" + System.currentTimeMillis() + "] " + t.getClass().getSimpleName() + ": " + t.getMessage();
        System.err.println("[GlobalExceptionHandler] " + logEntry);
        exceptionLogs.add(0, logEntry);
        if (exceptionLogs.size() > 50) {
            exceptionLogs.remove(exceptionLogs.size() - 1);
        }
    }

    public List<String> getExceptionLogs() {
        return new ArrayList<>(exceptionLogs);
    }
}
