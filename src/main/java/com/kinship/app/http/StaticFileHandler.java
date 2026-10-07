package com.kinship.app.http;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

/**
 * Serves the built React website (the {@code dist} folder from {@code npm run build}) so the whole app
 * runs from this one Java server. Unknown paths fall back to index.html because the React router
 * handles them in the browser (e.g. /profile/3).
 */
public class StaticFileHandler implements HttpHandler {
    private static final Map<String, String> TYPES = Map.ofEntries(
            Map.entry("html", "text/html; charset=UTF-8"),
            Map.entry("js", "text/javascript; charset=UTF-8"),
            Map.entry("css", "text/css; charset=UTF-8"),
            Map.entry("json", "application/json"),
            Map.entry("svg", "image/svg+xml"),
            Map.entry("png", "image/png"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("ico", "image/x-icon"),
            Map.entry("woff", "font/woff"),
            Map.entry("woff2", "font/woff2"));

    private final Path root;

    public StaticFileHandler(Path root) {
        this.root = root.toAbsolutePath().normalize();
    }

    public boolean isAvailable() {
        return Files.isRegularFile(root.resolve("index.html"));
    }

    public Path getRoot() {
        return root;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try (exchange) {
            String method = exchange.getRequestMethod();
            if (!"GET".equalsIgnoreCase(method) && !"HEAD".equalsIgnoreCase(method)) {
                send(exchange, 405, "text/plain; charset=UTF-8", "Method not allowed".getBytes(StandardCharsets.UTF_8));
                return;
            }
            if (!isAvailable()) {
                String msg = "Website not built yet. Run 'npm run build' in the Kinship folder, then restart the server.";
                send(exchange, 503, "text/plain; charset=UTF-8", msg.getBytes(StandardCharsets.UTF_8));
                return;
            }
            String requested = exchange.getRequestURI().getPath();
            Path file = root.resolve(requested.replaceFirst("^/+", "")).normalize();
            // never serve anything outside the dist folder (blocks ../ tricks)
            if (!file.startsWith(root) || !Files.isRegularFile(file)) {
                file = root.resolve("index.html");
            }
            String name = file.getFileName().toString();
            String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : "";
            String type = TYPES.getOrDefault(ext, "application/octet-stream");
            if (name.equals("index.html")) {
                exchange.getResponseHeaders().set("Cache-Control", "no-cache");
            } else if (requested.startsWith("/assets/")) {
                // Vite puts a content hash in asset names, so they can be cached for a long time
                exchange.getResponseHeaders().set("Cache-Control", "public, max-age=31536000, immutable");
            }
            byte[] body = "HEAD".equalsIgnoreCase(method) ? new byte[0] : Files.readAllBytes(file);
            send(exchange, 200, type, body);
        }
    }

    private static void send(HttpExchange exchange, int status, String type, byte[] body) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", type);
        exchange.sendResponseHeaders(status, body.length == 0 ? -1 : body.length);
        if (body.length > 0) {
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        }
    }
}
