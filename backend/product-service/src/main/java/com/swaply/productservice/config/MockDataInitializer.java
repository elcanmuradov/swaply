package com.swaply.productservice.config;

import com.swaply.productservice.document.ProductDocument;
import com.swaply.productservice.entity.Product;
import com.swaply.productservice.entity.ProductImage;
import com.swaply.productservice.repository.elastic.ElasticProductRepository;
import com.swaply.productservice.repository.jpa.ProductRepository;
import com.swaply.productservice.service.ProductService;
import com.swaply.productservice.utils.enums.City;
import com.swaply.productservice.utils.enums.ProductCategory;
import com.swaply.productservice.utils.enums.ProductStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class MockDataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductService productService;

    @Override
    public void run(String... args) throws Exception {

        if (productRepository.count() >= 20) {
            log.info("Bazada kifayət qədər məlumat var.");
            return;
        }

        log.info("20 ədəd yeni mock data əlavə edilir...");

        List<Product> products = new ArrayList<>();

        String[] mockImages = {
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600", // iPhone
                "https://images.unsplash.com/photo-1514342959091-2bffd8a7c4ba?w=500", // Mac
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", // Headphones
                "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600", // S23
                "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600", // PS5
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", // Nike
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600", // Coat
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600", // Sofa
                "https://images.unsplash.com/photo-1608354580875-30bd4168b351?w=500", // Coffee
                "https://images.unsplash.com/photo-1458731909820-5850bdcaee0b?w=500", // Bed
                "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600", // Racket
                "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600", // Chess
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600", // Books
                "https://images.unsplash.com/photo-1664287721774-13da4b108b18?w=500", // Car wheels
                "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600", // PC
                "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600", // Guitar
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600", // Bike
                "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600", // Desk
                "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600", // Hair
                "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600" // LEGO
        };

        Object[][] mockData = {
                {"iPhone 15 Pro Max", "2450.00", ProductCategory.ELECTRONICS, City.ABSHERON, true},
                {"MacBook Air M2", "1850.00", ProductCategory.ELECTRONICS, City.BAKI, true},
                {"Sony Headphones", "320.00", ProductCategory.ELECTRONICS, City.SUMQAYIT, true},
                {"Samsung S23 Ultra", "1900.00", ProductCategory.ELECTRONICS, City.GENCE, true},
                {"PS5 Slim", "1150.00", ProductCategory.ELECTRONICS, City.BAKI, true},
                {"Nike Jordan 1", "350.00", ProductCategory.WEAR, City.BAKI, true},
                {"Zara Coat", "120.00", ProductCategory.WEAR, City.BAKI, true},
                {"Corner Sofa", "850.00", ProductCategory.HOME_AND_GARDEN, City.BAKI, false},
                {"Coffee Machine", "450.00", ProductCategory.HOME_AND_GARDEN, City.GENCE, true},
                {"Baby Bed", "280.00", ProductCategory.CHILDREN, City.SUMQAYIT, true},
                {"Tennis Racket", "150.00", ProductCategory.SPORT, City.BAKI, true},
                {"Chess Set", "45.00", ProductCategory.TOY, City.BAKI, true},
                {"Harry Potter Books", "80.00", ProductCategory.BOOK, City.SUMQAYIT, true},
                {"Camry Wheels", "600.00", ProductCategory.CAR, City.BAKI, false},
                {"Gaming PC RTX 4070", "3200.00", ProductCategory.ELECTRONICS, City.IMISHLI, true},
                {"Acoustic Guitar", "350.00", ProductCategory.ART, City.BAKI, true},
                {"Scott Bike", "950.00", ProductCategory.SPORT, City.BERDE, false},
                {"Office Desk", "220.00", ProductCategory.BUSINESS, City.BAKI, true},
                {"Hair Dryer", "750.00", ProductCategory.BEAUTY, City.BAKI, true},
                {"LEGO Star Wars", "400.00", ProductCategory.TOY, City.SAATLI, true}
        };

        for (int i = 0; i < mockData.length; i++) {
            Object[] data = mockData[i];
            Product p = Product.builder()
                    .title((String) data[0])
                    .description(data[0] + " ideal vəziyyətdə təcili satılır.")
                    .price(new BigDecimal((String) data[1]))
                    .userId(UUID.randomUUID())
                    .category((ProductCategory) data[2])
                    .city((City) data[3])
                    .status(ProductStatus.ACTIVE)
                    .isNew((Boolean) data[4])
                    .isDelivery(i % 2 == 0)
                    .images(new ArrayList<>())
                    .viewers((long) (Math.random() * 500))
                    .createdAt(LocalDateTime.now())
                    .build();

            p.addImage(ProductImage.builder()
                    .imageUrl(mockImages[i])
                    .publicId("mock/p" + (i + 1))
                    .displayOrder(0)
                    .isMain(true)
                    .build());

            products.add(p);
        }

        productRepository.saveAll(products);
        products.forEach(productService::syncToElastic);
        log.info("20 dənə mock data bazaya yazıldı.");
    }
}
