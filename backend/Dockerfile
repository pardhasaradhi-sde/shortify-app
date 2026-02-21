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
# Alpine variant is ~200MB vs ~350MB for the Debian JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Alpine uses addgroup/adduser instead of groupadd/useradd
RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=build --chown=app:app /app/target/*.jar app.jar

USER app
EXPOSE 8080

# Default to prod profile — override with SPRING_PROFILES_ACTIVE env var.
# docker-compose sets this to the default (dev) profile for local use.
# Render leaves it unset so this default kicks in for production.
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=60.0", "-XX:+UseSerialGC", "-XX:MaxMetaspaceSize=128m", "-Xss256k", "-jar", "app.jar"]
