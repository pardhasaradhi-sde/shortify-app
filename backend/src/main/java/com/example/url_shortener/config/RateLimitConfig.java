package com.example.url_shortener.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration to register rate limiting interceptor.
 */
@Configuration
@RequiredArgsConstructor
public class RateLimitConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/urls")    // URL creation (POST /api/urls)
                .addPathPatterns("/api/urls/**") // All other /api/urls/* endpoints
                .addPathPatterns("/{shortCode}"); // Public redirect endpoint
    }
}
