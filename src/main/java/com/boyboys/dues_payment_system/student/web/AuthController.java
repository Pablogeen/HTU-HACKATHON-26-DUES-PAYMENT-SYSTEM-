package com.boyboys.dues_payment_system.student.web;

import com.boyboys.dues_payment_system.student.domain.dto.*;
import com.boyboys.dues_payment_system.student.domain.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid LoginRequest request) {
        log.info("Request made to login with email: {}",request.getEmail());
        String loginResponse = authService.login(request);
        log.info("login was a success and email was delivered");
        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verify(@RequestBody @Valid ConfirmationTokenRequest request) {
        log.info("Request made to verify email for login access");
        AuthResponse response = authService.verify(request);
        log.info("Token has been verified successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        log.info("Refresh token request received");
        AuthResponse response = authService.refresh(request);
        log.info("Access token refreshed successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @GetMapping("/resend-verification")
    public ResponseEntity<String> resendVerificationToken(@RequestParam  @NotBlank(message = "Email cannot be blank")
                                                          @Email(message = "Invalid email format")
                                                          @Size(max = 254, message = "Email too long")String email){
        log.info("Request made to resendVerificationToken: {}",email);
        String response =  authService.resendVerificationToken(email);
        return new ResponseEntity<>(response, HttpStatus.OK);

    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody @Valid RefreshTokenRequest request) {
        log.info("Logout request received");
        String logoutMessage = authService.logout(request.getRefreshToken());
        log.info("Student logged out successfully");
        return new ResponseEntity<>(logoutMessage, HttpStatus.OK);
    }
}
