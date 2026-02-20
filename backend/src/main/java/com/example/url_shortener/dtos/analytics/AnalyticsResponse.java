package com.example.url_shortener.dtos.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private String shortCode;
    private String originalUrl;

    private long totalClicks;
    private long uniqueVisitors;

    /** e.g. [ { "label": "IN", "count": 420 }, { "label": "US", "count": 120 } ] */
    private List<Map<String, Object>> clicksByCountry;

    /** e.g. [ { "label": "Chrome", "count": 300 } ] */
    private List<Map<String, Object>> clicksByBrowser;

    /** e.g. [ { "label": "Windows", "count": 250 } ] */
    private List<Map<String, Object>> clicksByOs;

    /** Daily click count for the last 30 days. */
    private List<TimeSeriesPoint> clicksOverTime;
}
