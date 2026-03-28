package com.swaply.userservice.service.user;

import com.swaply.userservice.exception.AuthException;
import com.swaply.userservice.repository.AdminRepository;
import com.swaply.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<? extends UserDetails> user = Optional.ofNullable(userRepository.findByEmail(username)).get();
        if (user.isPresent()) {
            return user.get();
        }
        Optional<? extends UserDetails> admin = adminRepository.findByEmail(username);
        if (admin.isPresent()) {
            return admin.get();
        }else  {
            throw new AuthException("User not found with username: " + username);
        }
    }
}