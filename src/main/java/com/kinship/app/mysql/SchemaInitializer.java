package com.kinship.app.mysql;

import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.security.PasswordHasher;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;

/**
 * Creates the MySQL tables (DDL) and inserts demo data the first time the server starts.
 * If an older table layout is found (e.g. from an earlier version of the project) it is replaced.
 */
class SchemaInitializer {
    /** Demo accounts all use this password. */
    static final String DEMO_PASSWORD = "password123";

    private static final String[] TABLES_IN_DROP_ORDER = {
            "collaboration_requests", "collaboration_members", "collaborations", "messages", "notifications",
            "sessions", "applications", "comments", "post_likes", "posts", "opportunities", "follows", "connections", "users",
            "kinship_schema"
    };

    private final MysqlDatabaseManager db;

    SchemaInitializer(MysqlDatabaseManager db) {
        this.db = db;
    }

    void initialize() throws DatabaseException {
        int version = db.execute("Read schema version", this::readSchemaVersion);
        if (version == MysqlDatabaseManager.SCHEMA_VERSION) {
            System.out.println("[MySQL] Schema v" + version + " already present.");
            return;
        }
        System.out.println("[MySQL] Creating schema v" + MysqlDatabaseManager.SCHEMA_VERSION
                + (version > 0 ? " (replacing v" + version + ")" : "") + " ...");
        db.execute("Drop old tables", this::dropTables);
        db.execute("Create tables", this::createTables);
        db.inTransaction("Seed demo data", conn -> {
            seed(conn);
            return null;
        });
        System.out.println("[MySQL] Schema created and demo data inserted. Demo login: sofia@kinship.app / " + DEMO_PASSWORD);
    }

    private int readSchemaVersion(Connection conn) throws SQLException {
        try (ResultSet tables = conn.getMetaData().getTables(conn.getCatalog(), null, "kinship_schema", null)) {
            if (!tables.next()) {
                return 0;
            }
        }
        try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery("SELECT MAX(version) FROM kinship_schema")) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    private Void dropTables(Connection conn) throws SQLException {
        try (Statement st = conn.createStatement()) {
            st.execute("SET FOREIGN_KEY_CHECKS = 0");
            for (String table : TABLES_IN_DROP_ORDER) {
                st.execute("DROP TABLE IF EXISTS " + table);
            }
            st.execute("SET FOREIGN_KEY_CHECKS = 1");
        }
        return null;
    }

