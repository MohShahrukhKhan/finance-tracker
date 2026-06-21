package com.finance.service;

import com.finance.AbstractIntegrationTest;
import com.finance.dto.CategoryResponse;
import com.finance.dto.CreateCategoryRequest;
import com.finance.dto.RegisterRequest;
import com.finance.exception.DuplicateResourceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CategoryServiceIT extends AbstractIntegrationTest {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AuthService authService;

    private String email;

    @BeforeEach
    void setUp() {
        email = "cat-test-" + System.nanoTime() + "@example.com";
        authService.register(new RegisterRequest("Category Test", email, "password123"));
    }

    @Test
    void createAndFind() {
        var request = new CreateCategoryRequest("Groceries", "EXPENSE", "shopping-cart");
        CategoryResponse created = categoryService.create(request, email);
        assertNotNull(created.uuid());
        assertEquals("Groceries", created.name());

        var categories = categoryService.getAll(email);
        assertTrue(categories.stream().anyMatch(c -> c.name().equals("Groceries")));
    }

    @Test
    void duplicateName_throws() {
        var request = new CreateCategoryRequest("Entertainment", "EXPENSE", "tv");
        categoryService.create(request, email);

        assertThrows(DuplicateResourceException.class,
            () -> categoryService.create(request, email));
    }

    @Test
    void update() {
        var request = new CreateCategoryRequest("Food", "EXPENSE", "utensils");
        CategoryResponse created = categoryService.create(request, email);

        var update = new CreateCategoryRequest("Fine Dining", "EXPENSE", "utensils");
        CategoryResponse updated = categoryService.update(created.uuid(), update, email);
        assertEquals("Fine Dining", updated.name());
    }

    @Test
    void delete() {
        var request = new CreateCategoryRequest("Temp", "EXPENSE", "x");
        CategoryResponse created = categoryService.create(request, email);

        categoryService.delete(created.uuid(), email);

        var categories = categoryService.getAll(email);
        assertTrue(categories.stream().noneMatch(c -> c.uuid().equals(created.uuid())));
    }
}
