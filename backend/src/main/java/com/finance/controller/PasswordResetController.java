package com.finance.controller;

import com.finance.dto.ForgotPasswordRequest;
import com.finance.dto.PasswordResetResponse;
import com.finance.dto.ResetPasswordRequest;
import com.finance.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/password")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot")
    public ResponseEntity<PasswordResetResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.sendResetToken(request.email());
        return ResponseEntity.ok(new PasswordResetResponse("If the email exists, a reset link has been sent"));
    }

    @PostMapping("/reset")
    public ResponseEntity<PasswordResetResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(new PasswordResetResponse("Password has been reset successfully"));
    }
}
