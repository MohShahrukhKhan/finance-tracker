package com.finance.service;

import com.finance.AbstractIntegrationTest;
import com.finance.dto.AuthResponse;
import com.finance.dto.LoginRequest;
import com.finance.dto.RegisterRequest;
import com.finance.exception.DuplicateResourceException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthServiceIT extends AbstractIntegrationTest {

    @Autowired
    private AuthService authService;

    @Test
    void registerAndLogin() {
        var register = new RegisterRequest("Test User", "test@example.com", "password123");
        AuthResponse regResp = authService.register(register);
        assertNotNull(regResp.accessToken());

        var login = new LoginRequest("test@example.com", "password123");
        AuthResponse logResp = authService.login(login);
        assertNotNull(logResp.accessToken());
    }

    @Test
    void duplicateEmail_throws() {
        var register = new RegisterRequest("Test User", "dup@example.com", "password123");
        authService.register(register);

        assertThrows(DuplicateResourceException.class,
            () -> authService.register(register));
    }

    @Test
    void wrongPassword_throws() {
        var register = new RegisterRequest("Test User", "wrong@example.com", "password123");
        authService.register(register);

        assertThrows(BadCredentialsException.class,
            () -> authService.login(new LoginRequest("wrong@example.com", "wrongpass")));
    }

    @Test
    void nonExistentEmail_throws() {
        assertThrows(BadCredentialsException.class,
            () -> authService.login(new LoginRequest("nobody@example.com", "password123")));
    }
}
