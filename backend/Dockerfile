# syntax=docker/dockerfile:1

# ===== Stage 1: Build the fat JAR =====
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src src
RUN mvn -q -DskipTests clean package

# ===== Stage 2: Build a minimal JRE with jlink =====
# Uses the full JDK image (jlink is a JDK tool, not available in JRE images)
FROM eclipse-temurin:21-jdk-alpine AS jre-build
# Modules required by:
#   Spring Boot 3 + Tomcat, Hibernate/JPA, PostgreSQL JDBC,
#   Redis/Lettuce (TLS), Spring Security, ZXing (headless AWT), JJWT,
#   HttpClient (GeoIP calls), Flyway
RUN jlink \
    --add-modules java.base,java.desktop,java.instrument,java.logging,java.management,java.naming,java.net.http,java.rmi,java.security.jgss,java.security.sasl,java.sql,java.transaction.xa,java.xml,jdk.crypto.cryptoki,jdk.crypto.ec,jdk.jfr,jdk.management,jdk.net,jdk.unsupported,jdk.zipfs \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /custom-jre

# ===== Stage 3: Minimal Alpine runtime (~90MB vs ~210MB before) =====
FROM alpine:3.21
WORKDIR /app

ENV JAVA_HOME=/opt/java
ENV PATH="${JAVA_HOME}/bin:${PATH}"

COPY --from=jre-build /custom-jre $JAVA_HOME

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=build --chown=app:app /app/target/*.jar app.jar

USER app
EXPOSE 8080

# Default to prod profile — override via SPRING_PROFILES_ACTIVE env var
# docker-compose sets this to 'default' for local dev
ENV SPRING_PROFILES_ACTIVE=prod

# -Djava.awt.headless=true — ZXing uses java.awt.image but has no display; required on Alpine
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Djava.awt.headless=true", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=60.0", "-XX:+UseSerialGC", "-XX:MaxMetaspaceSize=128m", "-Xss256k", "-jar", "app.jar"]
