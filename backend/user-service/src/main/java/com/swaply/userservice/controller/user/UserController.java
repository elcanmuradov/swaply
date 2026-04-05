package com.swaply.userservice.controller.user;

import com.swaply.userservice.dto.ApiResponse;
import com.swaply.userservice.dto.user.ChangePasswordRequest;
import com.swaply.userservice.dto.user.UserDto;
import com.swaply.userservice.dto.user.update.ProfilePhotoRequest;
import com.swaply.userservice.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("")
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getUserProfile(Authentication authentication){
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(ApiResponse.success(userService.getUserProfile(authentication)));
    }

    @PostMapping("/profile/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        userService.changePassword(request, authentication);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/profile/favorites/{productId}")
    public ResponseEntity<ApiResponse<UserDto>> addProductToFavorites(@PathVariable UUID productId,Authentication authentication){
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(ApiResponse.success(userService.addProductToFavorites(productId,authentication)));
    }

    @PutMapping("/profile/changePhoto")
    public ResponseEntity<ApiResponse<Void>> changeProfilePhoto(@RequestParam("file") MultipartFile file, Authentication authentication){
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        userService.changeProfilePhoto(file, authentication);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/profile/favorites/{productId}")
    public void removeProductFromFavorites(@PathVariable UUID productId,Authentication authentication){
        if (authentication == null) {
            return;
        }
        userService.removeProductFromFavorites(productId, authentication);
    }

    @GetMapping("/profile/favorites")
    public ResponseEntity<ApiResponse<List<UUID>>> getUserFavorites(Authentication authentication){
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
       return ResponseEntity.ok(ApiResponse.success(userService.getUserFavorites(authentication)));
    }

    @GetMapping(value = "/profile", params = "id")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@RequestParam UUID id){
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }
}
