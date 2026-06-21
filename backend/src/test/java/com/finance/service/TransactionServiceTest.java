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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;

    private TransactionService transactionService;
    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        transactionService = new TransactionService(transactionRepository, categoryRepository, userRepository);
        user = new User();
        user.setEmail("test@test.com");

        category = new Category();
        category.setName("Food");
        category.setType("EXPENSE");
        category.setIcon("F");
    }

    @Test
    void search_returnsPagedResults() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        var txn = new Transaction();
        txn.setUser(user);
        txn.setCategory(category);
        txn.setAmount(BigDecimal.valueOf(100));
        txn.setNote("Test");
        txn.setTransactionDate(LocalDate.of(2026, 6, 1));

        Page<Transaction> page = new PageImpl<>(List.of(txn));
        when(transactionRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PagedResponse<TransactionResponse> result = transactionService.search(
            "test@test.com", 0, 10, null, null, null, null, null, null, null, null);

        assertEquals(1, result.totalElements());
        assertEquals("Test", result.content().get(0).note());
    }

    @Test
    void create_savesAndReturnsTransaction() {
        var request = new CreateTransactionRequest(
            "cat-uuid", BigDecimal.valueOf(500), "Lunch", LocalDate.of(2026, 6, 2));
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUuidAndUser("cat-uuid", user)).thenReturn(Optional.of(category));

        TransactionResponse result = transactionService.create(request, "test@test.com");

        assertEquals("Lunch", result.note());
        assertEquals(0, BigDecimal.valueOf(500).compareTo(result.amount()));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void create_categoryNotFound_throws() {
        var request = new CreateTransactionRequest(
            "bad-uuid", BigDecimal.valueOf(500), "Lunch", LocalDate.of(2026, 6, 2));
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUuidAndUser("bad-uuid", user)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> transactionService.create(request, "test@test.com"));
    }

    @Test
    void update_modifiesTransaction() {
        var request = new CreateTransactionRequest(
            "cat-uuid", BigDecimal.valueOf(999), "Updated", LocalDate.of(2026, 6, 5));

        var existing = new Transaction();
        existing.setUser(user);
        existing.setCategory(category);
        existing.setAmount(BigDecimal.valueOf(100));
        existing.setNote("Old");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(transactionRepository.findByUuidAndUser("txn-uuid", user)).thenReturn(Optional.of(existing));
        when(categoryRepository.findByUuidAndUser("cat-uuid", user)).thenReturn(Optional.of(category));

        TransactionResponse result = transactionService.update("txn-uuid", request, "test@test.com");

        assertEquals("Updated", result.note());
        assertEquals(0, BigDecimal.valueOf(999).compareTo(result.amount()));
        verify(transactionRepository).save(existing);
    }

    @Test
    void delete_softDeletesTransaction() {
        var txn = new Transaction();
        txn.setUser(user);
        txn.setDeleted(false);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(transactionRepository.findByUuidAndUser("txn-uuid", user)).thenReturn(Optional.of(txn));

        transactionService.delete("txn-uuid", "test@test.com");

        assertTrue(txn.isDeleted());
        verify(transactionRepository).save(txn);
    }
}
