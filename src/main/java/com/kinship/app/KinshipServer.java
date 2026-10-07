package com.kinship.app;

import com.kinship.app.db.DatabaseManager;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.models.ImagePost;
import com.kinship.app.models.Opportunity;
import com.kinship.app.models.Post;
import com.kinship.app.repositories.OpportunityJdbcRepository;
import com.kinship.app.repositories.PostJdbcRepository;
import com.kinship.app.repositories.UserJdbcRepository;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.Executors;

/**
 * Java Backend REST HTTP Server with JDBC Connectivity and ThreadPool
 */
public class KinshipServer {
    private static final int PORT = 8080;

    private final UserJdbcRepository userRepo;
    private final PostJdbcRepository postRepo;
    private final OpportunityJdbcRepository oppRepo;

    public KinshipServer() {
        // Initialize JDBC Database Manager & Repositories
        DatabaseManager.getInstance();
        this.userRepo = new UserJdbcRepository();
        this.postRepo = new PostJdbcRepository();
        this.oppRepo = new OpportunityJdbcRepository();
    }

    public void start() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // API Endpoints
        server.createContext("/api/feed", new FeedHandler());
        server.createContext("/api/feed/create", new CreatePostHandler());
        server.createContext("/api/creators", new CreatorsHandler());
        server.createContext("/api/opportunities", new OpportunitiesHandler());
        server.createContext("/api/opportunities/apply", new ApplyOpportunityHandler());
        server.createContext("/api/system/oop-metrics", new SystemMetricsHandler());

        // Java Multithreaded Executor Pool for HTTP Requests
        server.setExecutor(Executors.newFixedThreadPool(10));
        server.start();

        System.out.println("=================================================");
        System.out.println("🚀 Kinship Java JDBC Backend Server Started!");
        System.out.println("🌐 URL: http://localhost:" + PORT + "/api/feed");
        System.out.println("💾 JDBC DB: Connected & Initialized");
        System.out.println("=================================================");
    }

    public static void main(String[] args) {
        try {
            KinshipServer kinshipServer = new KinshipServer();
            kinshipServer.start();
        } catch (Exception e) {
            System.err.println("Failed to start Kinship Java Backend Server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Helper for CORS & JSON Responses
    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private class FeedHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<Post> posts = postRepo.findAll();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < posts.size(); i++) {
                Post p = posts.get(i);
                sb.append(String.format("{\"id\":%d,\"user\":{\"name\":\"%s\",\"avatar\":\"%s\",\"talents\":[%s]},\"type\":\"%s\",\"content\":\"%s\",\"media\":\"%s\",\"caption\":\"%s\",\"likes\":%d,\"comments\":%d,\"shares\":%d,\"time\":\"%s\",\"badge\":\"%s\"}",
                        p.getId(), escape(p.getCreator().getName()), escape(p.getCreator().getImage()),
                        formatTalentsJson(p.getCreator().getTalents()), p.getPostType(),
                        escape(p.getMediaUrl()), escape(p.getMediaUrl()), escape(p.getContent()),
                        p.getLikes(), p.getComments(), p.getShares(), escape(p.getTimestamp()), escape(p.renderBadgeLabel())));
                if (i < posts.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    private class CreatePostHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                List<CreatorUser> creators = userRepo.findAll();
                CreatorUser creator = creators.isEmpty() ? null : creators.get(0);
                long newId = System.currentTimeMillis();
                Post post = new ImagePost(newId, creator, "Created via Kinship Java JDBC Backend", "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800", 0, 0, 0, "Just now");
                postRepo.save(post);
                sendJsonResponse(exchange, 201, "{\"status\":\"success\",\"message\":\"Post created in Java JDBC database\"}");
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
            }
        }
    }

    private class CreatorsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<CreatorUser> creators = userRepo.findAll();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < creators.size(); i++) {
                CreatorUser c = creators.get(i);
                sb.append(String.format("{\"id\":%d,\"name\":\"%s\",\"username\":\"%s\",\"bio\":\"%s\",\"image\":\"%s\",\"location\":\"%s\",\"followers\":%d,\"following\":%d,\"verified\":%b}",
                        c.getId(), escape(c.getName()), escape(c.getUsername()), escape(c.getBio()), escape(c.getImage()), escape(c.getLocation()), c.getFollowers(), c.getFollowing(), c.isVerified()));
                if (i < creators.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    private class OpportunitiesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<Opportunity> opps = oppRepo.findAll();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < opps.size(); i++) {
                Opportunity o = opps.get(i);
                sb.append(String.format("{\"id\":%d,\"title\":\"%s\",\"type\":\"%s\",\"category\":\"%s\",\"location\":\"%s\",\"date\":\"%s\",\"description\":\"%s\",\"image\":\"%s\",\"applicants\":%d}",
                        o.getId(), escape(o.getTitle()), escape(o.getType()), escape(o.getCategory()), escape(o.getLocation()), escape(o.getDate()), escape(o.getDescription()), escape(o.getImage()), o.getApplicants()));
                if (i < opps.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    private class ApplyOpportunityHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            oppRepo.applyToOpportunity(1L);
            sendJsonResponse(exchange, 200, "{\"status\":\"success\",\"message\":\"Application recorded in JDBC database\"}");
        }
    }

    private class SystemMetricsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = String.format("{\"server\":\"Kinship Java HTTP Server v1.0\",\"jdbc\":\"Active H2/SQLite Database\",\"userCount\":%d,\"postCount\":%d,\"opportunityCount\":%d}",
                    userRepo.count(), postRepo.count(), oppRepo.count());
            sendJsonResponse(exchange, 200, json);
        }
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }

    private static String formatTalentsJson(List<String> talents) {
        if (talents == null || talents.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < talents.size(); i++) {
            sb.append("\"").append(escape(talents.get(i))).append("\"");
            if (i < talents.size() - 1) sb.append(",");
        }
        return sb.toString();
    }
}
