package com.finance.service;

import com.finance.dto.BudgetResponse;
import com.finance.dto.CreateBudgetRequest;
import com.finance.entity.Budget;
import com.finance.entity.Category;
import com.finance.entity.User;
import com.finance.exception.DuplicateResourceException;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.BudgetRepository;
import com.finance.repository.CategoryRepository;
import com.finance.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;

    private BudgetService budgetService;
    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        budgetService = new BudgetService(budgetRepository, categoryRepository, userRepository);
        user = new User();
        user.setEmail("test@test.com");

        category = new Category();
        category.setName("Food");
        category.setType("EXPENSE");
    }

    @Test
    void getBudgets_returnsBudgetsWithPercentage() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        var budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonth(LocalDate.of(2026, 6, 1));
        budget.setLimitAmount(BigDecimal.valueOf(10000));

        when(budgetRepository.findByUserAndMonth(user, LocalDate.of(2026, 6, 1)))
            .thenReturn(List.of(budget));
        when(budgetRepository.calculateSpent(any(), any(), any(), any()))
            .thenReturn(BigDecimal.valueOf(2500));

        List<BudgetResponse> result = budgetService.getBudgets("test@test.com", LocalDate.of(2026, 6, 1));

        assertEquals(1, result.size());
        assertEquals(25, result.get(0).percentage());
        assertEquals(BigDecimal.valueOf(10000), result.get(0).limitAmount());
    }

    @Test
    void create_savesAndReturnsBudget() {
        var request = new CreateBudgetRequest("cat-uuid", LocalDate.of(2026, 6, 15), BigDecimal.valueOf(8000));
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUuidAndUser("cat-uuid", user)).thenReturn(Optional.of(category));
        when(budgetRepository.findByUserAndCategoryIdAndMonth(user, null, LocalDate.of(2026, 6, 1)))
            .thenReturn(Optional.empty());
        when(budgetRepository.calculateSpent(any(), any(), any(), any()))
            .thenReturn(BigDecimal.ZERO);

        BudgetResponse result = budgetService.create(request, "test@test.com");

        assertEquals(0, result.percentage());
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void create_duplicate_throws() {
        var request = new CreateBudgetRequest("cat-uuid", LocalDate.of(2026, 6, 15), BigDecimal.valueOf(8000));
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUuidAndUser("cat-uuid", user)).thenReturn(Optional.of(category));
        when(budgetRepository.findByUserAndCategoryIdAndMonth(user, null, LocalDate.of(2026, 6, 1)))
            .thenReturn(Optional.of(new Budget()));

        assertThrows(DuplicateResourceException.class, () -> budgetService.create(request, "test@test.com"));
    }

    @Test
    void update_changesLimit() {
        var request = new CreateBudgetRequest("cat-uuid", LocalDate.of(2026, 6, 1), BigDecimal.valueOf(15000));

        var budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonth(LocalDate.of(2026, 6, 1));
        budget.setLimitAmount(BigDecimal.valueOf(10000));

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(budgetRepository.findByUuidAndUser("bud-uuid", user)).thenReturn(Optional.of(budget));
        when(budgetRepository.calculateSpent(any(), any(), any(), any()))
            .thenReturn(BigDecimal.valueOf(5000));

        BudgetResponse result = budgetService.update("bud-uuid", request, "test@test.com");

        assertEquals(33, result.percentage());
        assertEquals(BigDecimal.valueOf(15000), result.limitAmount());
    }

    @Test
    void delete_removesBudget() {
        var budget = new Budget();
        budget.setUser(user);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(budgetRepository.findByUuidAndUser("bud-uuid", user)).thenReturn(Optional.of(budget));

        budgetService.delete("bud-uuid", "test@test.com");

        verify(budgetRepository).delete(budget);
    }

    @Test
    void delete_notFound_throws() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(budgetRepository.findByUuidAndUser("bud-uuid", user)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> budgetService.delete("bud-uuid", "test@test.com"));
    }
}
