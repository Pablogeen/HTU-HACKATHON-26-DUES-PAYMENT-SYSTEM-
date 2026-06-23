package com.boyboys.dues_payment_system.users.web;

import com.boyboys.dues_payment_system.users.domain.dto.ConfirmationTokenRequest;
import com.boyboys.dues_payment_system.users.domain.dto.LoginRequest;
import com.boyboys.dues_payment_system.users.domain.dto.LoginResponse;
import com.boyboys.dues_payment_system.users.domain.dto.StudentResponse;
import com.boyboys.dues_payment_system.users.domain.service.AuthService;
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
    public ResponseEntity<LoginResponse> verify(@RequestBody @Valid ConfirmationTokenRequest request) {
        log.info("Request made to verify email for login access");
        LoginResponse response = authService.verify(request);
        log.info("Token has been verified successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/register-student")
    public ResponseEntity<StudentResponse> registerStudent(@RequestBody @Valid ConfirmationTokenRequest request) {
        log.info("Request made to register a single student to the system : {}",request.getEmail());
        StudentResponse response = authService.registerStudent(request);
        log.info("Student has been registered to the system");
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
}
