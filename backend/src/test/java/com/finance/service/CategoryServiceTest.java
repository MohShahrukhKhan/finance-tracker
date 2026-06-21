package com.finance.service;

import com.finance.dto.CategoryResponse;
import com.finance.dto.CreateCategoryRequest;
import com.finance.entity.Category;
import com.finance.entity.User;
import com.finance.exception.DuplicateResourceException;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.CategoryRepository;
import com.finance.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;

    private CategoryService categoryService;
    private User user;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryService(categoryRepository, userRepository);
        user = new User();
        user.setEmail("test@test.com");
    }

    @Test
    void getAll_returnsUserCategories() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        var cat = new Category();
        cat.setUser(user);
        cat.setName("Salary");
        cat.setType("INCOME");
        cat.setIcon("$");
        when(categoryRepository.findByUserOrderByName(user)).thenReturn(List.of(cat));

        List<CategoryResponse> result = categoryService.getAll("test@test.com");

        assertEquals(1, result.size());
        assertEquals("Salary", result.get(0).name());
    }

    @Test
    void create_savesAndReturnsCategory() {
        var request = new CreateCategoryRequest("Food", "EXPENSE", "F");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.existsByUserAndName(user, "Food")).thenReturn(false);

        CategoryResponse result = categoryService.create(request, "test@test.com");

        assertEquals("Food", result.name());
        assertEquals("EXPENSE", result.type());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void create_duplicateName_throws() {
        var request = new CreateCategoryRequest("Food", "EXPENSE", "F");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.existsByUserAndName(user, "Food")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> categoryService.create(request, "test@test.com"));
    }

    @Test
    void create_invalidType_throws() {
        var request = new CreateCategoryRequest("Foo", "INVALID", "F");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.existsByUserAndName(user, "Foo")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> categoryService.create(request, "test@test.com"));
    }

    @Test
    void update_renamesCategory() {
        var request = new CreateCategoryRequest("Food", "EXPENSE", "F");
        var category = new Category();
        category.setUser(user);
        category.setName("Groceries");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUuidAndUser("uuid-1", user)).thenReturn(Optional.of(category));

        CategoryResponse result = categoryService.update("uuid-1", request, "test@test.com");

        assertEquals("Food", result.name());
        verify(categoryRepository).save(category);
    }

    @Test
    void update_notFound_throws() {
        var request = new CreateCategoryRequest("Food", "EXPENSE", "F");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUuidAndUser("uuid-1", user)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.update("uuid-1", request, "test@test.com"));
    }

    @Test
    void delete_removesCategory() {
        var category = new Category();
        category.setUser(user);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(categoryRepository.findByUuidAndUser("uuid-1", user)).thenReturn(Optional.of(category));

        categoryService.delete("uuid-1", "test@test.com");

        verify(categoryRepository).delete(category);
    }
}
