package com.kinship.app;

import com.kinship.app.controllers.AuthController;
import com.kinship.app.controllers.CollaborationController;
import com.kinship.app.controllers.CreatorController;
import com.kinship.app.controllers.FeedController;
import com.kinship.app.controllers.MessageController;
import com.kinship.app.controllers.NotificationController;
import com.kinship.app.controllers.OpportunityController;
import com.kinship.app.controllers.SystemController;
import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.http.ApiServer;
import com.kinship.app.http.Router;
import com.kinship.app.interfaces.Controller;
import com.kinship.app.mysql.MysqlCollaborationRepository;
import com.kinship.app.mysql.MysqlDatabaseManager;
import com.kinship.app.mysql.MysqlMessageRepository;
import com.kinship.app.mysql.MysqlNotificationRepository;
import com.kinship.app.mysql.MysqlOpportunityRepository;
import com.kinship.app.mysql.MysqlPostRepository;
import com.kinship.app.mysql.MysqlSessionRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.services.AuthService;
import com.kinship.app.services.BackgroundScheduler;
import com.kinship.app.services.NotificationService;
import com.kinship.app.services.TalentMatchingService;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Entry point: wires the MySQL repositories, services and controllers together and starts
 * a multithreaded HTTP server on port 8080 (override with KINSHIP_PORT).
 *
 * <pre>
 *   Threads at runtime
 *   kinship-http-N              handle HTTP requests (fixed ThreadPoolExecutor)
 *   kinship-worker-N            parallel talent matching + stats queries
 *   kinship-notification-worker writes notifications from a BlockingQueue
 *   kinship-scheduler-N         periodic trending refresh / session cleanup
 * </pre>
 */
public class KinshipServer {
    private static final int HTTP_THREADS = 10;

    private final int port;
    private HttpServer httpServer;
    private ThreadPoolExecutor httpPool;
    private ExecutorService workerPool;
    private NotificationService notificationService;
    private BackgroundScheduler scheduler;

    public KinshipServer(int port) {
        this.port = port;
    }

    private static ThreadFactory namedThreads(String prefix, boolean daemon) {
        AtomicInteger counter = new AtomicInteger();
        return r -> {
            Thread t = new Thread(r, prefix + counter.incrementAndGet());
            t.setDaemon(daemon);
            return t;
        };
    }

    public void start() throws IOException, DatabaseException {
        MysqlDatabaseManager.getInstance().initialize();

        // repositories (JDBC)
        MysqlUserRepository users = new MysqlUserRepository();
        MysqlPostRepository posts = new MysqlPostRepository();
        MysqlOpportunityRepository opportunities = new MysqlOpportunityRepository();
        MysqlNotificationRepository notificationRepo = new MysqlNotificationRepository();
        MysqlMessageRepository messages = new MysqlMessageRepository();
        MysqlCollaborationRepository collaborations = new MysqlCollaborationRepository();
        MysqlSessionRepository sessions = new MysqlSessionRepository();

        // services (multithreading)
        httpPool = new ThreadPoolExecutor(HTTP_THREADS, HTTP_THREADS, 0L, TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(), namedThreads("kinship-http-", false));
        workerPool = Executors.newFixedThreadPool(Math.max(2, Runtime.getRuntime().availableProcessors()),
                namedThreads("kinship-worker-", true));
        notificationService = new NotificationService(notificationRepo);
        AuthService auth = new AuthService(users, sessions, notificationService);
        scheduler = new BackgroundScheduler(users, auth);
        TalentMatchingService matcher = new TalentMatchingService(workerPool);

        // controllers (REST endpoints)
        Router router = new Router();
        List<Controller> controllers = List.of(
                new AuthController(users, auth, notificationRepo, messages),
                new CreatorController(users, posts, notificationService, matcher, scheduler),
                new FeedController(users, posts, notificationService),
                new OpportunityController(users, opportunities, notificationService),
                new NotificationController(users, notificationRepo),
                new MessageController(users, messages, notificationService),
                new CollaborationController(users, collaborations, notificationService),
                new SystemController(users, posts, opportunities, notificationService, scheduler, auth, httpPool,
                        workerPool, router));
        controllers.forEach(c -> c.registerRoutes(router));

        notificationService.start();
        scheduler.start();

        httpServer = HttpServer.create(new InetSocketAddress(port), 0);
        httpServer.createContext("/api", new ApiServer(router, auth));
        httpServer.setExecutor(httpPool);
        httpServer.start();

        System.out.println("=================================================");
        System.out.println(" Kinship Java backend running on http://localhost:" + port + "/api");
        System.out.println(" " + router.size() + " endpoints, " + HTTP_THREADS + " HTTP worker threads");
        System.out.println(" Health: http://localhost:" + port + "/api/system/health");
        System.out.println("=================================================");
    }

    /** Graceful shutdown: stop accepting requests, drain queues, stop all thread pools. */
    public void stop() {
        System.out.println("[KinshipServer] Shutting down...");
        if (httpServer != null) httpServer.stop(1);
        if (httpPool != null) httpPool.shutdown();
        if (scheduler != null) scheduler.close();
        if (notificationService != null) notificationService.close();
        if (workerPool != null) workerPool.shutdownNow();
        System.out.println("[KinshipServer] Stopped.");
    }

    public static void main(String[] args) {
        int port = Integer.parseInt(System.getenv().getOrDefault("KINSHIP_PORT", "8080"));
        KinshipServer server = new KinshipServer(port);
        try {
            server.start();
            Runtime.getRuntime().addShutdownHook(new Thread(server::stop, "kinship-shutdown"));
        } catch (DatabaseException e) {
            System.err.println();
            System.err.println("Could not start: " + e.getMessage());
            System.err.println("Fix: start MySQL and put your credentials in db.properties (see db.properties.example).");
            server.stop();
            System.exit(1);
        } catch (IOException e) {
            System.err.println("Could not open port " + port + ": " + e.getMessage());
            server.stop();
            System.exit(1);
        }
    }
}
