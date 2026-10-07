package com.kinship.app.controllers;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.GlobalExceptionHandler;
import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.http.ApiRequest;
import com.kinship.app.http.Router;
import com.kinship.app.interfaces.IRepository;
import com.kinship.app.mysql.MysqlDatabaseManager;
import com.kinship.app.mysql.MysqlOpportunityRepository;
import com.kinship.app.mysql.MysqlPostRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.services.AuthService;
import com.kinship.app.services.BackgroundScheduler;
import com.kinship.app.services.NotificationService;
import com.kinship.app.services.ServerMetrics;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Health check and a live view of the Java concepts at work inside the server.
 */
public class SystemController extends BaseController {
    private final MysqlPostRepository posts;
    private final MysqlOpportunityRepository opportunities;
    private final NotificationService notifications;
    private final BackgroundScheduler scheduler;
    private final AuthService auth;
    private final ThreadPoolExecutor httpPool;
    private final ExecutorService workerPool;
    private final Router router;

    public SystemController(MysqlUserRepository users, MysqlPostRepository posts, MysqlOpportunityRepository opportunities,
                            NotificationService notifications, BackgroundScheduler scheduler, AuthService auth,
                            ThreadPoolExecutor httpPool, ExecutorService workerPool, Router router) {
        super(users);
        this.posts = posts;
        this.opportunities = opportunities;
        this.notifications = notifications;
        this.scheduler = scheduler;
        this.auth = auth;
        this.httpPool = httpPool;
        this.workerPool = workerPool;
        this.router = router;
    }

    @Override
    public void registerRoutes(Router router) {
        router.get("/api/system/health", this::health);
        router.get("/api/system/stats", this::stats);
        router.get("/api/system/oop-metrics", this::stats);
    }

    private Object health(ApiRequest req) {
        MysqlDatabaseManager db = MysqlDatabaseManager.getInstance();
        boolean up = db.isHealthy();
        return obj("status", up ? "UP" : "DEGRADED", "database", up ? "CONNECTED" : "UNREACHABLE",
                "server", "Kinship Java HTTP Server");
    }

    /** Counts the three tables in parallel (one CompletableFuture each) and joins the results. */
    private <T> CompletableFuture<Integer> countAsync(IRepository<T, Long> repository) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return repository.count();
            } catch (DatabaseException e) {
                throw new CompletionException(e);
            }
        }, workerPool);
    }

    private Object stats(ApiRequest req) throws KinshipException {
        CompletableFuture<Integer> userCount = countAsync(users);
        CompletableFuture<Integer> postCount = countAsync(posts);
        CompletableFuture<Integer> oppCount = countAsync(opportunities);
        try {
            CompletableFuture.allOf(userCount, postCount, oppCount).join();
        } catch (CompletionException e) {
            if (e.getCause() instanceof KinshipException ke) throw ke;
            throw e;
        }
        MysqlDatabaseManager db = MysqlDatabaseManager.getInstance();
        ServerMetrics metrics = ServerMetrics.getInstance();
        GlobalExceptionHandler errors = GlobalExceptionHandler.getInstance();

        Map<String, Object> database = obj(
                "product", db.getServerVersion(),
                "url", db.getUrl().replaceAll("password=[^&]*", "password=***"),
                "connectionsOpened", db.getQueryCount(),
                "users", userCount.join(),
                "posts", postCount.join(),
                "opportunities", oppCount.join());

        Map<String, Object> threads = obj(
                "httpPoolSize", httpPool.getPoolSize(),
                "httpPoolMax", httpPool.getMaximumPoolSize(),
                "httpActive", httpPool.getActiveCount(),
                "httpCompletedTasks", httpPool.getCompletedTaskCount(),
                "currentThread", Thread.currentThread().getName(),
                "notificationWorker", notifications.getWorkerName(),
                "notificationWorkerAlive", notifications.isWorkerAlive(),
                "notificationQueue", notifications.getQueueSize(),
                "notificationsDelivered", notifications.getDeliveredCount(),
                "scheduledJobRuns", scheduler.getJobRuns(),
                "lastTrendingRefresh", String.valueOf(scheduler.getLastTrendingRefresh()),
                "jvmLiveThreads", Thread.activeCount(),
                "requestsPerThread", metrics.getRequestsPerThread());

        Map<String, Object> exceptions = obj(
                "handled", errors.getHandledCount(),
                "failedRequests", metrics.getFailedRequests(),
                "recent", errors.getExceptionLogs().stream().limit(5).toList());

        return obj(
                "server", "Kinship Java HTTP Server v1.0",
                "jdbc", "MySQL via JDBC (mysql-connector-j)",
                "javaVersion", System.getProperty("java.version"),
                "uptimeSeconds", metrics.getUptimeSeconds(),
                "totalRequests", metrics.getTotalRequests(),
                "activeSessions", auth.getActiveSessionCount(),
                "endpoints", router.size(),
                "userCount", userCount.join(),
                "postCount", postCount.join(),
                "opportunityCount", oppCount.join(),
                "database", database,
                "threads", threads,
                "exceptions", exceptions,
                "endpointHits", metrics.getEndpointHits());
    }
}
