package com.swaply.userservice.config;

import com.swaply.userservice.entity.Admin;
import com.swaply.userservice.repository.AdminRepository;
import com.swaply.userservice.utils.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminDataInitializer {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdmin() {
        return args -> {
            if (adminRepository.count() == 0) {
                Admin defaultAdmin = Admin.builder()
                        .name("Admin")
                        .email("admin@swaply.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(UserRole.ADMIN)
                        .build();

                adminRepository.save(defaultAdmin);
                log.info("Default admin account created: admin@swaply.com / admin123");
            } else {
                log.info("Admin accounts already exist. Skipping initialization.");
            }
        };
    }
}
