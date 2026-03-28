package com.swaply.userservice.service.user;

import com.swaply.userservice.dto.user.ChangePasswordRequest;
import com.swaply.userservice.dto.user.UserDto;
import com.swaply.userservice.entity.User;
import com.swaply.userservice.exception.AuthException;
import com.swaply.userservice.mapper.UserMapper;
import com.swaply.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public void changePassword(ChangePasswordRequest request, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new AuthException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AuthException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public UserDto getUserProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new AuthException(authentication.getName() + " User not found"));
        return userMapper.entityToDto(user);
    }

    public UserDto addProductToFavorites(UUID id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new AuthException(authentication.getName() + " User not found"));
        List<UUID> favorites = Optional.ofNullable(user.getFavoritedProductsIds()).orElse(new ArrayList<>());
        if (!favorites.contains(id)) {
            favorites.add(id);
            user.setFavoritedProductsIds(favorites);
            userRepository.save(user);
        }
        return userMapper.entityToDto(user);
    }

    public void removeProductFromFavorites(UUID id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new AuthException(authentication.getName() + " User not found"));
        List<UUID> favorites = user.getFavoritedProductsIds();
        favorites.remove(id);
        user.setFavoritedProductsIds(favorites);
        userRepository.save(user);
    }

    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new AuthException("User not found with id: " + id));
        return userMapper.entityToDto(user);
    }

    public List<UUID> getUserFavorites(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new AuthException(authentication.getName() + " User not found"));
        return user.getFavoritedProductsIds();

    }
}
