package com.swaply.notificationservice.service;

import com.swaply.notificationservice.dto.VerificationRequest;
import com.swaply.notificationservice.exception.NotificationException;
import com.swaply.notificationservice.utils.constants.EmailContext;
import org.springframework.beans.factory.annotation.Value;
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

    private final SesV2Client sesV2Client;

    @Value("${FROM_EMAIL}")
    private String fromEmail;

    public NotificationService(SesV2Client sesV2Client) {
        this.sesV2Client = sesV2Client;
    }

    public void sendVerificationEmail(VerificationRequest request) {
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
        throw new NotificationException(e.getMessage());
        }
    }

}
