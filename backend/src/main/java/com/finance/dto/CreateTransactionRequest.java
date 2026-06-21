package com.finance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTransactionRequest(
    @NotNull String categoryId,
    @Positive BigDecimal amount,
    String note,
    @NotNull LocalDate transactionDate
) {}
