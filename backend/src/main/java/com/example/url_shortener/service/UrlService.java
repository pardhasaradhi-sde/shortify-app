package com.example.url_shortener.service;

import com.example.url_shortener.dtos.ShortUrlDTORequest;
import com.example.url_shortener.dtos.ShortUrlDTOResponse;
import com.example.url_shortener.exception.AliasAlreadyTakenException;
import com.example.url_shortener.exception.ShortUrlNotFoundException;
import com.example.url_shortener.model.ShortUrl;
import com.example.url_shortener.model.User;
import com.example.url_shortener.repository.ShortUrlRepository;
import com.example.url_shortener.repository.UserRepository;
import com.example.url_shortener.utils.UrlUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UrlService {
    private final ShortUrlRepository shortUrlRepository;
    private final UserRepository userRepository;
    private final UrlUtils urlUtils;
    private final RedisService redisService;

    /**
     * Resolve short code to original URL (public endpoint).
     * Implements Cache-Aside pattern:
     * 1. Check Redis cache first
     * 2. If cache miss, query database
     * 3. Store result in cache
     * 4. Return URL
     */
    public String resolveShortUrl(String shortCode) {
        // Step 1: Try cache first (fast path)
        String cachedUrl = redisService.getCachedUrl(shortCode);
        if (cachedUrl != null) {
            return cachedUrl; // Cache HIT - return immediately (~5ms)
        }

        // Step 2: Cache MISS - query database (~50ms)
        ShortUrl url = shortUrlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ShortUrlNotFoundException("url not found with code: " + shortCode));

        // Step 3: Warm the cache for next request
        redisService.cacheUrl(shortCode, url.getOriginalUrl());

        // Note: Click counting is now handled by ClickEvent entity (event sourcing)
        // Analytics service will handle this asynchronously
        return url.getOriginalUrl();
    }

    /**
     * Create short URL for authenticated user.
     *
     * Uses optimistic insert strategy to eliminate the TOCTOU race condition:
     * - Random codes: retry up to 5x on DataIntegrityViolationException.
     * - Custom alias: one attempt; DB constraint violation → clean 409.
     */
    public ShortUrlDTOResponse createShortUrl(ShortUrlDTORequest shortUrlDTORequest) {
        User currentUser = getCurrentUser();

        if (shortUrlDTORequest.getCustomAlias() != null && !shortUrlDTORequest.getCustomAlias().isBlank()) {
            // ── Custom alias path ──────────────────────────────────────────────
            String code = shortUrlDTORequest.getCustomAlias().trim().toLowerCase();
            ShortUrl entity = ShortUrl.builder()
                    .originalUrl(shortUrlDTORequest.getOriginalUrl())
                    .shortCode(code)
                    .user(currentUser)
                    .build();
            try {
                ShortUrl saved = shortUrlRepository.save(entity);
                redisService.cacheUrl(saved.getShortCode(), saved.getOriginalUrl());
                return maptoResponse(saved);
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                throw new AliasAlreadyTakenException("Alias '" + code + "' is already taken. Please choose another.");
            }
        } else {
            // ── Random code path ───────────────────────────────────────────────
            int maxAttempts = 5;
            for (int attempt = 0; attempt < maxAttempts; attempt++) {
                String code = urlUtils.generate();
                ShortUrl entity = ShortUrl.builder()
                        .originalUrl(shortUrlDTORequest.getOriginalUrl())
                        .shortCode(code)
                        .user(currentUser)
                        .build();
                try {
                    ShortUrl saved = shortUrlRepository.save(entity);
                    redisService.cacheUrl(saved.getShortCode(), saved.getOriginalUrl());
                    return maptoResponse(saved);
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    log.warn("Short code collision on attempt {}/{}: '{}'", attempt + 1, maxAttempts, code);
                    if (attempt == maxAttempts - 1) {
                        throw new RuntimeException("Could not generate a unique short code. Please try again.");
                    }
                }
            }
            throw new RuntimeException("Unexpected error during URL creation.");
        }
    }

    /**
     * Get all URLs for current authenticated user.
     * Uses a single bulk-count query to avoid N+1 per URL.
     */
    public List<ShortUrlDTOResponse> getAllShortUrls() {
        User currentUser = getCurrentUser();
        List<ShortUrl> urls = shortUrlRepository.findByUserOrderByCreatedAtDesc(currentUser);
        if (urls.isEmpty()) return List.of();

        // Single query: counts for all URLs at once
        Map<String, Long> clickCounts = new HashMap<>();
        shortUrlRepository.countClicksForUrls(urls)
                .forEach(row -> clickCounts.put((String) row[0], (Long) row[1]));

        return urls.stream()
                .map(u -> new ShortUrlDTOResponse(
                        u.getId(),
                        u.getOriginalUrl(),
                        u.getShortCode(),
                        clickCounts.getOrDefault(u.getShortCode(), 0L),
                        u.getCreatedAt(),
                        u.getExpiresAt()))
                .toList();
    }

    /**
     * Delete URL (only if owned by current user).
     */
    public void deleteUrl(UUID id) {
        User currentUser = getCurrentUser();
        ShortUrl url = shortUrlRepository.findById(id)
                .orElseThrow(() -> new ShortUrlNotFoundException("url not found with id: " + id));

        // Check ownership
        if (url.getUser() == null || !url.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own URLs");
        }

        // Invalidate cache before deleting
        redisService.invalidateUrl(url.getShortCode());

        shortUrlRepository.delete(url);
    }

    /**
     * Get current authenticated user from SecurityContext.
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ShortUrlDTOResponse maptoResponse(ShortUrl saved) {
        long clickCount = shortUrlRepository.countClicksByShortCode(saved.getShortCode());
        return new ShortUrlDTOResponse(
                saved.getId(),
                saved.getOriginalUrl(),
                saved.getShortCode(),
                clickCount,
                saved.getCreatedAt(),
                saved.getExpiresAt());
    }
}
