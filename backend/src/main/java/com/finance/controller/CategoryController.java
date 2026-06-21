package com.finance.controller;

import com.finance.dto.CategoryResponse;
import com.finance.dto.CreateCategoryRequest;
import com.finance.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(Principal principal) {
        return ResponseEntity.ok(categoryService.getAll(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
        @Valid @RequestBody CreateCategoryRequest request,
        Principal principal
    ) {
        return ResponseEntity.ok(categoryService.create(request, principal.getName()));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<CategoryResponse> update(
        @PathVariable String uuid,
        @Valid @RequestBody CreateCategoryRequest request,
        Principal principal
    ) {
        return ResponseEntity.ok(categoryService.update(uuid, request, principal.getName()));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> delete(@PathVariable String uuid, Principal principal) {
        categoryService.delete(uuid, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
