package com.swaply.userservice.controller.admin;

import com.swaply.userservice.dto.ApiResponse;
import com.swaply.userservice.dto.admin.DashboardStatsDto;
import com.swaply.userservice.dto.admin.message.ReportMessageDto;
import com.swaply.userservice.dto.user.UserDto;
import com.swaply.userservice.service.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/product-count")
    public ResponseEntity<ApiResponse<Long>> getProductCount() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getProductCount()));
    }


    @GetMapping("/reported-messages")
    public ResponseEntity<ApiResponse<List<ReportMessageDto>>> getReportedMessages() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getReportedMessages()));
    }

    @GetMapping("/user-count")
    public ResponseEntity<ApiResponse<Long>> getUserCount() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserCount()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsers()));
    }

    @PutMapping("/users/{userId}/ban")
    public void banUser(@PathVariable UUID userId, @RequestParam Long seconds) {
        adminService.banUser(userId, seconds);
    }
    @PutMapping("/users/{userId}/unban")
    public void unBanUser(@PathVariable UUID userId) {
        adminService.unBanUser(userId);
    }

    @PutMapping("/reported-messages/{messageId}/ban")
    public void setBanned(@PathVariable String messageId) {
        adminService.setBanned(messageId);
    }

    @PutMapping("/reported-messages/{messageId}/resolve")
    public void setResolved(@PathVariable String messageId) {
        adminService.setResolved(messageId);
    }

    @DeleteMapping("/stats/products/delete-all")
    public void deleteAllProducts() {
        adminService.deleteAllResources();
    }

}
