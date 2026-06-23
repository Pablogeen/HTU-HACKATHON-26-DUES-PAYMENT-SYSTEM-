package com.boyboys.dues_payment_system.users.domain.service;

import com.boyboys.dues_payment_system.users.Student;
import com.boyboys.dues_payment_system.users.domain.ConfirmationToken;
import com.boyboys.dues_payment_system.users.domain.ConfirmationTokenRepository;
import com.boyboys.dues_payment_system.users.domain.StudentRepository;
import com.boyboys.dues_payment_system.users.domain.dto.ConfirmationTokenRequest;
import com.boyboys.dues_payment_system.users.domain.dto.LoginRequest;
import com.boyboys.dues_payment_system.users.domain.dto.LoginResponse;
import com.boyboys.dues_payment_system.users.domain.exception.*;
import com.boyboys.dues_payment_system.users.domain.security.JwtHelper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

        private final StudentRepository studentRepository;
        private final ConfirmationTokenRepository confirmationTokenRepository;
        private final ApplicationEventPublisher eventPublisher;
        private final JwtHelper jwtHelper;
        private final ConfirmationTokenHelper tokenHelper;
        private final ConfirmationTokenService tokenService;


        public String login(LoginRequest request) {
            Student student = studentRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new StudentNotFoundException("No account found with this email"));
            log.info("Gotten the user from the db");

            confirmationTokenRepository.findActiveTokenByStudentId(student.getId(), LocalDateTime.now())
                    .ifPresent(existing -> {
                        existing.setConfirmedAt(LocalDateTime.now());
                        confirmationTokenRepository.save(existing);
                        log.info("Found unconfirmed token and confirming it.");
                    });

            String token = tokenHelper.saveConfirmationToken(student);
            log.info("Token has been saved");

            //Event will be published to send email
          //  eventPublisher.publishEvent(new UserLoginEvent(this, user.getEmail(), user.getFullName(), token));

            return "VERIFICATION EMAIL WAS SENT TO YOUR EMAIL";
        }

        public LoginResponse verify(ConfirmationTokenRequest request) {
            Student user = studentRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new StudentNotFoundException("NO ACCOUNT FOUND WITH THIS STUDENT EMAIL"));

            ConfirmationToken confirmationToken = tokenService.getToken(request.getToken())
                    .orElseThrow(()-> new TokenNotFoundException("TOKEN NOT FOUND"));
            log.info("Confirmation Token gotten from the db");

            if (confirmationToken.getConfirmedAt() !=null){
                log.error("Token already confirmed");
                throw new TokenAlreadyConfirmedException("TOKEN ALREADY CONFIRMED");
            }

            if(confirmationToken.getExpiresAt().isBefore(LocalDateTime.now())){
                log.error("Token expired");
                throw new TokenExpiredException("TOKEN EXPIRED");
            }

            confirmationToken.setConfirmedAt(LocalDateTime.now());
            confirmationTokenRepository.save(confirmationToken);

            var jwtToken = jwtHelper.generateToken(user);

            return new LoginResponse(jwtToken.token(), jwtToken.expiresAt(), user.getEmail(), user.getRole().name());

        }


    @Transactional
    public String resendVerificationToken(String email) {
        log.info("About to make cal to resend token");
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("STUDENT NOT FOUND"));

        confirmationTokenRepository.findActiveTokenByStudentId(student.getId(), LocalDateTime.now())
                .ifPresent(existing -> {
                    existing.setConfirmedAt(LocalDateTime.now());
                    confirmationTokenRepository.save(existing);
                    log.info("Found unconfirmed token and confirming it to request a new one");
                });

        String token = tokenHelper.saveConfirmationToken(student);
        log.info("ConfirmationToken has been saved in the db");

    //    eventPublisher.publishEvent(new UserRegisteredEvent(user.getEmail(), token));
      //  log.info("Event fired to resend verification token email");

        return "Email Sent";

    }
}