    private Void createTables(Connection conn) throws SQLException {
        String engine = " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        try (Statement st = conn.createStatement()) {
            st.execute("CREATE TABLE users ("
                    + "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                    + "name VARCHAR(100) NOT NULL,"
                    + "username VARCHAR(40) NOT NULL UNIQUE,"
                    + "email VARCHAR(255) NOT NULL UNIQUE,"
                    + "password_hash VARCHAR(255) NOT NULL,"
                    + "bio TEXT,"
                    + "image TEXT,"
                    + "location VARCHAR(255),"
                    + "talents TEXT,"
                    + "followers INT NOT NULL DEFAULT 0,"
                    + "following INT NOT NULL DEFAULT 0,"
                    + "verified BOOLEAN NOT NULL DEFAULT FALSE,"
                    + "achievements TEXT,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)" + engine);

            st.execute("CREATE TABLE follows ("
                    + "follower_id BIGINT NOT NULL,"
                    + "followed_id BIGINT NOT NULL,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "PRIMARY KEY (follower_id, followed_id),"
                    + "FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,"
                    + "FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE posts ("
                    + "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                    + "creator_id BIGINT NOT NULL,"
                    + "post_type VARCHAR(20) NOT NULL,"
                    + "content TEXT NOT NULL,"
                    + "media_url TEXT,"
                    + "likes INT NOT NULL DEFAULT 0,"
                    + "comments INT NOT NULL DEFAULT 0,"
                    + "shares INT NOT NULL DEFAULT 0,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE post_likes ("
                    + "user_id BIGINT NOT NULL,"
                    + "post_id BIGINT NOT NULL,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "PRIMARY KEY (user_id, post_id),"
                    + "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,"
                    + "FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE comments ("
                    + "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                    + "post_id BIGINT NOT NULL,"
                    + "user_id BIGINT NOT NULL,"
                    + "content TEXT NOT NULL,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,"
                    + "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE opportunities ("
                    + "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                    + "title VARCHAR(255) NOT NULL,"
                    + "type VARCHAR(30) NOT NULL,"
                    + "category VARCHAR(100) NOT NULL,"
                    + "organizer VARCHAR(255),"
                    + "location VARCHAR(255),"
                    + "event_date VARCHAR(100),"
                    + "compensation VARCHAR(100),"
                    + "deadline VARCHAR(100),"
                    + "description TEXT,"
                    + "image TEXT,"
                    + "talents TEXT,"
                    + "applicants INT NOT NULL DEFAULT 0,"
                    + "featured BOOLEAN NOT NULL DEFAULT FALSE,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)" + engine);

            st.execute("CREATE TABLE applications ("
                    + "user_id BIGINT NOT NULL,"
                    + "opportunity_id BIGINT NOT NULL,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "PRIMARY KEY (user_id, opportunity_id),"
                    + "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,"
                    + "FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE notifications ("
                    + "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                    + "user_id BIGINT NOT NULL,"
                    + "actor_id BIGINT NULL,"
                    + "type VARCHAR(30) NOT NULL,"
                    + "action VARCHAR(255) NOT NULL,"
                    + "content TEXT,"
                    + "is_read BOOLEAN NOT NULL DEFAULT FALSE,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,"
                    + "FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL)" + engine);

            st.execute("CREATE TABLE messages ("
                    + "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                    + "sender_id BIGINT NOT NULL,"
                    + "receiver_id BIGINT NOT NULL,"
                    + "content TEXT NOT NULL,"
                    + "is_read BOOLEAN NOT NULL DEFAULT FALSE,"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "INDEX idx_pair (sender_id, receiver_id),"
                    + "FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,"
                    + "FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE collaborations ("
                    + "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                    + "title VARCHAR(255) NOT NULL,"
                    + "description TEXT,"
                    + "owner_id BIGINT NOT NULL,"
                    + "talents TEXT,"
                    + "progress INT NOT NULL DEFAULT 0,"
                    + "deadline VARCHAR(100),"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE collaboration_members ("
                    + "collaboration_id BIGINT NOT NULL,"
                    + "user_id BIGINT NOT NULL,"
                    + "PRIMARY KEY (collaboration_id, user_id),"
                    + "FOREIGN KEY (collaboration_id) REFERENCES collaborations(id) ON DELETE CASCADE,"
                    + "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE collaboration_requests ("
                    + "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                    + "from_user_id BIGINT NOT NULL,"
                    + "to_user_id BIGINT NOT NULL,"
                    + "project VARCHAR(255) NOT NULL,"
                    + "message TEXT,"
                    + "status VARCHAR(20) NOT NULL DEFAULT 'PENDING',"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                    + "FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,"
                    + "FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE sessions ("
                    + "token VARCHAR(64) PRIMARY KEY,"
                    + "user_id BIGINT NOT NULL,"
                    + "expires_at TIMESTAMP NOT NULL,"
                    + "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)" + engine);

            st.execute("CREATE TABLE kinship_schema (version INT NOT NULL)" + engine);
            st.execute("INSERT INTO kinship_schema (version) VALUES (" + MysqlDatabaseManager.SCHEMA_VERSION + ")");
        }
        return null;
    }

    // ------------------------------------------------------------------ seed data

