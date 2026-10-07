package com.kinship.app.config;

import java.io.IOException;
import java.io.InputStream;
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
        return new DatabaseConfig(
                pick("KINSHIP_DB_URL", file.getProperty("db.url"), DEFAULT_URL),
                pick("KINSHIP_DB_USER", file.getProperty("db.user"), "root"),
                pick("KINSHIP_DB_PASSWORD", file.getProperty("db.password"), ""));
    }

    private static String pick(String envName, String fileValue, String fallback) {
        String env = System.getenv(envName);
        if (env != null && !env.isEmpty()) return env;
        if (fileValue != null) return fileValue.trim();
        return fallback;
    }

    public String getUrl() { return url; }
    public String getUser() { return user; }
    public String getPassword() { return password; }
}
