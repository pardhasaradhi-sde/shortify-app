package com.example.url_shortener.service;

import com.example.url_shortener.dtos.auth.AuthResponse;
import com.example.url_shortener.dtos.auth.LoginRequest;
import com.example.url_shortener.dtos.auth.RegisterRequest;
import com.example.url_shortener.model.User;
import com.example.url_shortener.repository.UserRepository;
import com.example.url_shortener.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for handling authentication operations.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;
        private final UserDetailsService userDetailsService;

        /**
         * Register a new user.
         * 
         * @param request Registration details
         * @return Authentication response with JWT token
         */
        public AuthResponse register(RegisterRequest request) {
                // Check if user already exists
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already registered");
                }

                // Create new user
                User user = User.builder()
                                .id(UUID.randomUUID())
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() != null ? request.getRole() : "USER")
                                .build();

                userRepository.save(user);

                // Generate JWT token
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String token = jwtUtil.generateToken(userDetails);

                return AuthResponse.builder()
                                .token(token)
                                .email(user.getEmail())
                                .role(user.getRole())
                                .message("User registered successfully")
                                .build();
        }

        /**
         * Authenticate user and generate JWT token.
         * 
         * @param request Login credentials
         * @return Authentication response with JWT token
         */
        public AuthResponse login(LoginRequest request) {
                // Authenticate user
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                // Load user details and generate token
                UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
                String token = jwtUtil.generateToken(userDetails);

                // Get user for additional info
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return AuthResponse.builder()
                                .token(token)
                                .email(user.getEmail())
                                .role(user.getRole())
                                .message("Login successful")
                                .build();
        }
}
