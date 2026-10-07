
  # Kinship Social Networking App

  This is a code bundle for Kinship Social Networking App. The original project is available at https://www.figma.com/design/Ghyn02mehwtAu2X2GxqfOd/Kinship-Social-Networking-App.

  The React frontend talks to a Java REST backend (`src/main/java`) that stores everything in **MySQL through JDBC**.

  ## Running the app

  **Quick start (Windows):** make sure MySQL is running, then double-click `start.bat`.
  If the backend window asks for your MySQL user and password, type them once; they are saved to `db.properties`.
  The browser opens http://localhost:5173 when everything is ready.

  You need **Java 17+**, **Maven**, **MySQL 8** (or MariaDB) and **Node.js 18+**.

  ### 1. MySQL credentials

  Copy `db.properties.example` to `db.properties` and set your MySQL user and password
  (or just start the backend: if the login fails it asks for the user and password in the console and saves this file for you).
  `db.properties` is git-ignored, so your password is never committed.
  You can also use the environment variables `KINSHIP_DB_URL`, `KINSHIP_DB_USER` and `KINSHIP_DB_PASSWORD`.

  The database `kinshipdb`, all tables and demo data are created automatically the first time the server starts.

  ### 2. Start the Java backend (port 8080)

  ```bash
  mvn compile exec:java
  # or build a runnable jar
  mvn package && java -jar target/kinship-app-1.0.0.jar
  ```

  Check it at http://localhost:8080/api/system/health

  ### 3. Start the frontend (port 5173)

  ```bash
  npm i
  npm run dev
  ```

  Vite forwards every `/api` request to the Java server. Sign up, or use the demo account
  **sofia@kinship.app / password123** (every seeded user, e.g. maya@kinship.app, uses the same password).

  ## Java concepts in the backend

  | Concept | Where |
  |---|---|
  | Classes & objects, inheritance, polymorphism | `models/` – `AbstractEntity` → `User` → `CreatorUser`; `Post` → `ImagePost` / `VideoPost` / `CollabPost`; `Opportunity` → `Event`/`Gig`/`Collab`/`Competition`/`WorkshopOpportunity`; `PostFactory`, `OpportunityFactory` |
  | Interfaces | `interfaces/` – `IRepository<T, ID>`, `ITalentSearchable`, `INotifiable`, `JsonSerializable`, `Controller`, functional interfaces `ApiHandler` and `SqlFunction` |
  | Exception handling | `exceptions/` – checked `KinshipException` hierarchy (`ValidationException` 400, `AuthenticationException` 401, `AuthorizationException` 403, `EntityNotFoundException` 404, `DuplicateEntityException` 409, `DatabaseException` 500) turned into JSON errors by `GlobalExceptionHandler` |
  | Multithreading | `KinshipServer` HTTP `ThreadPoolExecutor`; `NotificationService` producer/consumer worker on a `BlockingQueue`; `BackgroundScheduler` `ScheduledExecutorService`; `TalentMatchingService` `Callable`/`Future`; `SystemController` `CompletableFuture`; `ServerMetrics` atomics + `ConcurrentHashMap` |
  | JDBC + MySQL | `mysql/` – `MysqlDatabaseManager` (connections, commit/rollback transactions), `SchemaInitializer` (DDL + batch seed), one repository per table group using `PreparedStatement` |

  Open **Settings → Java Backend Status** in the app (or `/system`) to watch the thread pools, worker thread, queue and database counters live.

  ## REST API

  | Method | Path | |
  |---|---|---|
  | POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | account & session |
  | GET | `/api/auth/me` | current user |
  | GET / POST | `/api/feed` | list / create posts |
  | DELETE | `/api/feed/{id}` | delete own post |
  | POST | `/api/feed/{id}/like`, `/api/feed/{id}/share` | like toggle, share |
  | GET / POST | `/api/feed/{id}/comments` | comments |
  | GET | `/api/creators?q=&talent=`, `/api/creators/trending`, `/api/creators/recommended`, `/api/creators/talents` | discovery |
  | GET | `/api/creators/{id}`, `/api/creators/{id}/posts` | profile |
  | POST | `/api/creators/{id}/follow` | follow toggle |
  | PUT | `/api/users/me`, `/api/users/me/talents` | edit profile |
  | GET | `/api/opportunities?type=` | opportunities |
  | POST | `/api/opportunities/{id}/apply` | apply |
  | GET / POST | `/api/notifications`, `/api/notifications/read-all`, `/api/notifications/{id}/read` | notifications |
  | GET / POST | `/api/messages`, `/api/messages/{userId}` | inbox, thread, send |
  | GET / POST | `/api/collaborations`, `/api/collaborations/requests`, `/api/collaborations/requests/{id}/accept\|decline` | collaborations |
  | PUT | `/api/collaborations/{id}/progress` | project progress |
  | GET | `/api/system/health`, `/api/system/stats` | status |

  Authenticated endpoints expect `Authorization: Bearer <token>` (the frontend handles this).
