package com.example.url_shortener.service;

import com.example.url_shortener.dtos.ShortUrlDTORequest;
import com.example.url_shortener.dtos.ShortUrlDTOResponse;
import com.example.url_shortener.exception.ShortUrlNotFoundException;
import com.example.url_shortener.model.ShortUrl;
import com.example.url_shortener.model.User;
import com.example.url_shortener.repository.ShortUrlRepository;
import com.example.url_shortener.repository.UserRepository;
import com.example.url_shortener.utils.UrlUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
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
     */
    public ShortUrlDTOResponse createShortUrl(ShortUrlDTORequest shortUrlDTORequest) {
        String code;
        do {
            code = urlUtils.generate();
        } while (shortUrlRepository.existsByShortCode(code));

        // Get current authenticated user
        User currentUser = getCurrentUser();

        ShortUrl shortUrl = ShortUrl.builder()
                .originalUrl(shortUrlDTORequest.getOriginalUrl())
                .shortCode(code)
                .user(currentUser) // Associate with user
                .build();

        ShortUrl saved = shortUrlRepository.save(shortUrl);

        // Warm the cache immediately (proactive caching)
        redisService.cacheUrl(saved.getShortCode(), saved.getOriginalUrl());

        return maptoResponse(saved);
    }

    /**
     * Get all URLs for current authenticated user.
     */
    public List<ShortUrlDTOResponse> getAllShortUrls() {
        User currentUser = getCurrentUser();
        List<ShortUrl> urllist = shortUrlRepository.findAll();

        // Filter to only show current user's URLs
        return urllist.stream()
                .filter(url -> url.getUser() != null && url.getUser().getId().equals(currentUser.getId()))
                .map(this::maptoResponse)
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
        return new ShortUrlDTOResponse(
                saved.getId(),
                saved.getOriginalUrl(),
                saved.getShortCode(),
                0L, // TODO: Calculate from ClickEvent count
                saved.getCreatedAt(),
                saved.getExpiresAt());
    }
}
