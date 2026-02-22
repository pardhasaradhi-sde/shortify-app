package com.example.url_shortener.controller;

import com.example.url_shortener.events.ClickRecordedEvent;
import com.example.url_shortener.repository.ShortUrlRepository;
import com.example.url_shortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class RedirectController {

    private final UrlService urlService;
    private final ShortUrlRepository shortUrlRepository;
    private final ApplicationEventPublisher eventPublisher;

    @GetMapping("/{shortUrl:(?!health$|favicon\\.ico$).*}")
    public ResponseEntity<Void> redirect(@PathVariable String shortUrl, HttpServletRequest request) {
        // Step 1: Resolve URL (uses Redis cache — ~5ms)
        String originalUrl = urlService.resolveShortUrl(shortUrl);

        // Step 2: Fire async event — runs on a background thread, zero redirect latency
        // impact
        shortUrlRepository.findByShortCode(shortUrl).ifPresent(
                shortUrlEntity -> eventPublisher.publishEvent(new ClickRecordedEvent(shortUrlEntity, request)));

        // Step 3: Return HTTP 302 redirect immediately
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(originalUrl))
                .build();
    }
}
