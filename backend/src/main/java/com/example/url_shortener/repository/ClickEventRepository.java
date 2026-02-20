package com.example.url_shortener.repository;

import com.example.url_shortener.model.ClickEvent;
import com.example.url_shortener.model.ShortUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, UUID> {

    /** Total click count for a given short URL. */
    long countByShortUrl(ShortUrl shortUrl);

    /** All click events for analytics aggregation. */
    List<ClickEvent> findByShortUrlOrderByClickedAtDesc(ShortUrl shortUrl);

    /** Count clicks per country for a given short URL. */
    @Query("SELECT c.countryCode AS label, COUNT(c) AS count FROM ClickEvent c WHERE c.shortUrl = :shortUrl GROUP BY c.countryCode ORDER BY COUNT(c) DESC")
    List<Map<String, Object>> countByCountry(ShortUrl shortUrl);

    /** Count clicks per browser for a given short URL. */
    @Query("SELECT c.browser AS label, COUNT(c) AS count FROM ClickEvent c WHERE c.shortUrl = :shortUrl GROUP BY c.browser ORDER BY COUNT(c) DESC")
    List<Map<String, Object>> countByBrowser(ShortUrl shortUrl);

    /** Count clicks per OS for a given short URL. */
    @Query("SELECT c.os AS label, COUNT(c) AS count FROM ClickEvent c WHERE c.shortUrl = :shortUrl GROUP BY c.os ORDER BY COUNT(c) DESC")
    List<Map<String, Object>> countByOs(ShortUrl shortUrl);

    /** Click counts grouped by day (last N days). */
    @Query("SELECT CAST(c.clickedAt AS date) AS day, COUNT(c) AS count FROM ClickEvent c WHERE c.shortUrl = :shortUrl AND c.clickedAt >= :since GROUP BY CAST(c.clickedAt AS date) ORDER BY CAST(c.clickedAt AS date)")
    List<Map<String, Object>> clicksPerDay(ShortUrl shortUrl, LocalDateTime since);

    /** Count unique IPs (unique visitors). */
    @Query("SELECT COUNT(DISTINCT c.ipAddress) FROM ClickEvent c WHERE c.shortUrl = :shortUrl")
    long countUniqueVisitors(ShortUrl shortUrl);
}
