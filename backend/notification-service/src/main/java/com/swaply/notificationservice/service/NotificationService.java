package com.swaply.notificationservice.service;

import com.swaply.notificationservice.dto.VerificationRequest;
import com.swaply.notificationservice.exception.NotificationException;
import com.swaply.notificationservice.utils.constants.EmailContext;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;


@Slf4j
@RequiredArgsConstructor
@Service
public class NotificationService {

    private final JavaMailSender javaMailSender;

    public void sendVerificationEmail(VerificationRequest request) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            helper.setTo(request.getEmail());
            helper.setSubject("Your verification code is...");
            helper.setText(EmailContext.setToken(request.getToken()), true);
            javaMailSender.send(mimeMessage);
            log.info("Email has been sent");

        } catch (MessagingException e) {
            throw new NotificationException(e.getMessage());
        }
    }

}
