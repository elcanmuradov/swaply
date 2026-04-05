package com.swaply.productservice.entity;

import com.swaply.productservice.utils.enums.City;
import com.swaply.productservice.utils.enums.ProductCategory;
import com.swaply.productservice.utils.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity(name = "Product")
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @Column(name = "is_new")
    private Boolean isNew = false;

    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    private ProductCategory category;

    @Builder.Default
    @Column(name = "is_delivery")
    private Boolean isDelivery = false;

    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    private City city;

    @Builder.Default
    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.ACTIVE;

    @Builder.Default
    @Column(name = "deleted_at", nullable = true)
    private LocalDateTime deletedAt = null;

    @Builder.Default
    @Column()
    private Long viewers = 0L;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper Method: Resim eklemek için
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    // Helper Method: Resim silmek için
    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }
}