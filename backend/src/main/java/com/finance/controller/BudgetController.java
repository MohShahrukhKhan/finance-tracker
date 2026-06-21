package com.finance.controller;

import com.finance.dto.BudgetResponse;
import com.finance.dto.CreateBudgetRequest;
import com.finance.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> get(
        @RequestParam LocalDate month,
        Principal principal
    ) {
        return ResponseEntity.ok(budgetService.getBudgets(principal.getName(), month));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(
        @Valid @RequestBody CreateBudgetRequest request,
        Principal principal
    ) {
        return ResponseEntity.ok(budgetService.create(request, principal.getName()));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<BudgetResponse> update(
        @PathVariable String uuid,
        @Valid @RequestBody CreateBudgetRequest request,
        Principal principal
    ) {
        return ResponseEntity.ok(budgetService.update(uuid, request, principal.getName()));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> delete(@PathVariable String uuid, Principal principal) {
        budgetService.delete(uuid, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
