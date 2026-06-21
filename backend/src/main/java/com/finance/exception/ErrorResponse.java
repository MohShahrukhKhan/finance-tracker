package com.finance.exception;

import java.time.LocalDateTime;

public record ErrorResponse(
    boolean success,
    String message,
    LocalDateTime timestamp
) {
    public ErrorResponse(String message) {
        this(false, message, LocalDateTime.now());
    }
}
