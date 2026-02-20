package com.example.url_shortener.events;

import com.example.url_shortener.model.ShortUrl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;

/**
 * Spring Application Event fired on every redirect.
 *
 * Publishing this event is non-blocking — the redirect returns immediately
 * and the analytics recording happens on a separate thread pool.
 *
 * Diagram: [RedirectController] --publishEvent()--> [ClickEventListener @Async]
 * |
 * saves ClickEvent to DB
 */
@Getter
public class ClickRecordedEvent {

    private final ShortUrl shortUrl;
    private final String ipAddress;
    private final String userAgent;
    private final String referrer;

    public ClickRecordedEvent(ShortUrl shortUrl, HttpServletRequest request) {
        this.shortUrl = shortUrl;
        this.ipAddress = extractIp(request);
        this.userAgent = request.getHeader("User-Agent");
        this.referrer = request.getHeader("Referer"); // Note: HTTP spec typo is intentional
    }

    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
