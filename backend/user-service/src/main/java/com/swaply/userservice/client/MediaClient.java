package com.swaply.userservice.client;

import com.swaply.userservice.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "media-service", url = "http://media-service:8080")
@Component
public interface MediaClient {
    @GetMapping("/media/delete-all")
    ApiResponse<Long> deleteAll();
}