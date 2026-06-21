package com.finance.controller;

import com.finance.dto.CategoryBreakdown;
import com.finance.dto.DashboardSummary;
import com.finance.dto.MonthlyTrend;
import com.finance.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> summary(
        @RequestParam LocalDate from,
        @RequestParam LocalDate to,
        Principal principal
    ) {
        return ResponseEntity.ok(dashboardService.getSummary(principal.getName(), from, to));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyTrend>> monthly(
        @RequestParam int year,
        Principal principal
    ) {
        return ResponseEntity.ok(dashboardService.getMonthlyTrend(principal.getName(), year));
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<List<CategoryBreakdown>> breakdown(
        @RequestParam LocalDate from,
        @RequestParam LocalDate to,
        Principal principal
    ) {
        return ResponseEntity.ok(dashboardService.getCategoryBreakdown(principal.getName(), from, to));
    }
}
