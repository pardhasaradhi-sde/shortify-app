package com.example.url_shortener.controller;

import com.example.url_shortener.dtos.analytics.AnalyticsResponse;
import com.example.url_shortener.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Analytics endpoints — requires authentication.
 * Only accessible to the URL owner (not enforced at this layer yet, handled by
 * service).
 *
 * GET /api/urls/{shortCode}/analytics
 * → { totalClicks, uniqueVisitors, clicksByCountry[], clicksByBrowser[],
 * clicksByOs[], clicksOverTime[] }
 */
@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{shortCode}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@PathVariable String shortCode) {
        return ResponseEntity.ok(analyticsService.getAnalytics(shortCode));
    }
}
