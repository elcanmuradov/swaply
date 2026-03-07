package com.swaply.productservice.service;

import com.swaply.productservice.dto.ProductDto;
import com.swaply.productservice.dto.create.CreateProductRequest;
import com.swaply.productservice.dto.create.CreateProductResponse;
import com.swaply.productservice.entity.Product;
import com.swaply.productservice.mapper.ProductMapper;
import com.swaply.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;


    public CreateProductResponse createProduct(CreateProductRequest createProductRequest) {
        Product product = productMapper.toEntity(createProductRequest);
        product.setUserId(createProductRequest.getUserId());
        product = productRepository.save(product);

        return CreateProductResponse.builder()
                .id(product.getId())
                .userId(product.getUserId())
                .title(product.getTitle())
                .description(product.getTitle())
                .price(product.getPrice())
                .isNew(product.getIsNew())
                .category(product.getCategory())
                .isDelivery(product.getIsDelivery())
                .createdAt(product.getCreatedAt())
                .viewers(product.getViewers())
                .city(product.getCity())
                .status(product.getStatus())
                .images(product.getImages())
                .build();
    }

    public List<ProductDto> findAll() {
        List<ProductDto> products = new ArrayList<>();
        List<Product> productList = productRepository.findAll();
        if (productList.isEmpty()) {
            log.error("No products found");
            return products;
        }
        productList.forEach(product -> products.add(productMapper.toDto(product)));

        return products;
    }
}
