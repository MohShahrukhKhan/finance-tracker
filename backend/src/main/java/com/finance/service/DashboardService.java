package com.finance.service;

import com.finance.dto.CategoryBreakdown;
import com.finance.dto.DashboardSummary;
import com.finance.dto.MonthlyTrend;
import com.finance.entity.User;
import com.finance.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private final EntityManager em;
    private final UserRepository userRepository;

    public DashboardService(EntityManager em, UserRepository userRepository) {
        this.em = em;
        this.userRepository = userRepository;
    }

    public DashboardSummary getSummary(String email, LocalDate from, LocalDate to) {
        String sql = """
            SELECT
                COALESCE(SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = :userId
              AND t.transaction_date BETWEEN :from AND :to
              AND t.deleted = false
            """;

        Tuple result = (Tuple) em.createNativeQuery(sql, Tuple.class)
            .setParameter("userId", getUserId(email))
            .setParameter("from", from)
            .setParameter("to", to)
            .getSingleResult();

        return new DashboardSummary(
            toBigDecimal(result.get("income")),
            toBigDecimal(result.get("expense")),
            toBigDecimal(result.get("income")).subtract(toBigDecimal(result.get("expense")))
        );
    }

    public List<MonthlyTrend> getMonthlyTrend(String email, int year) {
        String sql = """
            SELECT
                TO_CHAR(t.transaction_date, 'Mon') AS month,
                EXTRACT(MONTH FROM t.transaction_date) AS month_num,
                COALESCE(SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = :userId
              AND EXTRACT(YEAR FROM t.transaction_date) = :year
              AND t.deleted = false
            GROUP BY month, month_num
            ORDER BY month_num
            """;

        @SuppressWarnings("unchecked")
        List<Tuple> rows = em.createNativeQuery(sql, Tuple.class)
            .setParameter("userId", getUserId(email))
            .setParameter("year", year)
            .getResultList();

        return rows.stream()
            .map(r -> new MonthlyTrend(
                r.get("month", String.class),
                toBigDecimal(r.get("income")),
                toBigDecimal(r.get("expense"))
            ))
            .toList();
    }

    public List<CategoryBreakdown> getCategoryBreakdown(String email, LocalDate from, LocalDate to) {
        String sql = """
            SELECT
                c.name AS category,
                SUM(t.amount) AS amount
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = :userId
              AND t.transaction_date BETWEEN :from AND :to
              AND c.type = 'EXPENSE'
              AND t.deleted = false
            GROUP BY c.name
            ORDER BY amount DESC
            """;

        @SuppressWarnings("unchecked")
        List<Tuple> rows = em.createNativeQuery(sql, Tuple.class)
            .setParameter("userId", getUserId(email))
            .setParameter("from", from)
            .setParameter("to", to)
            .getResultList();

        return rows.stream()
            .map(r -> new CategoryBreakdown(
                r.get("category", String.class),
                toBigDecimal(r.get("amount"))
            ))
            .toList();
    }

    private Long getUserId(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow().getId();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }
}
