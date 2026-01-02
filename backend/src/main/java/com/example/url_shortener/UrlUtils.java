package com.example.url_shortener;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Random;

@Component
public class UrlUtils {
    private static final String BASE62="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int LENGTH=8;
    private final SecureRandom random=new SecureRandom();

    public String generate() {
        StringBuilder sb = new StringBuilder();
        for(int i=0;i<LENGTH;i++)
        {
            sb.append(BASE62.charAt(random.nextInt(BASE62.length())));
        }
        return sb.toString();
    }
}
