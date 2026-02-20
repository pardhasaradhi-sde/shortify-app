package com.example.url_shortener.events;

import com.example.url_shortener.model.ClickEvent;
import com.example.url_shortener.model.ShortUrl;
import com.example.url_shortener.repository.ClickEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;

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
            String countryCode = resolveCountry(event.getIpAddress());

            ClickEvent clickEvent = ClickEvent.builder()
                    .shortUrl(event.getShortUrl())
                    .ipAddress(event.getIpAddress())
                    .userAgent(userAgent)
                    .referrer(event.getReferrer())
                    .browser(parseBrowser(userAgent))
                    .os(parseOs(userAgent))
                    .countryCode(countryCode)
                    .build();

            clickEventRepository.save(clickEvent);

            log.debug("Recorded click for short code: {} from country: {}",
                    event.getShortUrl().getShortCode(), countryCode);

        } catch (Exception e) {
            // Never let analytics failure affect the user's redirect
            log.error("Failed to record click event for: {}", event.getShortUrl().getShortCode(), e);
        }
    }

    /**
     * Resolves country code from IP using ip-api.com (free, no API key needed).
     * Returns null silently on any failure — analytics must never block redirects.
     * Skips private/loopback IPs.
     */
    private String resolveCountry(String ip) {
        if (ip == null || ip.isBlank())
            return null;
        if (ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")
                || ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) {
            return null;
        }
        try {
            HttpURLConnection conn = (HttpURLConnection) URI
                    .create("http://ip-api.com/json/" + ip + "?fields=countryCode,status")
                    .toURL()
                    .openConnection();
            conn.setConnectTimeout(2000);
            conn.setReadTimeout(2000);
            conn.setRequestMethod("GET");

            if (conn.getResponseCode() != 200)
                return null;

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null)
                    sb.append(line);
                String json = sb.toString();
                if (json.contains("\"status\":\"success\"")) {
                    int start = json.indexOf("\"countryCode\":\"") + 15;
                    int end = json.indexOf("\"", start);
                    if (start > 14 && end > start)
                        return json.substring(start, end);
                }
            }
        } catch (Exception e) {
            log.debug("GeoIP lookup failed for {}: {}", ip, e.getMessage());
        }
        return null;
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
