package com.example.url_shortener.dtos.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A single data point for the clicks-over-time chart. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSeriesPoint {
    private String date; // e.g. "2025-02-20"
    private long count; // clicks on that day
}
