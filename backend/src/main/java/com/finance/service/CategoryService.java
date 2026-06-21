package com.finance.service;

import com.finance.dto.CategoryResponse;
import com.finance.dto.CreateCategoryRequest;
import com.finance.entity.Category;
import com.finance.entity.User;
import com.finance.exception.DuplicateResourceException;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.CategoryRepository;
import com.finance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryResponse> getAll(String email) {
        User user = getUser(email);
        return categoryRepository.findByUserOrderByName(user).stream()
            .map(this::toResponse)
            .toList();
    }

    public CategoryResponse create(CreateCategoryRequest request, String email) {
        User user = getUser(email);
        if (categoryRepository.existsByUserAndName(user, request.name())) {
            throw new DuplicateResourceException("Category already exists");
        }
        if (!request.type().equals("INCOME") && !request.type().equals("EXPENSE")) {
            throw new IllegalArgumentException("Type must be INCOME or EXPENSE");
        }

        var category = new Category();
        category.setUser(user);
        category.setName(request.name());
        category.setType(request.type());
        category.setIcon(request.icon());
        categoryRepository.save(category);

        return toResponse(category);
    }

    public CategoryResponse update(String uuid, CreateCategoryRequest request, String email) {
        User user = getUser(email);
        Category category = categoryRepository.findByUuidAndUser(uuid, user)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(request.name());
        if (request.icon() != null) category.setIcon(request.icon());
        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public void delete(String uuid, String email) {
        User user = getUser(email);
        Category category = categoryRepository.findByUuidAndUser(uuid, user)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getUuid(), c.getName(), c.getType(), c.getIcon());
    }
}
