package com.finance.controller;

import com.finance.dto.CreateTransactionRequest;
import com.finance.dto.PagedResponse;
import com.finance.dto.TransactionResponse;
import com.finance.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TransactionResponse>> search(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) LocalDate fromDate,
        @RequestParam(required = false) LocalDate toDate,
        @RequestParam(required = false) String categoryId,
        @RequestParam(required = false) BigDecimal minAmount,
        @RequestParam(required = false) BigDecimal maxAmount,
        @RequestParam(defaultValue = "transactionDate") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDirection,
        Principal principal
    ) {
        return ResponseEntity.ok(transactionService.search(
            principal.getName(), page, size, fromDate, toDate,
            categoryId, minAmount, maxAmount, sortBy, sortDirection
        ));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
        @Valid @RequestBody CreateTransactionRequest request,
        Principal principal
    ) {
        return ResponseEntity.ok(transactionService.create(request, principal.getName()));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<TransactionResponse> update(
        @PathVariable String uuid,
        @Valid @RequestBody CreateTransactionRequest request,
        Principal principal
    ) {
        return ResponseEntity.ok(transactionService.update(uuid, request, principal.getName()));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> delete(@PathVariable String uuid, Principal principal) {
        transactionService.delete(uuid, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
