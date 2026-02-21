# syntax=docker/dockerfile:1

# ===== Build stage =====
# Uses the full Maven image — no need for mvnw or .mvn wrapper
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependency resolution separately from source compilation
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

COPY src src
RUN mvn -q -DskipTests clean package

# ===== Runtime stage =====
FROM eclipse-temurin:21-jre
WORKDIR /app

# Install curl (used by the docker-compose healthcheck)
# Create a non-root system user to run the application
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system app \
    && useradd --system --gid app --home /app app

COPY --from=build --chown=app:app /app/target/*.jar app.jar

USER app
EXPOSE 8080
ENTRYPOINT [
  "java",
  "-Djava.security.egd=file:/dev/./urandom",
  "-XX:+UseContainerSupport",
  "-XX:MaxRAMPercentage=60.0",
  "-XX:+UseSerialGC",
  "-XX:MaxMetaspaceSize=128m",
  "-Xss256k",
  "-Dspring.profiles.active=prod",
  "-jar",
  "app.jar"
]
