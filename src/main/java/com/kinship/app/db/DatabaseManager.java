package com.kinship.app.db;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.GlobalExceptionHandler;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * JDBC Database Connection & Schema Management Singleton
 */
public class DatabaseManager {
    private static DatabaseManager instance;
    private static final String JDBC_URL = "jdbc:h2:mem:kinshipdb;DB_CLOSE_DELAY=-1";
    private static final String JDBC_USER = "sa";
    private static final String JDBC_PASSWORD = "";

    private Connection connection;

    private DatabaseManager() {
        try {
            // Load H2 JDBC Driver
            Class.forName("org.h2.Driver");
            this.connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
            System.out.println("[JDBC DatabaseManager] Connected successfully to JDBC Database: " + JDBC_URL);
            initializeSchemaAndData();
        } catch (ClassNotFoundException e) {
            // Fallback to SQLite if H2 driver is not available
            try {
                Class.forName("org.sqlite.JDBC");
                this.connection = DriverManager.getConnection("jdbc:sqlite:kinship.db");
                System.out.println("[JDBC DatabaseManager] Fallback connected to SQLite JDBC Database.");
                initializeSchemaAndData();
            } catch (Exception ex) {
                GlobalExceptionHandler.getInstance().handleException(new DatabaseException("Failed to load JDBC drivers", null));
            }
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("JDBC Connection initialization failed", e));
        }
    }

    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    public synchronized Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
        }
        return connection;
    }

    private void initializeSchemaAndData() {
        try (Statement stmt = getConnection().createStatement()) {
            // Create Users Table
            stmt.execute("CREATE TABLE IF NOT EXISTS users (" +
                    "id BIGINT PRIMARY KEY, " +
                    "name VARCHAR(255) NOT NULL, " +
                    "username VARCHAR(255) NOT NULL, " +
                    "bio TEXT, " +
                    "image TEXT, " +
                    "location VARCHAR(255), " +
                    "talents TEXT, " +
                    "followers INT DEFAULT 0, " +
                    "following INT DEFAULT 0, " +
                    "verified BOOLEAN DEFAULT FALSE, " +
                    "achievements TEXT" +
                    ");");

            // Create Posts Table
            stmt.execute("CREATE TABLE IF NOT EXISTS posts (" +
                    "id BIGINT PRIMARY KEY, " +
                    "creator_id BIGINT NOT NULL, " +
                    "post_type VARCHAR(50) NOT NULL, " +
                    "content TEXT NOT NULL, " +
                    "media_url TEXT, " +
                    "likes INT DEFAULT 0, " +
                    "comments INT DEFAULT 0, " +
                    "shares INT DEFAULT 0, " +
                    "created_at VARCHAR(100), " +
                    "FOREIGN KEY (creator_id) REFERENCES users(id)" +
                    ");");

            // Create Opportunities Table
            stmt.execute("CREATE TABLE IF NOT EXISTS opportunities (" +
                    "id BIGINT PRIMARY KEY, " +
                    "title VARCHAR(255) NOT NULL, " +
                    "type VARCHAR(50) NOT NULL, " +
                    "category VARCHAR(100) NOT NULL, " +
                    "location VARCHAR(255), " +
                    "date VARCHAR(100), " +
                    "description TEXT, " +
                    "image TEXT, " +
                    "applicants INT DEFAULT 0" +
                    ");");

            // Create Notifications Table
            stmt.execute("CREATE TABLE IF NOT EXISTS notifications (" +
                    "id BIGINT PRIMARY KEY, " +
                    "user_id BIGINT, " +
                    "type VARCHAR(50) NOT NULL, " +
                    "content TEXT NOT NULL, " +
                    "timestamp VARCHAR(100), " +
                    "is_read BOOLEAN DEFAULT FALSE" +
                    ");");

            // Seed Initial Data if empty
            stmt.execute("MERGE INTO users (id, name, username, bio, image, location, talents, followers, following, verified, achievements) KEY(id) VALUES " +
                    "(1, 'Sofia Martinez', '@sofiabeats', 'Producer & Songwriter crafting emotional beats that tell stories.', 'https://images.unsplash.com/photo-1716569355086-6caed45f6855?w=800', 'Los Angeles, CA', 'Music, Production', 12500, 842, TRUE, 'Top 100 Producer 2025, Platinum Record'), " +
                    "(2, 'Maya Chen', '@mayamoves', 'Contemporary dancer expressing emotions through movement.', 'https://images.unsplash.com/photo-1650465811226-de19b0502e94?w=800', 'New York, NY', 'Dance, Choreography', 28300, 621, TRUE, 'Award-Winning Choreographer'), " +
                    "(3, 'Alex Rivera', '@alexcaptures', 'Visual storyteller capturing the beauty in everyday moments.', 'https://images.unsplash.com/photo-1621024994278-e409544f4085?w=800', 'Portland, OR', 'Photography, Video', 45200, 1240, TRUE, 'Published Photographer');");

            stmt.execute("MERGE INTO posts (id, creator_id, post_type, content, media_url, likes, comments, shares, created_at) KEY(id) VALUES " +
                    "(1, 1, 'image', 'New abstract piece exploring emotion through color. What feelings does this evoke for you?', 'https://images.unsplash.com/photo-1628586431263-44040b966252?w=1080', 1847, 234, 45, '2h ago'), " +
                    "(2, 2, 'video', 'Choreography inspired by urban landscapes. Collaboration with @musicbyalex 🎵', 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=1080', 3254, 467, 89, '5h ago'), " +
                    "(3, 3, 'image', 'Live session from last night. The energy was unreal ✨', 'https://images.unsplash.com/photo-1576967402682-19976eb930f2?w=1080', 5621, 892, 120, '1d ago');");

            stmt.execute("MERGE INTO opportunities (id, title, type, category, location, date, description, image, applicants) KEY(id) VALUES " +
                    "(1, 'Music Festival 2026', 'Event', 'Music', 'Los Angeles, CA', 'June 15-17, 2026', 'Perform at one of the biggest music festivals on the West Coast.', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', 234), " +
                    "(2, 'Fashion Brand Collaboration', 'Gig', 'Fashion', 'New York, NY', 'Ongoing', 'Partner with emerging sustainable fashion brand for content creation.', 'https://images.unsplash.com/photo-1558769132-cb1aea3c8caa?w=800', 89), " +
                    "(3, 'Dance Workshop Series', 'Workshop', 'Dance', 'Online', 'Starting June 1', 'Teach your dance style to aspiring dancers worldwide.', 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800', 45);");

            System.out.println("[JDBC DatabaseManager] SQL Schema and initial seed data verified successfully.");
        } catch (SQLException e) {
            GlobalExceptionHandler.getInstance().handleException(new DatabaseException("JDBC Schema Initialization failed", e));
        }
    }
}
