package com.finance.service;

import com.finance.dto.CreateTransactionRequest;
import com.finance.dto.PagedResponse;
import com.finance.dto.TransactionResponse;
import com.finance.entity.Category;
import com.finance.entity.Transaction;
import com.finance.entity.User;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.CategoryRepository;
import com.finance.repository.TransactionRepository;
import com.finance.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static com.finance.repository.TransactionSpecification.*;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              CategoryRepository categoryRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> search(
        String email, int page, int size,
        LocalDate fromDate, LocalDate toDate,
        String categoryId, BigDecimal minAmount, BigDecimal maxAmount,
        String sortBy, String sortDirection
    ) {
        User user = getUser(email);

        Specification<Transaction> spec = Specification.where(byUser(email)).and(notDeleted());

        if (categoryId != null) {
            Category cat = categoryRepository.findByUuidAndUser(categoryId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            spec = spec.and(byCategoryId(cat.getId()));
        }
        if (fromDate != null || toDate != null) {
            spec = spec.and(byDateRange(fromDate, toDate));
        }
        if (minAmount != null || maxAmount != null) {
            spec = spec.and(byAmountRange(minAmount, maxAmount));
        }

        Sort sort = Sort.by(
            sortDirection != null && sortDirection.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC,
            sortBy != null ? sortBy : "transactionDate"
        );

        Page<Transaction> result = transactionRepository.findAll(
            spec, PageRequest.of(page, size, sort));

        return new PagedResponse<>(
            result.getContent().stream().map(this::toResponse).toList(),
            result.getNumber(), result.getSize(),
            result.getTotalElements(), result.getTotalPages()
        );
    }

    public TransactionResponse create(CreateTransactionRequest request, String email) {
        User user = getUser(email);
        Category category = categoryRepository.findByUuidAndUser(request.categoryId(), user)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        var txn = new Transaction();
        txn.setUser(user);
        txn.setCategory(category);
        txn.setAmount(request.amount());
        txn.setNote(request.note());
        txn.setTransactionDate(request.transactionDate());
        transactionRepository.save(txn);

        return toResponse(txn);
    }

    public TransactionResponse update(String uuid, CreateTransactionRequest request, String email) {
        User user = getUser(email);
        Transaction txn = transactionRepository.findByUuidAndUser(uuid, user)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        Category category = categoryRepository.findByUuidAndUser(request.categoryId(), user)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        txn.setCategory(category);
        txn.setAmount(request.amount());
        txn.setNote(request.note());
        txn.setTransactionDate(request.transactionDate());
        transactionRepository.save(txn);

        return toResponse(txn);
    }

    public void delete(String uuid, String email) {
        User user = getUser(email);
        Transaction txn = transactionRepository.findByUuidAndUser(uuid, user)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        txn.setDeleted(true);
        transactionRepository.save(txn);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
            t.getUuid(),
            t.getCategory().getUuid(),
            t.getCategory().getName(),
            t.getCategory().getIcon(),
            t.getCategory().getType(),
            t.getAmount(),
            t.getNote(),
            t.getTransactionDate()
        );
    }
}
