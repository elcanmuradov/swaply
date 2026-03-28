package com.swaply.productservice.service;

import com.swaply.productservice.client.MediaClient;
import com.swaply.productservice.client.UserClient;
import com.swaply.productservice.document.ProductDocument;
import com.swaply.productservice.dto.PagedResponse;
import com.swaply.productservice.dto.ProductDto;
import com.swaply.productservice.dto.UpdateProductRequest;
import com.swaply.productservice.dto.create.CreateProductRequest;
import com.swaply.productservice.dto.create.CreateProductResponse;
import com.swaply.productservice.entity.Product;
import com.swaply.productservice.entity.ProductImage;
import com.swaply.productservice.exception.NotFoundException;
import com.swaply.productservice.mapper.ProductMapper;
import com.swaply.productservice.repository.elastic.ElasticProductRepository;
import com.swaply.productservice.repository.jpa.ProductRepository;
import com.swaply.productservice.utils.enums.City;
import com.swaply.productservice.utils.enums.ProductCategory;
import com.swaply.productservice.utils.enums.ProductStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static com.swaply.productservice.utils.messages.Constants.PRODUCT_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final UserClient userClient;
    private final MediaClient mediaClient;
    private final ElasticProductRepository elasticProductRepository;

    @CacheEvict(value = "products", allEntries = true)
    public CreateProductResponse createProduct(CreateProductRequest createProductRequest) {
        Product product = new Product();
        product.setTitle(createProductRequest.getTitle());
        product.setPrice(createProductRequest.getPrice());
        product.setDescription(createProductRequest.getDescription());
        product.setCategory(getProductCategoryById(createProductRequest.getCategoryId()));
        product.setStatus(ProductStatus.ACTIVE);
        product.setUserId(createProductRequest.getUserId());
        product.setCity(getCityById(createProductRequest.getCityId()));
        product.setIsNew(createProductRequest.getIsNew());
        product.setIsDelivery(createProductRequest.getIsDelivery());

        if (createProductRequest.getImages() != null && !createProductRequest.getImages().isEmpty()) {
            AtomicInteger order = new AtomicInteger();
            createProductRequest.getImages().forEach(img -> {
                ProductImage image = new ProductImage();
                image.setImageUrl(img.getImageUrl());
                image.setPublicId(img.getPublicId());
                image.setDisplayOrder(order.getAndIncrement());
                image.setIsMain(order.get() == 1);
                image.setProduct(product);
                product.getImages().add(image);
            });
        }
        productRepository.save(product);
        syncToElastic(product);

        return CreateProductResponse.builder()
                .id(product.getId())
                .userId(product.getUserId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .isNew(product.getIsNew())
                .category(product.getCategory())
                .isDelivery(product.getIsDelivery())
                .createdAt(product.getCreatedAt())
                .viewers(product.getViewers())
                .city(product.getCity())
                .status(product.getStatus())
                .images(new ArrayList<>())
                .build();
    }

    public List<ProductDto> getFavoriteProducts() {
        List<UUID> productsId = userClient.findAllFavorites();
        List<ProductDto> productDtos = new ArrayList<>();
        productsId.forEach(id -> productDtos.add(getProductById(id)));
        return productDtos;
    }

    public ProductDto getProductById(UUID productId) {
        log.info("Get product by id {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(PRODUCT_NOT_FOUND + productId));
        product.setViewers(product.getViewers() + 1);
        product = productRepository.save(product);
        log.info("Product by id {}", product.getId());
        return productMapper.toDto(product);
    }

    public PagedResponse<ProductDto> getProductsByUserId(UUID userId, Pageable pageable) {
        log.info("get user products, page: {}", pageable.getPageNumber());
        Page<Product> page = productRepository.getProductByUserId(userId, pageable);
        return mapToPagedResponse(page);
    }

    @Cacheable(value = "products", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public PagedResponse<ProductDto> getActiveProducts(Pageable pageable) {
        log.info("getting active products, page: {}", pageable.getPageNumber());
        Page<Product> page = productRepository.getProductsByStatus(ProductStatus.ACTIVE, pageable);
        return mapToPagedResponse(page);
    }

    public List<ProductDto> getAll() {
        log.info("getting all products");
        return productRepository.findAll().stream()
                .map(productMapper::toDto).collect(Collectors.toList());
    }

    public PagedResponse<ProductDto> getAllPaged(Pageable pageable) {
        log.info("getting all products paged");
        Page<Product> page = productRepository.findAll(pageable);
        return mapToPagedResponse(page);
    }

    public PagedResponse<ProductDto> getProductsByStatusAndUserId(ProductStatus status, UUID userId, Pageable pageable) {
        log.info("getting products by status {} and user id {}, page: {}", status, userId, pageable.getPageNumber());
        Page<Product> productPage = productRepository.getProductsByStatusAndUserId(status, userId, pageable);
        
        productPage.forEach(product -> {
            if (ChronoUnit.DAYS.between(product.getCreatedAt(), LocalDateTime.now()) >= 30) {
                product.setStatus(ProductStatus.EXPIRED);
                productRepository.save(product);
            }
        });

        return mapToPagedResponse(productPage);
    }

    public PagedResponse<ProductDto> getProductsByCategory(ProductCategory category, Pageable pageable) {
        log.info("getting products by category {}, page: {}", category, pageable.getPageNumber());
        Page<Product> page = productRepository.getProductsByCategory(category, pageable);
        return mapToPagedResponse(page);
    }

    public PagedResponse<ProductDto> getDeletedProductByUserId(UUID userId, Pageable pageable) {
        return getProductsByStatusAndUserId(ProductStatus.DELETED, userId, pageable);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteByID(UUID uuid) {
        log.info("Deleting product with id: " + uuid);
        Product product = productRepository.getProductById(uuid)
                .orElseThrow(() -> new NotFoundException(PRODUCT_NOT_FOUND + uuid));
        product.setStatus(ProductStatus.DELETED);
        product.setDeletedAt(LocalDate.now());
        productRepository.save(product);
        syncToElastic(product);
    }

    private ProductCategory getProductCategoryById(Integer categoryId) {
        if (categoryId == null) throw new IllegalArgumentException("Category ID cannot be null");
        ProductCategory[] categories = ProductCategory.values();
        if (categoryId < 0 || categoryId >= categories.length) throw new IllegalArgumentException("Invalid category ID: " + categoryId);
        return categories[categoryId];
    }

    private City getCityById(Integer cityId) {
        if (cityId == null) throw new IllegalArgumentException("City ID cannot be null");
        City[] cities = City.values();
        if (cityId < 0 || cityId >= cities.length) throw new IllegalArgumentException("Invalid city ID: " + cityId);
        return cities[cityId];
    }

    public Long getProductCount() {
        return productRepository.count();
    }

    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(PRODUCT_NOT_FOUND + productId));
        List<String> publicIds = product.getImages().stream()
                .map(ProductImage::getPublicId)
                .filter(id -> id != null && !id.isEmpty())
                .collect(Collectors.toList());

        if (!publicIds.isEmpty()) mediaClient.deleteImages(publicIds);
        productRepository.deleteById(productId);
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductDto setActive(UUID userId, UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(PRODUCT_NOT_FOUND + productId));
        product.setStatus(ProductStatus.ACTIVE);
        product.setDeletedAt(null);
        productRepository.save(product);
        syncToElastic(product);
        return productMapper.toDto(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductDto updateProduct(UpdateProductRequest request, UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(PRODUCT_NOT_FOUND + productId));

        Optional.ofNullable(request.getIsDelivery()).ifPresent(product::setIsDelivery);
        Optional.ofNullable(getProductCategoryById(request.getCategoryId())).ifPresent(product::setCategory);
        Optional.ofNullable(getCityById(request.getCityId())).ifPresent(product::setCity);
        Optional.ofNullable(request.getDescription()).ifPresent(product::setDescription);
        Optional.ofNullable(request.getPrice()).ifPresent(product::setPrice);
        Optional.ofNullable(request.getTitle()).ifPresent(product::setTitle);
        Optional.ofNullable(request.getIsNew()).ifPresent(product::setIsNew);

        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
        syncToElastic(product);
        return productMapper.toDto(product);
    }

    public List<ProductDto> searchProducts(String query) {
        log.info("Searching products with ElasticSearch, query: {}", query);
        List<ProductDocument> results = elasticProductRepository.searchActiveProducts(query);
        List<ProductDto> products = new ArrayList<>();
        results.forEach(product -> products.add(documentToDto(product)));
        return products;
    }

    public ProductDto documentToDto(ProductDocument doc) {
        return ProductDto.builder()
                .id(doc.getId() != null ? UUID.fromString(doc.getId()) : null)
                .userId(doc.getUserId() != null ? UUID.fromString(doc.getUserId()) : null)
                .title(doc.getTitle())
                .description(doc.getDescription())
                .price(doc.getPrice())
                .isNew(doc.getIsNew() != null ? doc.getIsNew() : false)
                .isDelivery(doc.getIsDelivery() != null ? doc.getIsDelivery() : false)
                .category(doc.getCategory())
                .createdAt(doc.getCreatedAt() != null ? new Date(doc.getCreatedAt()) : null)
                .city(doc.getCity())
                .status(doc.getStatus())
                .imageUrls(doc.getImageUrls())
                .build();
    }

    public void syncToElastic(Product product) {
        try {
            ProductDocument doc = ProductDocument.builder()
                    .id(product.getId().toString())
                    .userId(product.getUserId() != null ? product.getUserId().toString() : null)
                    .title(product.getTitle())
                    .description(product.getDescription())
                    .price(product.getPrice() != null ? product.getPrice().doubleValue() : 0.0)
                    .category(product.getCategory())
                    .city(product.getCity())
                    .status(product.getStatus())
                    .isNew(product.getIsNew())
                    .isDelivery(product.getIsDelivery())
                    .createdAt(product.getCreatedAt() != null ? 
                        product.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : null)
                    .imageUrls(product.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList()))
                    .build();
            elasticProductRepository.save(doc);
        } catch (Exception e) {
            log.error("Failed to sync product to ElasticSearch: {}", e.getMessage());
        }
    }

    private PagedResponse<ProductDto> mapToPagedResponse(Page<Product> page) {
        List<ProductDto> content = page.getContent().stream()
                .map(productMapper::toDto).collect(Collectors.toList());
        
        PagedResponse<ProductDto> response = new PagedResponse<>();
        response.setContent(content);
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }
}
