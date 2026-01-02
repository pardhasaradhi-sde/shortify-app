package com.example.url_shortener.service;

import com.example.url_shortener.UrlUtils;
import com.example.url_shortener.dtos.ShortUrlDTORequest;
import com.example.url_shortener.dtos.ShortUrlDTOResponse;
import com.example.url_shortener.exception.ShortUrlNotFoundException;
import com.example.url_shortener.model.ShortUrl;
import com.example.url_shortener.repository.ShortUrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UrlService {
    private final ShortUrlRepository shortUrlRepository;
    private final UrlUtils urlUtils;

    public String resolveShortUrl(String shortUrl) {
       ShortUrl url=shortUrlRepository.findByShortUrl(shortUrl)
               .orElseThrow(()-> new ShortUrlNotFoundException("url not found with name"+shortUrl));
       url.setClickCount(url.getClickCount()+1);
       shortUrlRepository.save(url);
       return url.getOriginalUrl();
    }


    public ShortUrlDTOResponse createShortUrl(ShortUrlDTORequest shortUrlDTORequest) {
        String code;
        do{
            code=urlUtils.generate();
        }while(shortUrlRepository.existsByShortUrl(code));

        ShortUrl shortUrl=ShortUrl.builder()
                .originalUrl(shortUrlDTORequest.getOriginalUrl())
                .shortUrl(code)
                .clickCount(0L)
                .build();
        ShortUrl saved=shortUrlRepository.save(shortUrl);
        return maptoResponse(saved);
    }

    private ShortUrlDTOResponse maptoResponse(ShortUrl saved) {
        return new  ShortUrlDTOResponse(
                saved.getUuid(),
                saved.getOriginalUrl(),
                saved.getShortUrl(),
                saved.getClickCount(),
                saved.getCreatedAt(),
                saved.getExpiredAt()
        );
    }

    public List<ShortUrlDTOResponse> getAllShortUrls() {
        List<ShortUrl> urllist=shortUrlRepository.findAll();
        return urllist.stream().map((a)-> maptoResponse(a)).toList();
    }

    public void deleteUrl(UUID id) {
        ShortUrl url=shortUrlRepository.findById(id).
                orElseThrow(()-> new ShortUrlNotFoundException("url not found with id"+id));
        shortUrlRepository.delete(url);
    }
}
