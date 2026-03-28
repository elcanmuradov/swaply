package com.swaply.mediaservice.service;


//import com.cloudinary.Cloudinary;
//import com.cloudinary.utils.ObjectUtils;
import com.cloudinary.Cloudinary;
import com.cloudinary.api.ApiResponse;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final Cloudinary cloudinary;

    public Map<String, Object> getUploadSignature(Map<String, Object> params) {
        long timestamp = System.currentTimeMillis() / 1000L;
        params.put("timestamp", timestamp);

        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);

        Map<String, Object> response = new HashMap<>();
        response.put("signature", signature);
        response.put("timestamp", timestamp);
        response.put("api_key", cloudinary.config.apiKey);
        response.put("cloud_name", cloudinary.config.cloudName);

        return response;
    }

    public List<Map<String, String>> uploadFiles(List<MultipartFile> files) {
        log.info("Uploading files to Cloudinary");
        List<Map<String, String>> results = new ArrayList<>();


        files.parallelStream().forEach(file -> {
            try {
                if (!file.isEmpty()) {
                    Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                    results.add(Map.of(
                            "url", uploadResult.get("secure_url").toString(),
                            "publicId", uploadResult.get("public_id").toString()
                    ));
                }
            } catch (IOException e) {
                results.add(Map.of(
                        "error", "Fayl yüklənmədi: " + file.getOriginalFilename(),
                        "fileName", file.getOriginalFilename()
                ));
            }


        });

        log.info("Uploaded files to Cloudinary");
        return results;
    }


    public void deleteAllResources() {
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("max_results", 100);
            options.put("resource_type", "image");

            String nextCursor = null;

            do {
                if (nextCursor != null) {
                    options.put("next_cursor", nextCursor);
                }

                ApiResponse resources = cloudinary.api().resources(options);
                List<Map<String, String>> resourceList = (List<Map<String, String>>) resources.get("resources");

                if (resourceList.isEmpty()) {
                    break;
                }

                List<String> publicIds = resourceList.stream()
                        .map(resource -> resource.get("public_id"))
                        .collect(Collectors.toList());

                cloudinary.api().deleteResources(publicIds, options);

                log.info("Silindi: " + publicIds.size() + " ədəd");

                nextCursor = (String) resources.get("next_cursor");

            } while (nextCursor != null);

            log.info("Bütün resurslar silindi!");
        } catch (Exception e) {
            log.error(e.getMessage());
        }

    }

    public void deleteImages(List<String> publicIds) {
        try {
            if (publicIds != null && !publicIds.isEmpty()) {
                cloudinary.api().deleteResources(publicIds, ObjectUtils.emptyMap());
                log.info("Cloudinary-dən silindi: " + publicIds.size() + " ədəd şəkil.");
            }
        } catch (Exception e) {
            log.error("Resurslar silinərkən xəta: " + e.getMessage());
        }
    }
}