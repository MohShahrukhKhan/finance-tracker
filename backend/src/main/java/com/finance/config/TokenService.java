package com.finance.config;

public interface TokenService {
    String generateToken(String email);
    String extractEmail(String token);
    boolean validateToken(String token);
}
