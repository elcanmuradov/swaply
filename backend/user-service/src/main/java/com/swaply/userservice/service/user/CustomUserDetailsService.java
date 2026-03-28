package com.swaply.userservice.service.user;

import com.swaply.userservice.exception.AuthException;
import com.swaply.userservice.repository.AdminRepository;
import com.swaply.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<? extends UserDetails> user = userRepository.findByEmail(username);

        if (user.isPresent()) {
            return user.get();
        }
        return adminRepository.findByEmail(username)
                .orElseThrow(() -> new AuthException(username + " Not found"));
    }
}