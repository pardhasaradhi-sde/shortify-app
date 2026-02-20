package com.example.url_shortener.controller;

import com.example.url_shortener.exception.ShortUrlNotFoundException;
import com.example.url_shortener.repository.ShortUrlRepository;
import com.example.url_shortener.service.QrCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * QR code generation endpoint.
 *
 * GET /api/urls/{shortCode}/qr → 300x300 PNG (default)
 * GET /api/urls/{shortCode}/qr?size=600 → 600x600 PNG (custom size)
 *
 * Response includes Content-Disposition: attachment so browsers download it.
 * Requires authentication.
 */
@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class QrCodeController {

        private final QrCodeService qrCodeService;
        private final ShortUrlRepository shortUrlRepository;

        @Value("${app.base-url:http://localhost:8080}")
        private String baseUrl;

        @GetMapping("/{shortCode}/qr")
        public ResponseEntity<byte[]> getQrCode(
                        @PathVariable String shortCode,
                        @RequestParam(defaultValue = "300") int size) {

                // Verify the short code exists
                shortUrlRepository.findByShortCode(shortCode)
                                .orElseThrow(() -> new ShortUrlNotFoundException("URL not found: " + shortCode));

                // Build the full redirect URL that the QR code will encode
                String fullUrl = baseUrl + "/" + shortCode;
                byte[] qrImage = qrCodeService.generateQrCode(fullUrl, size);

                return ResponseEntity.ok()
                                .contentType(MediaType.IMAGE_PNG)
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "inline; filename=\"qr-" + shortCode + ".png\"")
                                .body(qrImage);
        }
}
