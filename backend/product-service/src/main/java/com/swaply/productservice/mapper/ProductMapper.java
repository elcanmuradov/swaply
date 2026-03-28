package com.swaply.productservice.mapper;

import com.swaply.productservice.dto.ProductDto;
import com.swaply.productservice.dto.UpdateProductRequest;
import com.swaply.productservice.dto.create.CreateProductRequest;
import com.swaply.productservice.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL,
        componentModel = "spring"
)
public interface ProductMapper {
    @Mapping(target = "isUpdated", ignore = true)
    @Mapping(target = "imageUrls", expression = "java(mapImages(product))")
    ProductDto toDto(Product product);

    default List<String> mapImages(Product product) {
        if (product.getImages() == null) return null;
        return product.getImages().stream()
                .map(img -> img.getImageUrl())
                .collect(Collectors.toList());
    }

    @Mapping(target = "isNew", ignore = true)
    @Mapping(target = "isDelivery", ignore = true)
    @Mapping(target = "images", ignore = true)
    Product toEntity(ProductDto productDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "viewers", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Product toEntity(CreateProductRequest createProductRequest);



}
