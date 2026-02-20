package com.example.url_shortener.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for the application.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle validation failures from @Valid — returns HTTP 400 with field →
     * message map.
     * Example response: { "error": "Validation Failed", "fields": { "originalUrl":
     * "Must be a valid URL" } }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fe -> fe.getField(),
                        fe -> fe.getDefaultMessage(),
                        (first, second) -> first // keep first message if duplicate field
                ));

        Map<String, Object> body = new HashMap<>();
        body.put("error", "Validation Failed");
        body.put("fields", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Handle rate limit exceptions with proper HTTP 429 response.
     */
    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimitException(RateLimitException ex) {
        log.warn("Rate limit exceeded: {}", ex.getMessage());

        Map<String, Object> body = new HashMap<>();
        body.put("error", "Rate Limit Exceeded");
        body.put("message", ex.getMessage());
        body.put("limit", ex.getLimit());
        body.put("remaining", ex.getRemaining());
        body.put("resetTime", ex.getResetTime());
        body.put("retryAfter", ex.getRetryAfter());

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(ex.getRetryAfter()))
                .header("X-RateLimit-Limit", String.valueOf(ex.getLimit()))
                .header("X-RateLimit-Remaining", String.valueOf(ex.getRemaining()))
                .header("X-RateLimit-Reset", String.valueOf(ex.getResetTime()))
                .body(body);
    }

    /**
     * Handle ShortUrlNotFoundException.
     */
    @ExceptionHandler(ShortUrlNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleShortUrlNotFoundException(ShortUrlNotFoundException ex) {
        log.warn("Short URL not found: {}", ex.getMessage());

        Map<String, String> body = new HashMap<>();
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    /**
     * Handle alias-already-taken errors as HTTP 409.
     */
    @ExceptionHandler(AliasAlreadyTakenException.class)
    public ResponseEntity<Map<String, String>> handleAliasAlreadyTaken(AliasAlreadyTakenException ex) {
        log.warn("Alias conflict: {}", ex.getMessage());
        Map<String, String> body = new HashMap<>();
        body.put("error", "Alias Taken");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /**
     * Safety net: any DB constraint violation that escapes the service layer
     * returns 409 instead of 500.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());
        Map<String, String> body = new HashMap<>();
        body.put("error", "Conflict");
        body.put("message", "A record with the same unique key already exists.");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /**
     * Handle business logic errors (e.g. alias already taken) as 409 Conflict.
     * Explicitly excludes RateLimitException so the specific 429 handler above always wins.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        // RateLimitException must be handled by its own @ExceptionHandler — re-throw so
        // Spring's exception resolver can route it to handleRateLimitException().
        if (ex instanceof RateLimitException rle) {
            return handleRateLimitException(rle);
        }
        log.warn("Business logic error: {}", ex.getMessage());

        Map<String, Object> body = new HashMap<>();
        body.put("error", "Conflict");
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /**
     * Handle generic exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);

        Map<String, String> body = new HashMap<>();
        body.put("error", "Internal Server Error");
        body.put("message", "An unexpected error occurred");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
