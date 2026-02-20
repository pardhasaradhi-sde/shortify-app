package com.example.url_shortener.repository;

import com.example.url_shortener.model.ShortUrl;
import com.example.url_shortener.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShortUrlRepository extends JpaRepository<ShortUrl, UUID> {
    Optional<ShortUrl> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    /**
     * Fetch all URLs for a given user, newest first.
     * Uses a single WHERE clause instead of loading the entire table and filtering
     * in Java.
     */
    List<ShortUrl> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Count total clicks for a given short URL (used for the clickCount in
     * responses).
     */
    @Query("SELECT COUNT(c) FROM ClickEvent c WHERE c.shortUrl.shortCode = :shortCode")
    long countClicksByShortCode(String shortCode);

    /**
     * Bulk-fetch click counts for a list of short codes in a single query.
     * Returns a list of [shortCode, count] pairs — avoids N+1 on list endpoints.
     */
    @Query("SELECT c.shortUrl.shortCode AS shortCode, COUNT(c) AS clickCount " +
           "FROM ClickEvent c WHERE c.shortUrl IN :urls GROUP BY c.shortUrl.shortCode")
    List<Object[]> countClicksForUrls(List<ShortUrl> urls);
}
