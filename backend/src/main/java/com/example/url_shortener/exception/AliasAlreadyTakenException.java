package com.example.url_shortener.exception;

/**
 * Thrown when a user-supplied custom alias already exists in the database.
 * Mapped to HTTP 409 Conflict by GlobalExceptionHandler.
 */
public class AliasAlreadyTakenException extends RuntimeException {
    public AliasAlreadyTakenException(String message) {
        super(message);
    }
}
