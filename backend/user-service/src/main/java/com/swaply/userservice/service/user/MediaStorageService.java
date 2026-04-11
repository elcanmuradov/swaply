package com.swaply.userservice.service.user;

import com.swaply.userservice.dto.ApiResponse;
import com.swaply.userservice.entity.User;
import com.swaply.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaStorageService {
    private final UserRepository userRepository;

    @Async
    public void uploadProfilePhotoAsync(byte[] fileBytes, String originalFilename, String userEmail) {
        try {
            log.info("Starting background upload for user: {}", userEmail);

            String filename = originalFilename != null ? originalFilename : "profile.jpg";
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            HttpHeaders partHeaders = new HttpHeaders();
            partHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(fileResource, partHeaders);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", filePart);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
                    "http://media-service:8080/media/upload",
                    requestEntity,
                    ApiResponse.class
            );

            Map<String, String> uploadResult = null;
            if (response.getBody() != null && response.getBody().getData() instanceof Map<?, ?> dataMap) {
                uploadResult = (Map<String, String>) dataMap;
            }

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
