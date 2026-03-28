package com.swaply.productservice.repository.jpa;

import com.swaply.productservice.entity.Product;
import com.swaply.productservice.utils.enums.ProductCategory;
import com.swaply.productservice.utils.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    @EntityGraph(attributePaths = {"images"})
    Optional<Product> getProductById(UUID productId);

    @EntityGraph(attributePaths = {"images"})
    Page<Product> getProductsByStatusAndUserId(ProductStatus status, UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"images"})
    Page<Product> getProductsByStatus(ProductStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"images"})
    Page<Product> getProductByUserId(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"images"})
    Page<Product> getProductsByCategory(ProductCategory category, Pageable pageable);

    @EntityGraph(attributePaths = {"images"})
    List<Product> findByStatusAndTitleContainingIgnoreCase(ProductStatus status, String title);
}
