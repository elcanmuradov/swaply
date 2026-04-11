package com.swaply.userservice.service.user;

import com.swaply.userservice.client.NotificationClient;
import com.swaply.userservice.dto.user.create.AuthResponse;
import com.swaply.userservice.dto.user.create.LoginRequest;
import com.swaply.userservice.dto.user.create.RegisterRequest;
import com.swaply.userservice.dto.user.create.VerificationRequest;
import com.swaply.userservice.dto.user.update.ChangePasswordRequest;
import com.swaply.userservice.entity.User;
import com.swaply.userservice.exception.AuthException;
import com.swaply.userservice.repository.UserRepository;
import com.swaply.userservice.service.JwtService;
import com.swaply.userservice.utils.enums.AccountStatus;
import com.swaply.userservice.utils.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final NotificationClient notificationClient;



    public AuthResponse register(RegisterRequest registerRequest) {
        log.info("Register request : {}", registerRequest);

        if (userRepository.findByPhone(registerRequest.getPhone()) != null) {
            throw new AuthException("Telefon nömrəsi qeydiyyatda var");
        }

        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new AuthException("Email artıq qeydiyyatdan keçib");
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .phone(registerRequest.getPhone())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .userRole(UserRole.USER)
                .expiredAt(LocalDateTime.now(ZoneId.of("UTC")))
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now(ZoneId.of("UTC")))
                .build();


        user =  userRepository.save(user);




        return AuthResponse.builder().token(jwtService.generateToken(user)).build();

    }

    public boolean verify(VerificationRequest verificationRequest) {
        var token = redisTemplate.opsForValue().get(verificationRequest.getEmail()) ;
        log.info(Optional.ofNullable(token).orElse("token is null").toString());

        return (verificationRequest.getToken().equals(token));
    }

    public void sendVerificationCode(Map<String, String> request)  {

        String email = request.get("email");
        if(userRepository.findByEmail(email).isPresent()){
            throw new AuthException("Email is already exist");
        }

        if(Optional.ofNullable(redisTemplate.opsForValue().get(email)).isEmpty()){
            VerificationRequest verificationRequest = new VerificationRequest();
            verificationRequest.setEmail(email);
            verificationRequest.setToken(generateVerificationCode());
            notificationClient.sendVerificationCode(verificationRequest);
            redisTemplate.opsForValue().set(email, verificationRequest.getToken(), 2, TimeUnit.MINUTES);
        }
    }

    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Login request : {}", loginRequest);

        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(() -> new AuthException(loginRequest.getEmail() + ": User not found"));
if (user.getStatus().equals(AccountStatus.BANNED ) && isBanned(user.getExpiredAt())){
            log.info("Banned user : {}", user);
            throw new AuthException("User Banned");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );



        String token = jwtService.generateToken(user);
        return AuthResponse.builder().token(token).build();
    }

    public void logout(String authorizationHeader) {
        log.info("Logout request : {}", authorizationHeader);
        long expirationTime = jwtService.getExpirationTime(authorizationHeader);
        String token = jwtService.extractToken(authorizationHeader);
        String blacklistKey = "blacklist:token:" + token;

        redisTemplate.opsForValue().set(
                blacklistKey,
                "logout",
                expirationTime,
                TimeUnit.MILLISECONDS
        );
    }

    private boolean isBanned(LocalDateTime expiredAt) {
        return expiredAt.isAfter(LocalDateTime.now());
    }

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(1000000);
        return String.valueOf(code);
    }

    public void changePassword(Authentication authentication, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new AuthException(authentication.getName() + " User not found"));
        if(passwordEncoder.matches(request.getOldPassword(), user.getPassword())){
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }else{
            throw new AuthException("passwords don't match");
        };
    }
}
