package com.finance.dto;

import java.math.BigDecimal;

public record DashboardSummary(
    BigDecimal income, BigDecimal expense, BigDecimal balance
) {}
