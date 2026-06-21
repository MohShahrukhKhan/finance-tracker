package com.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 10) String type,
    @Size(max = 50) String icon
) {}
