# Builds the whole Kinship app into one image: React website + Java server (serves both on $PORT).

# 1) website
FROM node:22-alpine AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.ts postcss.config.mjs ./
COPY src ./src
RUN npm run build

# 2) Java server
FROM maven:3.9-eclipse-temurin-21 AS server
WORKDIR /app
COPY pom.xml ./
COPY src/main/java ./src/main/java
RUN mvn -q -B -DskipTests package

# 3) runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=server /app/target/kinship-app-1.0.0.jar ./kinship.jar
COPY --from=web /app/dist ./dist
ENV PORT=8080
EXPOSE 8080
# MySQL login comes from KINSHIP_DB_URL, KINSHIP_DB_USER and KINSHIP_DB_PASSWORD
CMD ["java", "-XX:MaxRAMPercentage=75", "-jar", "kinship.jar"]
