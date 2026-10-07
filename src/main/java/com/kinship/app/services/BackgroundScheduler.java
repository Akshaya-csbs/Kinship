package com.kinship.app.services;

import com.kinship.app.exceptions.GlobalExceptionHandler;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.mysql.MysqlUserRepository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * MULTITHREADING: periodic background jobs on a {@link ScheduledExecutorService}.
 * <ul>
 *   <li>every 30s: recompute the trending creators list (published through an AtomicReference)</li>
 *   <li>every 10min: delete expired login sessions</li>
 * </ul>
 */
public class BackgroundScheduler implements AutoCloseable {
    private final ScheduledExecutorService scheduler;
    private final MysqlUserRepository users;
    private final AuthService auth;

    private final AtomicReference<List<Long>> trendingCreatorIds = new AtomicReference<>(List.of());
    private final AtomicLong jobRuns = new AtomicLong();
    private volatile LocalDateTime lastTrendingRefresh;

    public BackgroundScheduler(MysqlUserRepository users, AuthService auth) {
        this.users = users;
        this.auth = auth;
        AtomicInteger counter = new AtomicInteger();
        this.scheduler = Executors.newScheduledThreadPool(2, r -> {
            Thread t = new Thread(r, "kinship-scheduler-" + counter.incrementAndGet());
            t.setDaemon(true);
            return t;
        });
    }

    public void start() {
        scheduler.scheduleAtFixedRate(this::refreshTrending, 0, 30, TimeUnit.SECONDS);
        scheduler.scheduleAtFixedRate(this::purgeSessions, 1, 10, TimeUnit.MINUTES);
        System.out.println("[BackgroundScheduler] Scheduled trending refresh (30s) and session cleanup (10min).");
    }

    private void refreshTrending() {
        try {
            List<Long> ids = users.findAll().stream()
                    .sorted(Comparator.comparingInt(CreatorUser::getFollowers).reversed())
                    .map(CreatorUser::getId)
                    .limit(10)
                    .toList();
            trendingCreatorIds.set(ids);
            lastTrendingRefresh = LocalDateTime.now();
            jobRuns.incrementAndGet();
        } catch (Exception e) {
            // an exception escaping a scheduled task would silently cancel all future runs
            GlobalExceptionHandler.getInstance().handleException(e);
        }
    }

    private void purgeSessions() {
        try {
            int removed = auth.purgeExpiredSessions();
            jobRuns.incrementAndGet();
            if (removed > 0) {
                System.out.println("[BackgroundScheduler] Removed " + removed + " expired sessions.");
            }
        } catch (Exception e) {
            GlobalExceptionHandler.getInstance().handleException(e);
        }
    }

    public List<Long> getTrendingCreatorIds() { return trendingCreatorIds.get(); }
    public long getJobRuns() { return jobRuns.get(); }
    public LocalDateTime getLastTrendingRefresh() { return lastTrendingRefresh; }

    @Override
    public void close() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(3, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
