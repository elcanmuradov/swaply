package com.swaply.productservice.controller;

import com.swaply.productservice.dto.ApiResponse;
import com.swaply.productservice.dto.ProductDto;
import com.swaply.productservice.dto.create.CreateProductRequest;
import com.swaply.productservice.dto.create.CreateProductResponse;
import com.swaply.productservice.service.ProductService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping("/")
    public ResponseEntity<ApiResponse<List<ProductDto>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(productService.findAll()));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CreateProductResponse>> create(@RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.createProduct(request)));
    }
}