    private void seed(Connection conn) throws SQLException {
        LocalDateTime now = LocalDateTime.now();

        String userSql = "INSERT INTO users (id, name, username, email, password_hash, bio, image, location, talents, "
                + "followers, following, verified, achievements, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Object[][] users = {
                {1, "Sofia Martinez", "@sofiabeats", "sofia@kinship.app",
                        "Producer & songwriter crafting emotional beats that tell stories.",
                        "https://images.unsplash.com/photo-1716569355086-6caed45f6855?w=800", "Los Angeles, CA",
                        "Music, Production", 12500, 842, true, "Top 100 Producer 2025, Platinum Record"},
                {2, "Maya Chen", "@mayamoves", "maya@kinship.app",
                        "Contemporary dancer expressing emotions through movement.",
                        "https://images.unsplash.com/photo-1650465811226-de19b0502e94?w=800", "New York, NY",
                        "Dance, Choreography", 28300, 621, true, "Award-Winning Choreographer"},
                {3, "Alex Rivera", "@alexcaptures", "alex@kinship.app",
                        "Visual storyteller capturing the beauty in everyday moments.",
                        "https://images.unsplash.com/photo-1621024994278-e409544f4085?w=800", "Portland, OR",
                        "Photography, Video", 45200, 1240, true, "Published Photographer, Nat Geo Feature"},
                {4, "Jordan Lee", "@jordanframes", "jordan@kinship.app",
                        "Indie filmmaker. Short films, music videos and everything in between.",
                        "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800", "Austin, TX",
                        "Film, Video", 8700, 410, false, "Sundance Shorts Selection"},
                {5, "Sarah Kim", "@sarahpaints", "sarah@kinship.app",
                        "Painter and illustrator obsessed with colour.",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800", "Seattle, WA",
                        "Art, Painting", 15400, 530, true, "Solo Exhibition 2025"},
                {6, "David Torres", "@davidsings", "david@kinship.app",
                        "Vocalist and session singer. Always up for a collab.",
                        "https://images.unsplash.com/photo-1618673747378-7e0d3561371a?w=800", "Miami, FL",
                        "Music, Singing", 6200, 380, false, "Featured on 3 Billboard Tracks"},
        };
        try (PreparedStatement ps = conn.prepareStatement(userSql)) {
            String demoHash = PasswordHasher.hash(DEMO_PASSWORD);
            for (int i = 0; i < users.length; i++) {
                Object[] u = users[i];
                ps.setLong(1, ((Integer) u[0]).longValue());
                ps.setString(2, (String) u[1]);
                ps.setString(3, (String) u[2]);
                ps.setString(4, (String) u[3]);
                ps.setString(5, demoHash);
                ps.setString(6, (String) u[4]);
                ps.setString(7, (String) u[5]);
                ps.setString(8, (String) u[6]);
                ps.setString(9, (String) u[7]);
                ps.setInt(10, (Integer) u[8]);
                ps.setInt(11, (Integer) u[9]);
                ps.setBoolean(12, (Boolean) u[10]);
                ps.setString(13, (String) u[11]);
                ps.setTimestamp(14, Timestamp.valueOf(now.minusDays(30 - i)));
                ps.addBatch();
            }
            ps.executeBatch();
        }

