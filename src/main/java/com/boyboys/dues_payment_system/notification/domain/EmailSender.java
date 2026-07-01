package com.boyboys.dues_payment_system.notification.domain;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailSender {

        private final SendGrid sendGrid;

        @Value("${sendgrid.from.email}")
        private String fromEmail;

        @Value("${sendgrid.from.name}")
        private String fromName;

        public void sendEmail(String to, String subject, String htmlContent) {
            try {
                Mail mail = new Mail(
                        new Email(fromEmail, fromName),
                        subject,
                        new Email(to),
                        new Content("text/html", htmlContent)
                );

                Request request = new Request();
                request.setMethod(Method.POST);
                request.setEndpoint("mail/send");
                request.setBody(mail.build());

                Response response = sendGrid.api(request);

                if (response.getStatusCode() >= 400) {
                    throw new RuntimeException("SendGrid failed: " + response.getStatusCode() + " " + response.getBody());
                }

                log.info("Email queued successfully for {}", to);

            } catch (IOException e) {
                throw new RuntimeException("Failed to send email", e);
            }
        }
    }


