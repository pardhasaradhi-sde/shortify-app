package com.example.url_shortener.events;

import com.example.url_shortener.model.ClickEvent;
import com.example.url_shortener.model.ShortUrl;
import com.example.url_shortener.repository.ClickEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;



/**
 * Async listener that records a ClickEvent to the database.
 *
 * @Async ensures this method runs on a separate thread — the redirect response
 *        is returned to the user BEFORE this method even starts. Zero latency
 *        impact.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ClickEventListener {

    private final ClickEventRepository clickEventRepository;

    @EventListener
    @Async
    public void onClickRecorded(ClickRecordedEvent event) {
        try {
            String userAgent = event.getUserAgent();

            ClickEvent clickEvent = ClickEvent.builder()
                    .shortUrl(event.getShortUrl())
                    .ipAddress(event.getIpAddress())
                    .userAgent(userAgent)
                    .referrer(event.getReferrer())
                    .browser(parseBrowser(userAgent))
                    .os(parseOs(userAgent))
                    .build();

            clickEventRepository.save(clickEvent);

            log.debug("Recorded click for short code: {}", event.getShortUrl().getShortCode());

        } catch (Exception e) {
            // Never let analytics failure affect the user's redirect
            log.error("Failed to record click event for: {}", event.getShortUrl().getShortCode(), e);
        }
    }

    private String parseBrowser(String userAgent) {
        if (userAgent == null)
            return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("edg/"))
            return "Edge";
        if (ua.contains("opr/") || ua.contains("opera"))
            return "Opera";
        if (ua.contains("chrome"))
            return "Chrome";
        if (ua.contains("firefox"))
            return "Firefox";
        if (ua.contains("safari"))
            return "Safari";
        if (ua.contains("msie") || ua.contains("trident"))
            return "Internet Explorer";
        return "Other";
    }

    private String parseOs(String userAgent) {
        if (userAgent == null)
            return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("windows"))
            return "Windows";
        if (ua.contains("macintosh") || ua.contains("mac os"))
            return "macOS";
        if (ua.contains("android"))
            return "Android";
        if (ua.contains("iphone") || ua.contains("ipad"))
            return "iOS";
        if (ua.contains("linux"))
            return "Linux";
        return "Other";
    }
}
