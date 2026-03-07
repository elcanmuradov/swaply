package com.swaply.productservice.dto;

import com.swaply.productservice.utils.enums.City;
import com.swaply.productservice.utils.enums.ProductCategory;
import com.swaply.productservice.utils.enums.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProductDto {
    private UUID id;

    private UUID userId;

    private String title;

    private String description;

    private Double price;

    private boolean isNew;

    private ProductCategory category;

    private boolean isDelivery;

    private Date createdAt;

    private Date updatedAt;

    private boolean isUpdated;

    private Long viewers;

    private City city;

    private ProductStatus status;

    private List<String> imageUrls;

}
