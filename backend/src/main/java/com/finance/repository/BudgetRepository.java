package com.finance.repository;

import com.finance.entity.Budget;
import com.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserAndMonth(User user, LocalDate month);
    Optional<Budget> findByUuidAndUser(String uuid, User user);
    Optional<Budget> findByUserAndCategoryIdAndMonth(User user, Long categoryId, LocalDate month);
}
