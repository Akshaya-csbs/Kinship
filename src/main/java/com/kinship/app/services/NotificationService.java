package com.kinship.app.services;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.GlobalExceptionHandler;
import com.kinship.app.models.Notification;
import com.kinship.app.mysql.MysqlNotificationRepository;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * MULTITHREADING: producer / consumer.
 * HTTP threads (producers) drop notification tasks into a {@link BlockingQueue} and return immediately;
 * one dedicated worker thread (consumer) writes them to MySQL in the background.
 */
public class NotificationService implements AutoCloseable {

    private record NotificationTask(long recipientId, Long actorId, Notification.Type type, String action, String content) {}

    /** Poison pill that tells the worker to stop. */
    private static final NotificationTask STOP = new NotificationTask(-1, null, Notification.Type.SYSTEM, "", "");

    private final BlockingQueue<NotificationTask> queue = new LinkedBlockingQueue<>(10_000);
    private final MysqlNotificationRepository repository;
    private final AtomicLong delivered = new AtomicLong();
    private final AtomicLong failed = new AtomicLong();
    private final Thread worker;

    public NotificationService(MysqlNotificationRepository repository) {
        this.repository = repository;
        this.worker = new Thread(this::runWorker, "kinship-notification-worker");
        this.worker.setDaemon(true);
    }

    public void start() {
        worker.start();
        System.out.println("[NotificationService] Worker thread '" + worker.getName() + "' started.");
    }

    /** Called from request threads; never blocks the HTTP response. Self-notifications are skipped. */
    public void notifyAsync(long recipientId, Long actorId, Notification.Type type, String action, String content) {
        if (actorId != null && actorId == recipientId) {
            return;
        }
        if (!queue.offer(new NotificationTask(recipientId, actorId, type, action, content))) {
            failed.incrementAndGet();
            System.err.println("[NotificationService] Queue full, notification dropped.");
        }
    }

    private void runWorker() {
        while (true) {
            NotificationTask task;
            try {
                task = queue.take();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
            if (task == STOP) {
                return;
            }
            try {
                repository.insert(task.recipientId(), task.actorId(), task.type(), task.action(), task.content());
                delivered.incrementAndGet();
            } catch (DatabaseException e) {
                failed.incrementAndGet();
                GlobalExceptionHandler.getInstance().handleException(e);
            }
        }
    }

    public int getQueueSize() { return queue.size(); }
    public long getDeliveredCount() { return delivered.get(); }
    public long getFailedCount() { return failed.get(); }
    public boolean isWorkerAlive() { return worker.isAlive(); }
    public String getWorkerName() { return worker.getName(); }

    /** Drains what is queued, then stops the worker. */
    @Override
    public void close() {
        try {
            queue.put(STOP);
            worker.join(TimeUnit.SECONDS.toMillis(5));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