        String postSql = "INSERT INTO posts (creator_id, post_type, content, media_url, likes, comments, shares, created_at) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        Object[][] posts = {
                {3, "image", "Live session from last night. The energy was unreal",
                        "https://images.unsplash.com/photo-1576967402682-19976eb930f2?w=1080", 5621, 0, 120, 26},
                {2, "video", "Choreography inspired by urban landscapes. Who wants to make the soundtrack?",
                        "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1080", 3254, 0, 89, 5},
                {1, "image", "New abstract piece exploring emotion through colour. What feelings does this evoke for you?",
                        "https://images.unsplash.com/photo-1628586431263-44040b966252?w=1080", 1847, 0, 45, 2},
                {6, "collab", "Looking for a producer and a videographer for my next single. DM me!",
                        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080", 932, 0, 21, 8},
                {5, "image", "Finished this canvas after three weeks. Swipe for the process.",
                        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1080", 2210, 0, 64, 30},
                {4, "video", "Behind the scenes of our short film shoot in the desert.",
                        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1080", 1408, 0, 33, 50},
        };
        try (PreparedStatement ps = conn.prepareStatement(postSql)) {
            for (Object[] p : posts) {
                ps.setLong(1, ((Integer) p[0]).longValue());
                ps.setString(2, (String) p[1]);
                ps.setString(3, (String) p[2]);
                ps.setString(4, (String) p[3]);
                ps.setInt(5, (Integer) p[4]);
                ps.setInt(6, (Integer) p[5]);
                ps.setInt(7, (Integer) p[6]);
                ps.setTimestamp(8, Timestamp.valueOf(now.minusHours((Integer) p[7])));
                ps.addBatch();
            }
            ps.executeBatch();
        }

        // comments (and keep posts.comments in sync)
        Object[][] comments = {
                {1, 2, "This is incredible!"}, {1, 1, "Need this on a record ASAP"},
                {2, 3, "The lighting in this is perfect"}, {2, 1, "I have a beat for this!"},
                {3, 5, "The colours are so moody, love it"}, {4, 1, "I'm in for production"},
        };
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)")) {
            for (Object[] c : comments) {
                ps.setLong(1, ((Integer) c[0]).longValue());
                ps.setLong(2, ((Integer) c[1]).longValue());
                ps.setString(3, (String) c[2]);
                ps.setTimestamp(4, Timestamp.valueOf(now.minusMinutes(90)));
                ps.addBatch();
            }
            ps.executeBatch();
        }
        try (Statement st = conn.createStatement()) {
            st.executeUpdate("UPDATE posts p SET comments = (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)");
        }

