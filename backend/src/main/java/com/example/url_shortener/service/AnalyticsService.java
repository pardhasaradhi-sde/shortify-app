package com.example.url_shortener.service;

import com.example.url_shortener.dtos.analytics.AnalyticsResponse;
import com.example.url_shortener.dtos.analytics.TimeSeriesPoint;
import com.example.url_shortener.exception.ShortUrlNotFoundException;
import com.example.url_shortener.model.ShortUrl;
import com.example.url_shortener.repository.ClickEventRepository;
import com.example.url_shortener.repository.ShortUrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ShortUrlRepository shortUrlRepository;
    private final ClickEventRepository clickEventRepository;

    /**
     * Full analytics report for a given short code.
     * Only the URL owner should be able to call this (enforced in controller).
     */
    public AnalyticsResponse getAnalytics(String shortCode) {
        ShortUrl shortUrl = shortUrlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ShortUrlNotFoundException("URL not found: " + shortCode));

        long totalClicks = clickEventRepository.countByShortUrl(shortUrl);
        long uniqueVisitors = clickEventRepository.countUniqueVisitors(shortUrl);

        List<Map<String, Object>> byCountry = clickEventRepository.countByCountry(shortUrl);
        List<Map<String, Object>> byBrowser = clickEventRepository.countByBrowser(shortUrl);
        List<Map<String, Object>> byOs = clickEventRepository.countByOs(shortUrl);

        // Last 30 days daily breakdown
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Map<String, Object>> dailyRaw = clickEventRepository.clicksPerDay(shortUrl, since);

        List<TimeSeriesPoint> clicksOverTime = dailyRaw.stream()
                .map(row -> new TimeSeriesPoint(
                        row.get("day").toString(),
                        ((Number) row.get("count")).longValue()))
                .toList();

        return AnalyticsResponse.builder()
                .shortCode(shortCode)
                .originalUrl(shortUrl.getOriginalUrl())
                .totalClicks(totalClicks)
                .uniqueVisitors(uniqueVisitors)
                .clicksByCountry(byCountry)
                .clicksByBrowser(byBrowser)
                .clicksByOs(byOs)
                .clicksOverTime(clicksOverTime)
                .build();
    }
}
