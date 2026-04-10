package com.swaply.notificationservice.service;

import com.swaply.notificationservice.dto.VerificationRequest;
import com.swaply.notificationservice.exception.NotificationException;
import com.swaply.notificationservice.utils.constants.EmailContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;


@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${FROM_EMAIL:}")
    private String fromEmail;

    @Value("${MAIL_ENABLED:true}")
    private boolean mailEnabled;

    public NotificationService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendVerificationEmail(VerificationRequest request) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (!mailEnabled) {
            log.warn("Email sending is disabled; skipping verification email for {}", request.getEmail());
            return;
        }

        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            throw new NotificationException("JavaMailSender or FROM_EMAIL is not configured");
        } else {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(request.getEmail());
                helper.setSubject("Your verification code is...");
                helper.setText(EmailContext.setToken(request.getToken()), true);

                mailSender.send(message);
                log.info("Email has been sent to {}", request.getEmail());

            } catch (MessagingException | RuntimeException e) {
                log.warn("SMTP email send failed for {}: {}", request.getEmail(), e.getMessage());
                throw new NotificationException("SMTP email send failed: " + e.getMessage());
            }
        }
    }

}
