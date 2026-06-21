package com.finance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBudgetRequest(
    @NotNull String categoryId,
    @NotNull LocalDate month,
    @Positive BigDecimal limitAmount
) {}
