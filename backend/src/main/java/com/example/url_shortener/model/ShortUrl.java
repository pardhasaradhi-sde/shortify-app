package com.example.url_shortener.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "short_urls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortUrl {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        private UUID id;

        @Column(name = "short_code", nullable = false, unique = true, length = 10)
        private String shortCode;

        @Column(name = "original_url", nullable = false, columnDefinition = "TEXT")
        private String originalUrl;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        private User user;

        @CreationTimestamp
        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;

        @UpdateTimestamp
        @Column(name = "updated_at", nullable = false)
        private LocalDateTime updatedAt;

        @Column(name = "expires_at")
        private LocalDateTime expiresAt;

        @Column(name = "is_active", nullable = false)
        @Builder.Default
        private Boolean isActive = true;

        @Column(name = "access_type", nullable = false, length = 20)
        @Builder.Default
        private String accessType = "PUBLIC";
}
