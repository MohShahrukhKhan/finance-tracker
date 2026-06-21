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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         CategoryRepository categoryRepository,
                         UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(String email, LocalDate month) {
        User user = getUser(email);
        LocalDate firstDay = month.withDayOfMonth(1);
        List<Budget> budgets = budgetRepository.findByUserAndMonth(user, firstDay);
        return budgets.stream().map(b -> toResponse(b, email)).toList();
    }

    public BudgetResponse create(CreateBudgetRequest request, String email) {
        User user = getUser(email);
        Category category = categoryRepository.findByUuidAndUser(request.categoryId(), user)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        LocalDate firstDay = request.month().withDayOfMonth(1);
        if (budgetRepository.findByUserAndCategoryIdAndMonth(user, category.getId(), firstDay).isPresent()) {
            throw new DuplicateResourceException("Budget already exists for this category and month");
        }

        var budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonth(firstDay);
        budget.setLimitAmount(request.limitAmount());
        budgetRepository.save(budget);

        return toResponse(budget, email);
    }

    public BudgetResponse update(String uuid, CreateBudgetRequest request, String email) {
        User user = getUser(email);
        Budget budget = budgetRepository.findByUuidAndUser(uuid, user)
            .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budget.setLimitAmount(request.limitAmount());
        budgetRepository.save(budget);
        return toResponse(budget, email);
    }

    public void delete(String uuid, String email) {
        User user = getUser(email);
        Budget budget = budgetRepository.findByUuidAndUser(uuid, user)
            .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private BudgetResponse toResponse(Budget budget, String email) {
        User user = getUser(email);
        BigDecimal spent = budgetRepository.calculateSpent(
            user.getId(), budget.getCategory().getId(),
            budget.getMonth(), budget.getMonth().plusMonths(1));
        int percentage = budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
            ? spent.multiply(BigDecimal.valueOf(100))
                .divide(budget.getLimitAmount(), 0, java.math.RoundingMode.HALF_UP)
                .intValue()
            : 0;

        return new BudgetResponse(
            budget.getUuid(),
            budget.getCategory().getUuid(),
            budget.getCategory().getName(),
            budget.getLimitAmount(),
            spent,
            Math.min(percentage, 100)
        );
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