        String oppSql = "INSERT INTO opportunities (title, type, category, organizer, location, event_date, compensation, "
                + "deadline, description, image, talents, applicants, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Object[][] opps = {
                {"Music Festival 2026", "Event", "Music", "SoundWave Productions", "Los Angeles, CA", "June 15-17, 2026",
                        "$2,000 + travel", "Apply by May 1", "Perform at one of the biggest music festivals on the West Coast.",
                        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800", "Music, Singing", 234, true},
                {"Fashion Brand Collaboration", "Gig", "Fashion", "Verde Apparel", "New York, NY", "Ongoing",
                        "$500 per shoot", "Rolling applications",
                        "Partner with an emerging sustainable fashion brand for content creation.",
                        "https://images.unsplash.com/photo-1558769132-cb1aea3c8caa?w=800", "Photography, Video", 89, false},
                {"Dance Workshop Series", "Workshop", "Dance", "MoveLab Studios", "Online", "Starting June 1",
                        "$75 per session", "Apply by May 20", "Teach your dance style to aspiring dancers worldwide.",
                        "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800", "Dance, Choreography", 45, false},
                {"Short Film Challenge", "Competition", "Film", "Indie Film Collective", "Remote", "July 2026",
                        "$5,000 grand prize", "Submit by June 30", "Make a 5-minute short film on the theme 'Kinship'.",
                        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800", "Film, Video", 152, true},
                {"Album Artwork Collab", "Collab", "Art", "Sofia Martinez", "Remote", "Flexible",
                        "Revenue share", "Open", "Looking for a painter to design the cover of my next EP.",
                        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800", "Art, Painting", 12, false},
                {"Wedding Season Photographer", "Gig", "Photography", "Golden Hour Events", "Portland, OR",
                        "May - Sept 2026", "$800 per event", "Apply by April 30",
                        "Second shooter needed for a busy wedding season.",
                        "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", "Photography", 37, false},
        };
        try (PreparedStatement ps = conn.prepareStatement(oppSql)) {
            for (Object[] o : opps) {
                for (int i = 0; i < 11; i++) {
                    ps.setString(i + 1, (String) o[i]);
                }
                ps.setInt(12, (Integer) o[11]);
                ps.setBoolean(13, (Boolean) o[12]);
                ps.addBatch();
            }
            ps.executeBatch();
        }

        // follow graph (counters above already include these "historic" followers)
        long[][] follows = {{1, 2}, {1, 3}, {2, 1}, {3, 1}, {4, 1}, {5, 2}, {6, 1}, {2, 3}};
        try (PreparedStatement ps = conn.prepareStatement("INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)")) {
            for (long[] f : follows) {
                ps.setLong(1, f[0]);
                ps.setLong(2, f[1]);
                ps.addBatch();
            }
            ps.executeBatch();
        }

        Object[][] notifications = {
                {1, 2, "LIKE", "liked your post", "New abstract piece exploring emotion", 5, false},
                {1, 4, "COLLABORATION", "invited you to collaborate on", "Desert Short Film Soundtrack", 60, false},
                {1, 5, "FOLLOW", "started following you", null, 120, false},
                {1, 3, "COMMENT", "commented on your post", "The lighting in this is perfect", 180, true},
                {1, null, "ACHIEVEMENT", "You've reached 10,000 followers!", "Keep creating amazing content", 1440, true},
        };
        try (PreparedStatement ps = conn.prepareStatement("INSERT INTO notifications (user_id, actor_id, type, action, "
                + "content, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")) {
            for (Object[] n : notifications) {
                ps.setLong(1, ((Integer) n[0]).longValue());
                if (n[1] == null) ps.setNull(2, java.sql.Types.BIGINT);
                else ps.setLong(2, ((Integer) n[1]).longValue());
                ps.setString(3, (String) n[2]);
                ps.setString(4, (String) n[3]);
                ps.setString(5, (String) n[4]);
                ps.setBoolean(6, (Boolean) n[6]);
                ps.setTimestamp(7, Timestamp.valueOf(now.minusMinutes((Integer) n[5])));
                ps.addBatch();
            }
            ps.executeBatch();
        }

        Object[][] messages = {
                {2, 1, "Hey Sofia! Loved your latest beat.", 200, true},
                {1, 2, "Thank you! Want to choreograph something to it?", 150, true},
                {2, 1, "That sounds perfect! When can we start?", 5, false},
                {3, 1, "I can shoot the music video if you need visuals.", 60, true},
                {1, 3, "Let's schedule a call this week.", 55, true},
                {6, 1, "Let's schedule a studio session", 1440, false},
        };
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)")) {
            for (Object[] m : messages) {
                ps.setLong(1, ((Integer) m[0]).longValue());
                ps.setLong(2, ((Integer) m[1]).longValue());
                ps.setString(3, (String) m[2]);
                ps.setBoolean(4, (Boolean) m[4]);
                ps.setTimestamp(5, Timestamp.valueOf(now.minusMinutes((Integer) m[3])));
                ps.addBatch();
            }
            ps.executeBatch();
        }

        try (Statement st = conn.createStatement()) {
            st.executeUpdate("INSERT INTO collaborations (id, title, description, owner_id, talents, progress, deadline) VALUES "
                    + "(1, 'Summer Vibes EP', 'Five track EP with live dance visuals', 1, 'Music, Dance', 65, '2 weeks'),"
                    + "(2, 'Urban Photography Series', 'City at night, shot over 30 days', 3, 'Photography, Film', 40, '1 month')");
            st.executeUpdate("INSERT INTO collaboration_members (collaboration_id, user_id) VALUES "
                    + "(1, 1), (1, 2), (1, 6), (2, 3), (2, 4), (2, 1)");
            st.executeUpdate("INSERT INTO collaboration_requests (from_user_id, to_user_id, project, message, status) VALUES "
                    + "(5, 1, 'Album Cover Design', 'Hey! I love your music style. Would you be interested in collaborating on album artwork?', 'PENDING'),"
                    + "(4, 1, 'Desert Short Film Soundtrack', 'I would love an original score for my next short film. Interested?', 'PENDING')");
        }
    }
}
