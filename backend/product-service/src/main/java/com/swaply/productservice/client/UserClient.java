package com.swaply.productservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.UUID;

@Component
@FeignClient(name = "user-service", url = "http://user-service:8080")
public interface UserClient {

    @GetMapping("/user/favorites")
    List<UUID> findAllFavorites();

}
