package com.swaply.userservice.client;

import com.swaply.userservice.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;


@FeignClient(name = "product-service", url = "http://product-service:8080")
@Component
public interface ProductClient {
    @GetMapping("/product-count")
    ApiResponse<Long> getProductCount();

}
