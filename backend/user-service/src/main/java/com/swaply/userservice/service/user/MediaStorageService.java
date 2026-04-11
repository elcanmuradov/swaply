package com.swaply.userservice.service.user;

import com.swaply.userservice.client.MediaClient;
import com.swaply.userservice.entity.User;
import com.swaply.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaStorageService {
    private final MediaClient mediaClient;
    private final UserRepository userRepository;

    @Async
    public void uploadProfilePhotoAsync(byte[] fileBytes, String originalFilename, String userEmail) {
        try {
            log.info("Starting background upload for user: {}", userEmail);

            Resource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return originalFilename != null ? originalFilename : "profile.jpg";
                }
            };

            Map<String, String> uploadResult = mediaClient.upload(resource).getData();
            if (uploadResult != null && uploadResult.containsKey("url")) {
                User user = userRepository.findByEmail(userEmail).orElseThrow();
                user.setProfileImageUrl(uploadResult.get("url"));
                userRepository.save(user);
                log.info("Profile photo updated successfully in background for user: {}", userEmail);
            }
        } catch (Exception e) {
            log.error("Error uploading profile photo in background for user: " + userEmail, e);
        }
    }
}
