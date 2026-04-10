package com.swaply.notificationservice.config;

import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;

@Configuration
public class SesConfig {

    @Bean
    @ConditionalOnProperty(name = "aws.enabled", havingValue = "true")
    public SesV2Client sesV2Client(
            @Value("${AWS_REGION:eu-north-1}") String region,
            @Value("${AWS_ACCESS_KEY_ID:}") String accessKeyId,
            @Value("${AWS_SECRET_ACCESS_KEY:}") String secretAccessKey
    ) {
        requireNonBlank(accessKeyId, "AWS_ACCESS_KEY_ID");
        requireNonBlank(secretAccessKey, "AWS_SECRET_ACCESS_KEY");

        return SesV2Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                        )
                )
                .build();
    }

    private static void requireNonBlank(String value, String key) {
        if (Objects.isNull(value) || value.isBlank()) {
            throw new IllegalStateException(key + " is not configured");
        }
    }
}