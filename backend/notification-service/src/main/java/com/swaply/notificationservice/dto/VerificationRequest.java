package com.swaply.notificationservice.dto;

import lombok.Data;

@Data
public class VerificationRequest {
    private String email;
    private String token;
}
