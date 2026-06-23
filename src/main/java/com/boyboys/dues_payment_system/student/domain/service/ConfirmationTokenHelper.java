package com.boyboys.dues_payment_system.student.domain.service;

import com.boyboys.dues_payment_system.student.Student;
import com.boyboys.dues_payment_system.student.domain.ConfirmationToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class ConfirmationTokenHelper {

    private final ConfirmationTokenService tokenService;

    public String saveConfirmationToken(Student user)  {

        SecureRandom random = new SecureRandom();
        int code = random.nextInt(999999);
        String token = String.format("%06d", code);

        ConfirmationToken saveConfirmationToken = new ConfirmationToken(
                token,
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(5),
                user);

        tokenService.saveConfirmationToken(saveConfirmationToken);
        log.info("Confirmation Details saved successfully");

        return token;
    }
}
