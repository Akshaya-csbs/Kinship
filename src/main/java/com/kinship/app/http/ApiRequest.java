package com.kinship.app.http;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;
import com.kinship.app.exceptions.AuthenticationException;
import com.kinship.app.exceptions.ValidationException;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Read-only view of one HTTP request: path parameters, query string, JSON body and the logged-in user.
 */
public class ApiRequest {
    private static final int MAX_BODY_BYTES = 1_000_000;

    private final HttpExchange exchange;
    private final Map<String, String> pathParams;
    private final Map<String, String> queryParams;
    private final Long userId;
    private final String token;
    private JsonObject body;

    public ApiRequest(HttpExchange exchange, Map<String, String> pathParams, Long userId, String token) {
        this.exchange = exchange;
        this.pathParams = pathParams;
        this.queryParams = parseQuery(exchange.getRequestURI().getRawQuery());
        this.userId = userId;
        this.token = token;
    }

    private static Map<String, String> parseQuery(String raw) {
        Map<String, String> params = new HashMap<>();
        if (raw == null || raw.isEmpty()) return params;
        for (String pair : raw.split("&")) {
            int eq = pair.indexOf('=');
            String key = URLDecoder.decode(eq < 0 ? pair : pair.substring(0, eq), StandardCharsets.UTF_8);
            String value = eq < 0 ? "" : URLDecoder.decode(pair.substring(eq + 1), StandardCharsets.UTF_8);
            params.put(key, value);
        }
        return params;
    }

    public String getMethod() { return exchange.getRequestMethod(); }
    public String getToken() { return token; }

    // ------------------------------------------------------------------ user

    /** Id of the logged-in user, or 0 for anonymous requests. */
    public long viewerId() {
        return userId != null ? userId : 0;
    }

    public long requireUserId() throws AuthenticationException {
        if (userId == null) {
            throw new AuthenticationException("Please sign in to continue");
        }
        return userId;
    }

    // ------------------------------------------------------------------ path & query

    public long pathLong(String name) throws ValidationException {
        String value = pathParams.get(name);
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            throw new ValidationException("Path parameter '" + name + "' must be a number, got '" + value + "'");
        }
    }

    public String query(String name) {
        return queryParams.get(name);
    }

    // ------------------------------------------------------------------ body

    public JsonObject body() throws ValidationException {
        if (body == null) {
            try (InputStream in = exchange.getRequestBody()) {
                byte[] bytes = in.readNBytes(MAX_BODY_BYTES + 1);
                if (bytes.length > MAX_BODY_BYTES) {
                    throw new ValidationException("Request body is too large");
                }
                String text = new String(bytes, StandardCharsets.UTF_8).trim();
                if (text.isEmpty()) {
                    body = new JsonObject();
                } else {
                    JsonElement parsed = JsonParser.parseString(text);
                    if (!parsed.isJsonObject()) {
                        throw new ValidationException("Request body must be a JSON object");
                    }
                    body = parsed.getAsJsonObject();
                }
            } catch (IOException e) {
                throw new ValidationException("Could not read request body: " + e.getMessage());
            } catch (JsonParseException | IllegalStateException e) {
                throw new ValidationException("Request body is not valid JSON");
            }
        }
        return body;
    }

    /** Optional string field (trimmed); null when absent. */
    public String bodyString(String field) throws ValidationException {
        JsonElement el = body().get(field);
        if (el == null || el.isJsonNull()) return null;
        if (!el.isJsonPrimitive()) throw new ValidationException("'" + field + "' must be a string");
        return el.getAsString().trim();
    }

    public String requireString(String field, int maxLength) throws ValidationException {
        String value = bodyString(field);
        if (value == null || value.isEmpty()) {
            throw new ValidationException("'" + field + "' is required");
        }
        if (value.length() > maxLength) {
            throw new ValidationException("'" + field + "' must be at most " + maxLength + " characters");
        }
        return value;
    }

    public Long bodyLong(String field) throws ValidationException {
        JsonElement el = body().get(field);
        if (el == null || el.isJsonNull()) return null;
        try {
            return el.getAsLong();
        } catch (RuntimeException e) {
            throw new ValidationException("'" + field + "' must be a number");
        }
    }

    public List<String> bodyStringList(String field) throws ValidationException {
        JsonElement el = body().get(field);
        List<String> values = new ArrayList<>();
        if (el == null || el.isJsonNull()) return values;
        if (!el.isJsonArray()) throw new ValidationException("'" + field + "' must be an array");
        JsonArray array = el.getAsJsonArray();
        for (JsonElement item : array) {
            String s = item.getAsString().trim();
            if (!s.isEmpty() && values.stream().noneMatch(s::equalsIgnoreCase)) {
                values.add(s);
            }
        }
        return values;
    }
}
