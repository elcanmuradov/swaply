package com.swaply.productservice.dto.create;

import com.swaply.productservice.utils.enums.City;
import com.swaply.productservice.utils.enums.ProductCategory;
import com.swaply.productservice.utils.enums.ProductStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Builder
@Data
public class CreateProductRequest {

    @NotBlank(message = "Başlık gerekli")
    private String title;

    private UUID userId;

    private String description;

    @NotNull(message = "Fiyat gerekli")
    @DecimalMin(value = "0.01", message = "Fiyat 0'dan büyük olmalı")
    private BigDecimal price;

    private Boolean isNew = false;

    @NotNull(message = "Kategori gerekli")
    private ProductCategory category;

    private Boolean isDelivery = false;

    @NotNull(message = "Şehir gerekli")
    private City city;

    @NotEmpty(message = "En az bir resim eklenmeli")
    private List<String> imageUrls = new ArrayList<>();
}