package com.kinship.app.services;

import com.kinship.app.exceptions.AuthenticationException;
import com.kinship.app.exceptions.DatabaseException;
import com.kinship.app.exceptions.DuplicateEntityException;
import com.kinship.app.exceptions.EntityNotFoundException;
import com.kinship.app.exceptions.KinshipException;
import com.kinship.app.exceptions.ValidationException;
import com.kinship.app.models.CreatorUser;
import com.kinship.app.models.Notification;
import com.kinship.app.mysql.MysqlSessionRepository;
import com.kinship.app.mysql.MysqlUserRepository;
import com.kinship.app.security.PasswordHasher;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registration, login and session tokens. Valid tokens are cached in a {@link ConcurrentHashMap}
 * so most requests do not need a database round-trip to authenticate.
 */
public class AuthService {
    public record AuthResult(String token, CreatorUser user) {}

    private record CachedSession(long userId, LocalDateTime expiresAt) {}

    private static final int SESSION_DAYS = 7;
    private static final String DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final MysqlUserRepository users;
    private final MysqlSessionRepository sessions;
    private final NotificationService notifications;
    private final ConcurrentHashMap<String, CachedSession> cache = new ConcurrentHashMap<>();

    public AuthService(MysqlUserRepository users, MysqlSessionRepository sessions, NotificationService notifications) {
        this.users = users;
        this.sessions = sessions;
        this.notifications = notifications;
    }

    public AuthResult register(String name, String email, String password) throws KinshipException {
        if (email == null || email.isBlank()) throw new ValidationException("Email is required");
        if (password == null || password.length() < 6) throw new ValidationException("Password must be at least 6 characters");
        email = email.trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new DuplicateEntityException("An account with this email already exists");
        }
        String username = uniqueUsername(name, email);
        // constructor validates name, username and email format
        CreatorUser user = new CreatorUser(0, name, username, email, "New to Kinship. Excited to create!",
                DEFAULT_AVATAR, "Earth", List.of(), 0, 0, false, List.of(), LocalDateTime.now());
        users.register(user, PasswordHasher.hash(password));
        notifications.notifyAsync(user.getId(), null, Notification.Type.SYSTEM,
                "Welcome to Kinship, " + user.getName() + "!", "Pick your talents and start connecting with creators");
        return new AuthResult(createSession(user.getId()), user);
    }

    public AuthResult login(String email, String password) throws KinshipException {
        if (email == null || password == null) throw new ValidationException("Email and password are required");
        Optional<MysqlUserRepository.Credentials> credentials = users.findCredentialsByEmail(email.trim());
        if (credentials.isEmpty() || !PasswordHasher.verify(password, credentials.get().passwordHash())) {
            throw new AuthenticationException("Invalid email or password");
        }
        long userId = credentials.get().userId();
        CreatorUser user = users.findById(userId).orElseThrow(() -> new EntityNotFoundException("User", userId));
        return new AuthResult(createSession(userId), user);
    }

    /** Name used for "Continue with Google" (override with KINSHIP_GOOGLE_NAME). */
    public static final String GOOGLE_NAME = System.getenv().getOrDefault("KINSHIP_GOOGLE_NAME", "Akshaya");
    private static final String GOOGLE_EMAIL = "google." + GOOGLE_NAME.toLowerCase().replaceAll("[^a-z0-9]", "")
            + "@kinship.app";

    /**
     * "Continue with Google". Real Google OAuth needs a registered client id, so until one is configured
     * this always signs in to the Google account of {@link #GOOGLE_NAME}, creating it on first use.
     */
    public AuthResult googleSignIn() throws KinshipException {
        Optional<MysqlUserRepository.Credentials> existing = users.findCredentialsByEmail(GOOGLE_EMAIL);
        if (existing.isPresent()) {
            long userId = existing.get().userId();
            CreatorUser user = users.findById(userId).orElseThrow(() -> new EntityNotFoundException("User", userId));
            return new AuthResult(createSession(userId), user);
        }
        byte[] random = new byte[24];
        RANDOM.nextBytes(random);
        // random password: this account is only reachable through the Google button
        return register(GOOGLE_NAME, GOOGLE_EMAIL, Base64.getEncoder().encodeToString(random));
    }

    public void logout(String token) throws DatabaseException {
        if (token != null) {
            cache.remove(token);
            sessions.delete(token);
        }
    }

    /** User id for a bearer token, or empty when missing/expired. */
    public Optional<Long> resolve(String token) throws DatabaseException {
        if (token == null || token.isBlank()) return Optional.empty();
        CachedSession cached = cache.get(token);
        if (cached != null) {
            if (cached.expiresAt().isAfter(LocalDateTime.now())) {
                return Optional.of(cached.userId());
            }
            cache.remove(token);
        }
        Optional<Long> userId = sessions.findValidUserId(token);
        // re-validated against MySQL every 10 minutes
        userId.ifPresent(id -> cache.put(token, new CachedSession(id, LocalDateTime.now().plusMinutes(10))));
        return userId;
    }

    /** Run periodically by the background scheduler. */
    public int purgeExpiredSessions() throws DatabaseException {
        LocalDateTime now = LocalDateTime.now();
        cache.entrySet().removeIf(e -> e.getValue().expiresAt().isBefore(now));
        return sessions.deleteExpired();
    }

    public int getActiveSessionCount() {
        return cache.size();
    }

    private String createSession(long userId) throws DatabaseException {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        LocalDateTime expires = LocalDateTime.now().plusDays(SESSION_DAYS);
        sessions.create(token, userId, expires);
        cache.put(token, new CachedSession(userId, expires));
        return token;
    }

    private String uniqueUsername(String name, String email) throws DatabaseException {
        String base = (name != null && !name.isBlank() ? name : email.split("@")[0])
                .toLowerCase().replaceAll("[^a-z0-9_.]", "");
        if (base.length() < 2) base = "creator";
        if (base.length() > 24) base = base.substring(0, 24);
        String candidate = "@" + base;
        int suffix = 1;
        while (users.existsByUsername(candidate)) {
            candidate = "@" + base + (++suffix);
        }
        return candidate;
    }
}
