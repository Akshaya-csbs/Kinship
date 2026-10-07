package com.kinship.app.services;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

/**
 * Lock-free request counters shared by all HTTP worker threads
 * (AtomicLong / LongAdder / ConcurrentHashMap instead of synchronized blocks).
 */
public final class ServerMetrics {
    private static final ServerMetrics INSTANCE = new ServerMetrics();

    private final Instant startedAt = Instant.now();
    private final AtomicLong totalRequests = new AtomicLong();
    private final AtomicLong failedRequests = new AtomicLong();
    private final ConcurrentHashMap<String, LongAdder> perEndpoint = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LongAdder> perThread = new ConcurrentHashMap<>();

    private ServerMetrics() {}

    public static ServerMetrics getInstance() {
        return INSTANCE;
    }

    public void recordRequest(String endpoint) {
        totalRequests.incrementAndGet();
        perEndpoint.computeIfAbsent(endpoint, k -> new LongAdder()).increment();
        perThread.computeIfAbsent(Thread.currentThread().getName(), k -> new LongAdder()).increment();
    }

    public void recordFailure() {
        failedRequests.incrementAndGet();
    }

    public long getTotalRequests() { return totalRequests.get(); }
    public long getFailedRequests() { return failedRequests.get(); }
    public long getUptimeSeconds() { return Duration.between(startedAt, Instant.now()).getSeconds(); }

    public Map<String, Long> getEndpointHits() {
        Map<String, Long> copy = new TreeMap<>();
        perEndpoint.forEach((k, v) -> copy.put(k, v.sum()));
        return copy;
    }

    public Map<String, Long> getRequestsPerThread() {
        Map<String, Long> copy = new TreeMap<>();
        perThread.forEach((k, v) -> copy.put(k, v.sum()));
        return copy;
    }
}
