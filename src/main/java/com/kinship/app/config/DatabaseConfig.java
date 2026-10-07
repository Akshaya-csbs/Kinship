package com.kinship.app.config;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

/**
 * MySQL connection settings. Resolution order (first match wins):
 * <ol>
 *   <li>environment variables KINSHIP_DB_URL, KINSHIP_DB_USER, KINSHIP_DB_PASSWORD</li>
 *   <li>a {@code db.properties} file in the working directory (keys db.url, db.user, db.password)</li>
 *   <li>defaults: localhost:3306/kinshipdb, user root, empty password</li>
 * </ol>
 * Keep real passwords in db.properties (git-ignored), never in source code.
 */
public final class DatabaseConfig {
    public static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/kinshipdb"
            + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
            + "&serverTimezone=UTC&characterEncoding=UTF-8";

    private final String url;
    private final String user;
    private final String password;

    private DatabaseConfig(String url, String user, String password) {
        this.url = url;
        this.user = user;
        this.password = password;
    }

    public static DatabaseConfig load() {
        Properties file = new Properties();
        Path path = Path.of("db.properties");
        if (Files.exists(path)) {
            try (InputStream in = Files.newInputStream(path)) {
                file.load(in);
                System.out.println("[DatabaseConfig] Loaded " + path.toAbsolutePath());
            } catch (IOException e) {
                System.err.println("[DatabaseConfig] Could not read db.properties: " + e.getMessage());
            }
        }
        if (System.getenv("KINSHIP_DB_URL") == null) {
            DatabaseConfig cloud = fromCloudVariables();
            if (cloud != null) {
                return cloud;
            }
        }
        return new DatabaseConfig(
                pick("KINSHIP_DB_URL", file.getProperty("db.url"), DEFAULT_URL),
                pick("KINSHIP_DB_USER", file.getProperty("db.user"), "root"),
                pick("KINSHIP_DB_PASSWORD", file.getProperty("db.password"), ""));
    }

    private static final String URL_OPTIONS =
            "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";

    /**
     * Hosting platforms describe their MySQL database either as one URL
     * (MYSQL_URL / DATABASE_URL = mysql://user:password@host:port/database) or as separate
     * MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE variables (Railway).
     */
    private static DatabaseConfig fromCloudVariables() {
        for (String name : new String[]{"MYSQL_URL", "DATABASE_URL"}) {
            String value = System.getenv(name);
            if (value != null && value.startsWith("mysql://")) {
                try {
                    java.net.URI uri = java.net.URI.create(value);
                    String[] login = uri.getRawUserInfo() == null ? new String[]{"root", ""}
                            : uri.getRawUserInfo().split(":", 2);
                    String user = java.net.URLDecoder.decode(login[0], java.nio.charset.StandardCharsets.UTF_8);
                    String password = login.length > 1
                            ? java.net.URLDecoder.decode(login[1], java.nio.charset.StandardCharsets.UTF_8) : "";
                    int port = uri.getPort() > 0 ? uri.getPort() : 3306;
                    String database = uri.getPath() == null || uri.getPath().length() <= 1 ? "kinshipdb" : uri.getPath().substring(1);
                    System.out.println("[DatabaseConfig] Using MySQL from " + name + " (" + uri.getHost() + ":" + port + ")");
                    return new DatabaseConfig("jdbc:mysql://" + uri.getHost() + ":" + port + "/" + database
                            + URL_OPTIONS + "&createDatabaseIfNotExist=true", user, password);
                } catch (IllegalArgumentException e) {
                    System.err.println("[DatabaseConfig] " + name + " is not a valid mysql:// URL: " + e.getMessage());
                }
            }
        }
        String host = System.getenv("MYSQLHOST");
        if (host != null && !host.isEmpty()) {
            String port = System.getenv().getOrDefault("MYSQLPORT", "3306");
            String database = System.getenv().getOrDefault("MYSQLDATABASE", "kinshipdb");
            System.out.println("[DatabaseConfig] Using MySQL from MYSQLHOST (" + host + ":" + port + ")");
            return new DatabaseConfig("jdbc:mysql://" + host + ":" + port + "/" + database + URL_OPTIONS,
                    System.getenv().getOrDefault("MYSQLUSER", "root"), System.getenv().getOrDefault("MYSQLPASSWORD", ""));
        }
        return null;
    }

    private static String pick(String envName, String fileValue, String fallback) {
        String env = System.getenv(envName);
        if (env != null && !env.isEmpty()) return env;
        if (fileValue != null) return fileValue.trim();
        return fallback;
    }

    /** Same URL, different login (used when the user types their credentials at start-up). */
    public DatabaseConfig withCredentials(String newUser, String newPassword) {
        return new DatabaseConfig(url, newUser, newPassword);
    }

    /** Writes these settings to db.properties so the user is not asked again next time. */
    public void saveToFile() {
        Properties props = new Properties();
        props.setProperty("db.url", url);
        props.setProperty("db.user", user);
        props.setProperty("db.password", password);
        try (OutputStream out = Files.newOutputStream(Path.of("db.properties"))) {
            props.store(out, "Kinship MySQL settings (saved automatically, not committed to git)");
            System.out.println("[DatabaseConfig] Saved credentials to " + Path.of("db.properties").toAbsolutePath());
        } catch (IOException e) {
            System.err.println("[DatabaseConfig] Could not save db.properties: " + e.getMessage());
        }
    }

    public String getUrl() { return url; }
    public String getUser() { return user; }
    public String getPassword() { return password; }
}
