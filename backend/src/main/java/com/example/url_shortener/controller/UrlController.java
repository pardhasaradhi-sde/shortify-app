package com.example.url_shortener.controller;


import com.example.url_shortener.dtos.ShortUrlDTORequest;
import com.example.url_shortener.dtos.ShortUrlDTOResponse;
import com.example.url_shortener.service.UrlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class UrlController {
    private final UrlService urlService;

    @PostMapping
    public ResponseEntity<ShortUrlDTOResponse> createShortUrl(@RequestBody ShortUrlDTORequest shortUrlDTORequest)
    {
        ShortUrlDTOResponse response=urlService.createShortUrl(shortUrlDTORequest);
        return new  ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ShortUrlDTOResponse>> getAllShortUrls()
    {
        return new ResponseEntity<>(urlService.getAllShortUrls(),HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>   deleteShortUrl(@PathVariable UUID id)
    {
        urlService.deleteUrl(id);
        return ResponseEntity.noContent().build();
    }
}
