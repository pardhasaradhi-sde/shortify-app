package com.example.url_shortener.config;

import com.example.url_shortener.exception.RateLimitException;
import com.example.url_shortener.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

/**
 * Interceptor to apply rate limiting to HTTP requests.
 * 
 * Applies different rate limits based on endpoint:
 * - URL creation: Per authenticated user
 * - Redirects: Per IP address
 * - API endpoints: Per authenticated user
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitService rateLimitService;

    @Value("${rate-limit.url-creation.max-requests:10}")
    private int urlCreationMaxRequests;

    @Value("${rate-limit.url-creation.window-seconds:3600}")
    private int urlCreationWindowSeconds;

    @Value("${rate-limit.redirect.max-requests:100}")
    private int redirectMaxRequests;

    @Value("${rate-limit.redirect.window-seconds:60}")
    private int redirectWindowSeconds;

    @Value("${rate-limit.api.max-requests:1000}")
    private int apiMaxRequests;

    @Value("${rate-limit.api.window-seconds:3600}")
    private int apiWindowSeconds;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Determine rate limit parameters based on endpoint
        String identifier;
        String action;
        int maxRequests;
        Duration window;

        if (path.startsWith("/api/urls") && "POST".equals(method)) {
            // URL creation - rate limit by user
            identifier = getCurrentUserId();
            action = "url_creation";
            maxRequests = urlCreationMaxRequests;
            window = Duration.ofSeconds(urlCreationWindowSeconds);
        } else if (path.matches("/[a-zA-Z0-9]+")) {
            // Redirect - rate limit by IP
            identifier = getClientIp(request);
            action = "redirect";
            maxRequests = redirectMaxRequests;
            window = Duration.ofSeconds(redirectWindowSeconds);
        } else if (path.startsWith("/api/")) {
            // Other API endpoints - rate limit by user
            identifier = getCurrentUserId();
            action = "api";
            maxRequests = apiMaxRequests;
            window = Duration.ofSeconds(apiWindowSeconds);
        } else {
            // No rate limiting for other endpoints
            return true;
        }

        // Check rate limit
        boolean allowed = rateLimitService.isAllowed(identifier, action, maxRequests, window);

        // Set rate limit headers
        int remaining = rateLimitService.getRemainingRequests(identifier, action, maxRequests, window);
        long resetTime = rateLimitService.getResetTime(identifier, action, window);

        response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
        response.setHeader("X-RateLimit-Reset", String.valueOf(resetTime));

        if (!allowed) {
            // Rate limit exceeded
            long retryAfter = resetTime - (System.currentTimeMillis() / 1000);
            response.setHeader("Retry-After", String.valueOf(Math.max(0, retryAfter)));

            throw new RateLimitException(
                    "Rate limit exceeded. Try again in " + retryAfter + " seconds.",
                    maxRequests,
                    0,
                    resetTime);
        }

        return true;
    }

    /**
     * Get current authenticated user ID, or "anonymous" if not authenticated.
     */
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName(); // Email
        }
        return "anonymous";
    }

    /**
     * Get client IP address from request.
     * Handles X-Forwarded-For header for proxied requests.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take first IP in chain
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
