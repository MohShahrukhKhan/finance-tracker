package com.finance.service;

import com.finance.config.TokenService;
import com.finance.dto.AuthResponse;
import com.finance.dto.LoginRequest;
import com.finance.dto.RegisterRequest;
import com.finance.entity.User;
import com.finance.exception.DuplicateResourceException;
import com.finance.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TokenService tokenService;
    @Mock
    private AuthenticationManager authenticationManager;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, tokenService, authenticationManager);
    }

    @Test
    void register_createsUserAndReturnsToken() {
        var request = new RegisterRequest("Test User", "test@test.com", "password123");
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(tokenService.generateToken("test@test.com")).thenReturn("token123");

        AuthResponse response = authService.register(request);

        assertEquals("token123", response.accessToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throws() {
        var request = new RegisterRequest("Test User", "test@test.com", "password123");
        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_validCredentials_returnsToken() {
        var request = new LoginRequest("test@test.com", "password123");
        when(tokenService.generateToken("test@test.com")).thenReturn("token123");

        AuthResponse response = authService.login(request);

        assertEquals("token123", response.accessToken());
        verify(authenticationManager).authenticate(
            new UsernamePasswordAuthenticationToken("test@test.com", "password123"));
    }

    @Test
    void login_invalidCredentials_throws() {
        var request = new LoginRequest("test@test.com", "wrong");
        doThrow(new BadCredentialsException("bad credentials"))
            .when(authenticationManager).authenticate(any());

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
