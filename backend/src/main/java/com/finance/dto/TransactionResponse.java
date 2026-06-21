package com.finance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
    String uuid,
    String categoryId,
    String categoryName,
    String categoryIcon,
    String type,
    BigDecimal amount,
    String note,
    LocalDate transactionDate
) {}
