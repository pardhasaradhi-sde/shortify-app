package com.example.url_shortener.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Service for Redis cache operations.
 * 
 * Implements Cache-Aside pattern:
 * 1. Check cache first
 * 2. If miss, query database
 * 3. Store result in cache
 * 4. Return result
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String URL_CACHE_PREFIX = "url:";
    private static final long DEFAULT_TTL = 86400; // 24 hours

    /**
     * Cache a URL mapping.
     * 
     * @param shortCode   The short code (e.g., "abc123")
     * @param originalUrl The original URL to redirect to
     */
    public void cacheUrl(String shortCode, String originalUrl) {
        try {
            String key = URL_CACHE_PREFIX + shortCode;
            redisTemplate.opsForValue().set(key, originalUrl, DEFAULT_TTL, TimeUnit.SECONDS);
            log.info("Cached URL: {} -> {}", shortCode, originalUrl);
        } catch (Exception e) {
            log.error("Failed to cache URL: {}", shortCode, e);
            // Don't throw - cache failures shouldn't break the app
        }
    }

    /**
     * Get cached URL by short code.
     * 
     * @param shortCode The short code to look up
     * @return The original URL if cached, null otherwise
     */
    public String getCachedUrl(String shortCode) {
        try {
            String key = URL_CACHE_PREFIX + shortCode;
            Object value = redisTemplate.opsForValue().get(key);

            if (value != null) {
                log.info("Cache HIT for: {}", shortCode);
                return value.toString();
            } else {
                log.info("Cache MISS for: {}", shortCode);
                return null;
            }
        } catch (Exception e) {
            log.error("Failed to get cached URL: {}", shortCode, e);
            return null; // Fallback to database on cache failure
        }
    }

    /**
     * Invalidate (remove) a cached URL.
     * Called when a URL is deleted or updated.
     * 
     * @param shortCode The short code to invalidate
     */
    public void invalidateUrl(String shortCode) {
        try {
            String key = URL_CACHE_PREFIX + shortCode;
            redisTemplate.delete(key);
            log.info("Invalidated cache for: {}", shortCode);
        } catch (Exception e) {
            log.error("Failed to invalidate cache: {}", shortCode, e);
        }
    }

    /**
     * Get cache statistics.
     * Useful for monitoring cache performance.
     * 
     * @return Cache stats as a formatted string
     */
    public String getCacheStats() {
        try {
            var keys = redisTemplate.keys(URL_CACHE_PREFIX + "*");
            int totalKeys = (keys != null) ? keys.size() : 0;
            return String.format("Total cached URLs: %d", totalKeys);
        } catch (Exception e) {
            log.error("Failed to get cache stats", e);
            return "Cache stats unavailable";
        }
    }

    /**
     * Clear all cached URLs.
     * Use with caution - only for admin operations.
     */
    public void clearAllCache() {
        try {
            var keys = redisTemplate.keys(URL_CACHE_PREFIX + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.warn("Cleared {} cached URLs", keys.size());
            }
        } catch (Exception e) {
            log.error("Failed to clear cache", e);
        }
    }
}
