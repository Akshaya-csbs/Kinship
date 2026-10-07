# Deploying Kinship online

The repository contains a `Dockerfile` that builds the React website and the Java server into one image.
The Java server serves the website and the `/api` on the port the host gives it (`PORT`), and connects to
MySQL with three environment variables:

| Variable | Example |
|---|---|
| `KINSHIP_DB_URL` | `jdbc:mysql://HOST:PORT/DATABASE?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `KINSHIP_DB_USER` | `root` |
| `KINSHIP_DB_PASSWORD` | your database password |

Instead of the three `KINSHIP_DB_*` variables you can set one `MYSQL_URL=mysql://user:password@host:port/database`
(Railway provides this). If the database is still starting, the server retries for about 2 minutes.

Tables and demo data are created automatically on the first start.

---

## Option A – Railway (easiest: app and MySQL in one place)

Railway gives new accounts trial credit; after that the Hobby plan is about $5/month.

1. Go to https://railway.com and **sign in with GitHub**.
2. **New Project → Deploy from GitHub repo →** pick `Akshaya-csbs/Kinship`.
   Railway finds the `Dockerfile` and starts building (5–10 minutes the first time).
3. In the same project click **+ Create → Database → MySQL**. Wait until it is running.
4. Click your **Kinship** service → **Variables** tab → **New Variable**, and add exactly one variable:
   ```
   MYSQL_URL=${{MySQL.MYSQL_URL}}
   ```
   (If your database service is not called `MySQL`, replace `MySQL` with its name.) Railway redeploys automatically.
   The server reads the host, port, user, password and database from that single value.
5. Kinship service → **Settings → Networking → Generate Domain**.
   You get a link like `https://kinship-production-xxxx.up.railway.app`.
6. Open the link. Check `https://YOUR-LINK/api/system/health` shows `"database":"CONNECTED"`.

Every `git push` to `main` redeploys automatically.
To look at the data: MySQL service → **Data** tab, or connect MySQL Workbench with the
*public* host/port/user/password from the MySQL service's **Connect** tab.

---

## Option B – Free: Render (app) + Aiven (MySQL)

Free, but the Render free app **sleeps after 15 minutes without visitors**; the first visit after that
takes about a minute to wake up.

**Database (Aiven)**
1. Sign up at https://aiven.io → **Create service → MySQL → Free plan**.
2. When it is running, copy **Host, Port, User, Password** from the service overview (database name is `defaultdb`).

**App (Render)**
1. Sign up at https://render.com with GitHub → **New → Web Service** → pick `Akshaya-csbs/Kinship`.
2. Language/Runtime: **Docker**. Instance type: **Free**.
3. Under **Environment Variables** add:
   ```
   KINSHIP_DB_URL      = jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED&serverTimezone=UTC&characterEncoding=UTF-8
   KINSHIP_DB_USER     = avnadmin
   KINSHIP_DB_PASSWORD = (Aiven password)
   ```
   Aiven requires SSL, which is why this URL uses `sslMode=REQUIRED`.
4. **Create Web Service**. After the build you get a link like `https://kinship-xxxx.onrender.com`.

---

## Checking a deployment

- `https://YOUR-LINK/api/system/health` → `{"status":"UP","database":"CONNECTED",...}`
- The host's **Logs** show `Kinship is running` when the server is up, or the MySQL error if the
  variables are wrong (`Access denied` = wrong user/password, `Communications link failure` = wrong host/port).
