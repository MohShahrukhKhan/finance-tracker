package com.finance.repository;

import com.finance.entity.Transaction;
import com.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long>,
                                               JpaSpecificationExecutor<Transaction> {
    Optional<Transaction> findByUuidAndUser(String uuid, User user);
}
