package com.example.url_shortener.exception;

import lombok.Getter;

/**
 * Exception thrown when rate limit is exceeded.
 */
@Getter
public class RateLimitException extends RuntimeException {

    private final int limit;
    private final int remaining;
    private final long resetTime; // Unix timestamp in seconds

    public RateLimitException(String message, int limit, int remaining, long resetTime) {
        super(message);
        this.limit = limit;
        this.remaining = remaining;
        this.resetTime = resetTime;
    }

    /**
     * Get retry-after duration in seconds.
     */
    public long getRetryAfter() {
        long now = System.currentTimeMillis() / 1000;
        return Math.max(0, resetTime - now);
    }
}
