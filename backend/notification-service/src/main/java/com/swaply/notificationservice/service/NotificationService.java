package com.swaply.notificationservice.service;

import com.swaply.notificationservice.dto.VerificationRequest;
import com.swaply.notificationservice.exception.NotificationException;
import com.swaply.notificationservice.utils.constants.EmailContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.Body;
import software.amazon.awssdk.services.sesv2.model.Content;
import software.amazon.awssdk.services.sesv2.model.Destination;
import software.amazon.awssdk.services.sesv2.model.EmailContent;
import software.amazon.awssdk.services.sesv2.model.Message;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final ObjectProvider<SesV2Client> sesV2ClientProvider;

    @Value("${FROM_EMAIL:}")
    private String fromEmail;

    @Value("${AWS_ENABLED:true}")
    private boolean awsEnabled;

    public NotificationService(ObjectProvider<SesV2Client> sesV2ClientProvider) {
        this.sesV2ClientProvider = sesV2ClientProvider;
    }

    public void sendVerificationEmail(VerificationRequest request) {
        SesV2Client sesV2Client = sesV2ClientProvider.getIfAvailable();
        if (!awsEnabled) {
            log.warn("Email sending is disabled or not configured; skipping SES verification email for {}", request.getEmail());
            return;
        }

        if (sesV2Client == null || fromEmail == null || fromEmail.isBlank()) {
            throw new NotificationException("SES client or FROM_EMAIL is not configured");
        } else {
            try {
                SendEmailRequest emailRequest = SendEmailRequest.builder()
                    .fromEmailAddress(fromEmail)
                    .destination(Destination.builder()
                        .toAddresses(request.getEmail())
                        .build())
                    .content(EmailContent.builder()
                        .simple(Message.builder()
                            .subject(Content.builder()
                                .data("Your verification code is...")
                                .charset("UTF-8")
                                .build())
                            .body(Body.builder()
                                .html(Content.builder()
                                    .data(EmailContext.setToken(request.getToken()))
                                    .charset("UTF-8")
                                    .build())
                                .build())
                            .build())
                        .build())
                    .build();

                sesV2Client.sendEmail(emailRequest);
                log.info("Email has been sent to {}", request.getEmail());

            } catch (SdkException e) {
                log.warn("SES email send failed for {}: {}", request.getEmail(), e.getMessage());
                throw new NotificationException("SES email send failed: " + e.getMessage());
            }
        }
    }

}
