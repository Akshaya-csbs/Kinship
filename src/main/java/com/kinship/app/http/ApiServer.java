package com.kinship.app.http;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.GlobalExceptionHandler;
import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.services.AuthService;
import com.kinship.app.services.ServerMetrics;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

/**
 * The single {@link HttpHandler} mounted on /api. Runs on the HTTP thread pool:
 * CORS -> routing -> authentication -> controller -> JSON, and turns every exception into a JSON error.
 */
public class ApiServer implements HttpHandler {
    private final Router router;
    private final AuthService auth;
    private final ServerMetrics metrics = ServerMetrics.getInstance();
    private final GlobalExceptionHandler errors = GlobalExceptionHandler.getInstance();

    public ApiServer(Router router, AuthService auth) {
        this.router = router;
        this.auth = auth;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try (exchange) {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String path = exchange.getRequestURI().getPath();
            Optional<Router.Match> match = router.match(method, path);
            if (match.isEmpty()) {
                metrics.recordRequest("UNMATCHED");
                boolean otherMethod = router.pathExists(path);
                send(exchange, otherMethod ? 405 : 404, Map.of(
                        "error", otherMethod ? "Method " + method + " not allowed on " + path : "No endpoint " + path,
                        "code", otherMethod ? "ERR_METHOD_NOT_ALLOWED" : "ERR_NOT_FOUND"));
                return;
            }
            metrics.recordRequest(match.get().template());
            dispatch(exchange, match.get());
        }
    }

    private void dispatch(HttpExchange exchange, Router.Match match) throws IOException {
        try {
            String token = bearerToken(exchange);
            Long userId = resolveUser(token);
            ApiRequest request = new ApiRequest(exchange, match.params(), userId, token);
            Object result = match.handler().handle(request);
            if (result instanceof ApiResponse response) {
                send(exchange, response.status(), response.body());
            } else {
                send(exchange, 200, result);
            }
        } catch (KinshipException e) {
            metrics.recordFailure();
            if (e.getHttpStatus() >= 500) {
                errors.handleException(e);
            }
            send(exchange, errors.statusFor(e), errors.toErrorBody(e));
        } catch (RuntimeException e) {
            metrics.recordFailure();
            errors.handleException(e);
            e.printStackTrace();
            send(exchange, 500, errors.toErrorBody(e));
        }
    }

    private Long resolveUser(String token) throws DatabaseException {
        return token == null ? null : auth.resolve(token).orElse(null);
    }

    private static String bearerToken(HttpExchange exchange) {
        String header = exchange.getRequestHeaders().getFirst("Authorization");
        if (header != null && header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            String token = header.substring(7).trim();
            return token.isEmpty() ? null : token;
        }
        return null;
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void send(HttpExchange exchange, int status, Object body) throws IOException {
        byte[] bytes = Json.GSON.toJson(body).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
