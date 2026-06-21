package com.finance.repository;

import com.finance.entity.Category;
import com.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserOrderByName(User user);
    Optional<Category> findByUuidAndUser(String uuid, User user);
    boolean existsByUserAndName(User user, String name);
    void deleteByUuidAndUser(String uuid, User user);
}
