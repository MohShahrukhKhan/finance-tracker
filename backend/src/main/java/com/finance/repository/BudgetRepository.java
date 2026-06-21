package com.finance.repository;

import com.finance.entity.Budget;
import com.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserAndMonth(User user, LocalDate month);
    Optional<Budget> findByUuidAndUser(String uuid, User user);
    Optional<Budget> findByUserAndCategoryIdAndMonth(User user, Long categoryId, LocalDate month);

    @Query(value = """
        SELECT COALESCE(SUM(t.amount), 0) FROM transactions t
        WHERE t.user_id = :userId
          AND t.category_id = :categoryId
          AND t.transaction_date >= :start
          AND t.transaction_date < :end
          AND t.deleted = false
        """, nativeQuery = true)
    BigDecimal calculateSpent(@Param("userId") Long userId,
                              @Param("categoryId") Long categoryId,
                              @Param("start") LocalDate start,
                              @Param("end") LocalDate end);
}
