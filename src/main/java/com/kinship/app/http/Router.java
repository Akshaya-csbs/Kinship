package com.kinship.app.http;

import com.kinship.app.interfaces.ApiHandler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Maps "METHOD /api/path/{param}" templates to {@link ApiHandler}s.
 * Routes are registered once at start-up and then read concurrently, hence CopyOnWriteArrayList.
 */
public class Router {
    private record Route(String method, String template, Pattern pattern, List<String> paramNames, ApiHandler handler) {}

    public record Match(String template, ApiHandler handler, Map<String, String> params) {}

    private static final Pattern PARAM = Pattern.compile("\\{([a-zA-Z]+)}");

    private final List<Route> routes = new CopyOnWriteArrayList<>();

    public void get(String template, ApiHandler handler) { add("GET", template, handler); }
    public void post(String template, ApiHandler handler) { add("POST", template, handler); }
    public void put(String template, ApiHandler handler) { add("PUT", template, handler); }
    public void delete(String template, ApiHandler handler) { add("DELETE", template, handler); }

    private void add(String method, String template, ApiHandler handler) {
        List<String> names = new ArrayList<>();
        Matcher m = PARAM.matcher(template);
        StringBuilder regex = new StringBuilder("^");
        int last = 0;
        while (m.find()) {
            regex.append(Pattern.quote(template.substring(last, m.start()))).append("([^/]+)");
            names.add(m.group(1));
            last = m.end();
        }
        regex.append(Pattern.quote(template.substring(last))).append("/?$");
        routes.add(new Route(method, template, Pattern.compile(regex.toString()), names, handler));
    }

    public Optional<Match> match(String method, String path) {
        for (Route route : routes) {
            if (!route.method().equalsIgnoreCase(method)) continue;
            Matcher m = route.pattern().matcher(path);
            if (m.matches()) {
                Map<String, String> params = new HashMap<>();
                for (int i = 0; i < route.paramNames().size(); i++) {
                    params.put(route.paramNames().get(i), m.group(i + 1));
                }
                return Optional.of(new Match(method.toUpperCase() + " " + route.template(), route.handler(), params));
            }
        }
        return Optional.empty();
    }

    /** True when the path exists for some other method (answer 405 instead of 404). */
    public boolean pathExists(String path) {
        return routes.stream().anyMatch(r -> r.pattern().matcher(path).matches());
    }

    public int size() {
        return routes.size();
    }

    public List<String> describe() {
        List<String> list = new ArrayList<>();
        routes.forEach(r -> list.add(r.method() + " " + r.template()));
        return list;
    }
}
