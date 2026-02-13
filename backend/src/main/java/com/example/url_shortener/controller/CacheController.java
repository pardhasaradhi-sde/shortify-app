package com.example.url_shortener.controller;

import com.example.url_shortener.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin endpoints for cache management.
 * These endpoints help monitor and manage the Redis cache.
 */
@RestController
@RequestMapping("/admin/cache")
@RequiredArgsConstructor
public class CacheController {

    private final RedisService redisService;

    /**
     * Get cache statistics.
     * Shows how many URLs are currently cached.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, String>> getCacheStats() {
        String stats = redisService.getCacheStats();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "stats", stats));
    }

    /**
     * Clear all cached URLs.
     * Use with caution - this will cause cache misses until URLs are accessed
     * again.
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearCache() {
        redisService.clearAllCache();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Cache cleared successfully"));
    }

    /**
     * Invalidate a specific URL from cache.
     * Useful when a URL is updated or needs to be refreshed.
     */
    @DeleteMapping("/{shortCode}")
    public ResponseEntity<Map<String, String>> invalidateUrl(@PathVariable String shortCode) {
        redisService.invalidateUrl(shortCode);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Cache invalidated for: " + shortCode));
    }
}
