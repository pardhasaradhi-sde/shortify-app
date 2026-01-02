package com.example.url_shortener.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name="short_urls",
        indexes = {
                @Index(name="idx_shorturl",columnList = "shortUrl",unique = true)
        }
)
public class ShortUrl {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @Column(nullable = false,length = 2048)
    private String originalUrl;

    @Column(nullable = false,unique = true,length=10)
    private String shortUrl;

    @Column(nullable=false)
    private Long clickCount=0L;

    @Column(nullable=false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime expiredAt;

}
