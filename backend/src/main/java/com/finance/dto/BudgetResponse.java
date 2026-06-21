package com.finance.dto;

import java.math.BigDecimal;

public record BudgetResponse(
    String uuid,
    String categoryId,
    String categoryName,
    BigDecimal limitAmount,
    BigDecimal spent,
    int percentage
) {}
