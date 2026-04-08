package com.swaply.userservice.service.admin;

import com.swaply.userservice.client.ChatClient;
import com.swaply.userservice.client.MediaClient;
import com.swaply.userservice.client.ProductClient;
import com.swaply.userservice.dto.admin.DashboardStatsDto;
import com.swaply.userservice.dto.admin.message.ReportMessageDto;
import com.swaply.userservice.dto.user.UserDto;
import com.swaply.userservice.exception.AuthException;
import com.swaply.userservice.mapper.UserMapper;
import com.swaply.userservice.repository.AdminRepository;
import com.swaply.userservice.repository.UserRepository;
import com.swaply.userservice.entity.User;
import com.swaply.userservice.utils.enums.AccountStatus;
import com.swaply.userservice.utils.enums.MessageStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final ChatClient chatClient;
    private final ProductClient productClient;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final MediaClient mediaClient;

    public Long getProductCount() {
        Long count = productClient.getProductCount().getData();
        log.info("Product count : {}", count);
        return count;
    }

    public List<ReportMessageDto> getReportedMessages() {
        ArrayList<ReportMessageDto> reportMessages = new ArrayList<>();
        var messages = chatClient.getReportMessages().getData();
        messages.forEach(message -> {
            User user = userRepository.findById(message.getSenderId()).orElseThrow(() -> new AuthException("User not found"));
            message.setUser(user.getEmail());
            reportMessages.add(message);
        });
        log.info("Reported messages : {}", reportMessages);
        return reportMessages;
    }


    public Long getUserCount() {
        Long count = userRepository.count();
        log.info("User count : {}", count);
        return count;
    }

    public DashboardStatsDto getDashboardStats() {
        Long products = getProductCount();
        Long users = getUserCount();
        List<ReportMessageDto> reports = getReportedMessages();
        
        long activeReports = reports.stream()
                .filter(m -> m.getStatus().equals(MessageStatus.PENDING))
                .count();

        return DashboardStatsDto.builder()
                .totalProducts(products)
                .totalUsers(users)
                .totalReports(reports.size())
                .activeReports(activeReports)
                .productGrowth(12.5)
                .userGrowth(8.2)
                .build();
    }

    public void banUser(UUID userId, Long seconds) {
        User user = userRepository.getUserById(userId);
        user.setStatus(AccountStatus.BANNED);
        user.setExpiredAt(LocalDateTime.now().plusSeconds(seconds));
        userRepository.save(user);
    }

    public void unBanUser(UUID userId) {
        User user = userRepository.getUserById(userId);
        user.setStatus(AccountStatus.ACTIVE);
        user.setExpiredAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public List<UserDto> getUsers() {
        List<UserDto> users = new ArrayList<>();
        userRepository.findAll().forEach(user -> {users.add(userMapper.entityToDto(user));});
        return users;
    }

    public void setBanned(String messageId) {
        chatClient.setBanned(messageId);
    }

    public void setResolved(String messageId) {
        chatClient.setResolved(messageId);
    }

    public void deleteAllResources() {
        mediaClient.deleteAll();
    }


    public void getReports(){
        
    }

}
