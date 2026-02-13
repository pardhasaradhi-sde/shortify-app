package com.example.url_shortener.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Rate limiting service using Redis sliding window algorithm.
 * 
 * Uses Redis sorted sets where:
 * - Key: rate_limit:{identifier}:{action}
 * - Members: Unique request IDs
 * - Scores: Unix timestamps
 * 
 * Algorithm:
 * 1. Remove entries older than time window
 * 2. Count remaining entries
 * 3. If count < limit: add new entry and allow
 * 4. Else: reject request
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String RATE_LIMIT_PREFIX = "rate_limit:";

    /**
     * Check if a request is allowed under rate limit.
     * 
     * @param identifier  Unique identifier (user ID, IP address, etc.)
     * @param action      Action being rate limited (e.g., "url_creation",
     *                    "redirect")
     * @param maxRequests Maximum requests allowed in time window
     * @param window      Time window duration
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean isAllowed(String identifier, String action, int maxRequests, Duration window) {
        String key = buildKey(identifier, action);
        long now = Instant.now().toEpochMilli();
        long windowStart = now - window.toMillis();

        try {
            // Remove old entries outside the time window
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);

            // Count current requests in window
            Long currentCount = redisTemplate.opsForZSet().zCard(key);

            if (currentCount == null) {
                currentCount = 0L;
            }

            // Check if under limit
            if (currentCount < maxRequests) {
                // Add new request with current timestamp
                String requestId = UUID.randomUUID().toString();
                redisTemplate.opsForZSet().add(key, requestId, now);

                // Set expiration to window duration (cleanup)
                redisTemplate.expire(key, window);

                log.debug("Rate limit check PASSED for {}:{} ({}/{})",
                        identifier, action, currentCount + 1, maxRequests);
                return true;
            } else {
                log.warn("Rate limit EXCEEDED for {}:{} ({}/{})",
                        identifier, action, currentCount, maxRequests);
                return false;
            }
        } catch (Exception e) {
            log.error("Rate limit check failed for {}:{}", identifier, action, e);
            // Fail open: allow request if Redis is down
            return true;
        }
    }

    /**
     * Get remaining requests allowed in current window.
     * 
     * @param identifier  Unique identifier
     * @param action      Action being rate limited
     * @param maxRequests Maximum requests allowed
     * @param window      Time window duration
     * @return Number of requests remaining (0 if limit exceeded)
     */
    public int getRemainingRequests(String identifier, String action, int maxRequests, Duration window) {
        String key = buildKey(identifier, action);
        long now = Instant.now().toEpochMilli();
        long windowStart = now - window.toMillis();

        try {
            // Remove old entries
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);

            // Count current requests
            Long currentCount = redisTemplate.opsForZSet().zCard(key);
            if (currentCount == null) {
                currentCount = 0L;
            }

            int remaining = Math.max(0, maxRequests - currentCount.intValue());
            return remaining;
        } catch (Exception e) {
            log.error("Failed to get remaining requests for {}:{}", identifier, action, e);
            return maxRequests; // Fail open
        }
    }

    /**
     * Get timestamp when rate limit will reset (oldest entry expires).
     * 
     * @param identifier Unique identifier
     * @param action     Action being rate limited
     * @param window     Time window duration
     * @return Unix timestamp (seconds) when limit resets, or current time if no
     *         entries
     */
    public long getResetTime(String identifier, String action, Duration window) {
        String key = buildKey(identifier, action);

        try {
            // Get oldest entry (lowest score)
            var oldestEntry = redisTemplate.opsForZSet().rangeWithScores(key, 0, 0);

            if (oldestEntry != null && !oldestEntry.isEmpty()) {
                Double oldestTimestamp = oldestEntry.iterator().next().getScore();
                if (oldestTimestamp != null) {
                    // Reset time = oldest entry + window duration
                    long resetTimeMillis = oldestTimestamp.longValue() + window.toMillis();
                    return resetTimeMillis / 1000; // Convert to seconds
                }
            }

            // No entries, reset is now
            return Instant.now().getEpochSecond();
        } catch (Exception e) {
            log.error("Failed to get reset time for {}:{}", identifier, action, e);
            return Instant.now().getEpochSecond();
        }
    }

    /**
     * Manually reset rate limit for an identifier (admin use).
     * 
     * @param identifier Unique identifier
     * @param action     Action being rate limited
     */
    public void reset(String identifier, String action) {
        String key = buildKey(identifier, action);
        try {
            redisTemplate.delete(key);
            log.info("Reset rate limit for {}:{}", identifier, action);
        } catch (Exception e) {
            log.error("Failed to reset rate limit for {}:{}", identifier, action, e);
        }
    }

    /**
     * Build Redis key for rate limiting.
     */
    private String buildKey(String identifier, String action) {
        return RATE_LIMIT_PREFIX + identifier + ":" + action;
    }
}
