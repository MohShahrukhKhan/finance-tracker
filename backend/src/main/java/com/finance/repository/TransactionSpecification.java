package com.finance.repository;

import com.finance.entity.Transaction;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionSpecification {

    public static Specification<Transaction> byUser(String userEmail) {
        return (root, query, cb) ->
            cb.equal(root.get("user").get("email"), userEmail);
    }

    public static Specification<Transaction> byCategoryId(Long categoryId) {
        return (root, query, cb) ->
            cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Transaction> byDateRange(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from != null && to != null)
                return cb.between(root.get("transactionDate"), from, to);
            if (from != null)
                return cb.greaterThanOrEqualTo(root.get("transactionDate"), from);
            if (to != null)
                return cb.lessThanOrEqualTo(root.get("transactionDate"), to);
            return cb.conjunction();
        };
    }

    public static Specification<Transaction> byAmountRange(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min != null && max != null)
                return cb.between(root.get("amount"), min, max);
            if (min != null)
                return cb.greaterThanOrEqualTo(root.get("amount"), min);
            if (max != null)
                return cb.lessThanOrEqualTo(root.get("amount"), max);
            return cb.conjunction();
        };
    }

    public static Specification<Transaction> byNote(String note) {
        return (root, query, cb) ->
            cb.like(cb.lower(root.get("note")), "%" + note.toLowerCase() + "%");
    }

    public static Specification<Transaction> notDeleted() {
        return (root, query, cb) -> cb.isFalse(root.get("deleted"));
    }
}
