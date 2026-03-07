package com.swaply.productservice.mapper;

import com.swaply.productservice.dto.ProductDto;
import com.swaply.productservice.dto.create.CreateProductRequest;
import com.swaply.productservice.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL,
        componentModel = "spring"
)
public interface ProductMapper {
    ProductDto toDto(Product product);

    Product toEntity(ProductDto productDto);

    Product toEntity(CreateProductRequest createProductRequest);

}
