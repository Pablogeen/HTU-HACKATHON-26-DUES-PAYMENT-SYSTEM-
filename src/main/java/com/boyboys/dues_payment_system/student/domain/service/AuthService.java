package com.boyboys.dues_payment_system.student.domain.service;

import com.boyboys.dues_payment_system.student.Student;
import com.boyboys.dues_payment_system.student.StudentLoginEvent;
import com.boyboys.dues_payment_system.student.StudentNotFoundException;
import com.boyboys.dues_payment_system.student.StudentRepository;
import com.boyboys.dues_payment_system.student.domain.*;
import com.boyboys.dues_payment_system.student.domain.dto.AuthResponse;
import com.boyboys.dues_payment_system.student.domain.dto.ConfirmationTokenRequest;
import com.boyboys.dues_payment_system.student.domain.dto.LoginRequest;
import com.boyboys.dues_payment_system.student.domain.dto.RefreshTokenRequest;
import com.boyboys.dues_payment_system.student.domain.exception.*;
import com.boyboys.dues_payment_system.student.domain.security.JwtHelper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

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
        private final RefreshTokenRepository refreshTokenRepository;


     @Transactional
    public String login(LoginRequest request) {
         //Pessimistic locks here
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
            eventPublisher.publishEvent(new StudentLoginEvent(student.getEmail(), student.getFirstName(), token));

            return "VERIFICATION EMAIL WAS SENT TO YOUR EMAIL";
        }

    @Transactional
    public AuthResponse verify(ConfirmationTokenRequest request) {

         //Pessimistic locks here
            Student student = studentRepository.findByEmail(request.getEmail())
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

            refreshTokenRepository.revokeAllStudentTokens(student.getId());

            String refreshTokenValue = UUID.randomUUID().toString();
            log.info("Refresh token gotten");

            RefreshToken refreshToken = new RefreshToken();
            refreshToken.setToken(refreshTokenValue);
            refreshToken.setExpires(LocalDateTime.now().plusDays(7));
            refreshToken.setRevoked(false);
            refreshToken.setStudent(student);

            refreshTokenRepository.save(refreshToken);

            var accessToken = jwtHelper.generateToken(student);
            log.info("Access token generated");

            AuthResponse response = new AuthResponse();
            response.setAccessToken(accessToken);
            response.setRefreshToken(refreshTokenValue);
            response.setRole(student.getRole().name());

            return response;
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

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {

         //Pessemistic locks here
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new InvalidTokenException("Refresh token has been revoked. Please login again");
        }

        if (refreshToken.getExpires().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Refresh token has expired. Please login again");
        }

        Student student = refreshToken.getStudent();
        log.info("Gotten refresh token");

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        log.info("Old refresh token invoked");

        String newRefreshTokenValue = UUID.randomUUID().toString();
        log.info("Refresh token generated");

        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken(newRefreshTokenValue);
        newRefreshToken.setExpires(LocalDateTime.now().plusDays(7));
        newRefreshToken.setRevoked(false);
        newRefreshToken.setStudent(student);

        refreshTokenRepository.save(newRefreshToken);

        var accessToken = jwtHelper.generateToken(student);

        AuthResponse response = new AuthResponse();
        response.setAccessToken(String.valueOf(accessToken));
        response.setRefreshToken(newRefreshTokenValue);
        response.setRole(student.getRole().name());

        return response;
    }

    @Transactional
    public String logout(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        return "LOGGED OUT SUCESSFULLY";
    }


}
