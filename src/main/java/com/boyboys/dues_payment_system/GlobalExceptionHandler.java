package com.boyboys.dues_payment_system;

import com.boyboys.dues_payment_system.payment.PaymentException;
import com.boyboys.dues_payment_system.student.StudentNotFoundException;
import com.boyboys.dues_payment_system.student.domain.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.Optional;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> genericException(Exception e, WebRequest request) {
        log.error("Generic error: {}",e.getMessage(), e);
        ErrorDetails details = new ErrorDetails(
                "Something Went Wrong...",
                "INTERNAL SERVER ERROR",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        log.error("Handling Invalid Request");
        String message = Optional.ofNullable(ex.getBindingResult().getFieldError())
                .map(FieldError::getDefaultMessage)
                .orElse("Validation error");

        String details = request.getDescription(false);

        ErrorDetails errorDetails = new ErrorDetails(message, "INVALID REQUEST",details, LocalDateTime.now());
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EmailAlreadyExistException.class)
    public ResponseEntity<?> emailAlreadyExistException(EmailAlreadyExistException e, WebRequest request) {
        log.error("Email already exist error");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "EMAIL ALREADY TAKEN",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<?> invalidTokenException(InvalidTokenException e, WebRequest request) {
        log.error("Invalid Token");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "INVALID TOKEN",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(PhoneNumberAlreadyTakenException.class)
    public ResponseEntity<?> phoneNumberAlreadyExistException(PhoneNumberAlreadyTakenException e, WebRequest request) {
        log.error("Phone Number already exists");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "PHONE NUMBER ALREADY TAKEN",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.CONFLICT);
    }


    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<?> studentNotFoundException(StudentNotFoundException e, WebRequest request) {
        log.error("User not found exception");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "STUDENT NOT FOUND",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.NOT_FOUND);
    }


    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> accessDeniedException(AccessDeniedException e, WebRequest request) {
        log.error("Access Denied Exception");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "UNAUTHORIZED",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.FORBIDDEN);

    }

    @ExceptionHandler(TokenNotFoundException.class)
    public ResponseEntity<?> tokenNotFoundException(TokenNotFoundException e, WebRequest request) {
        log.error("Token Not Found Exception");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "TOKEN NOT FOUND",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.CONFLICT);

    }

    @ExceptionHandler(TokenAlreadyConfirmedException.class)
    public ResponseEntity<?> tokenAlreadyConfirmed(TokenAlreadyConfirmedException e, WebRequest request) {
        log.error("Token already confirmed Exception");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "TOKEN ALREADY CONFIRMED",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.CONFLICT);

    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<?> tokenExpiredException(TokenExpiredException e, WebRequest request) {
        log.error("Token Expired Exception");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "TOKEN HAS EXPIRED",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.CONFLICT);

    }

    @ExceptionHandler(StudentAlreadyDeletedException.class)
    public ResponseEntity<?> tokenExpiredException(StudentAlreadyDeletedException e, WebRequest request) {
        log.error("Student already deleted Exception");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "STUDENT HAS ALREADY BEEN DELETED",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.CONFLICT);

    }

    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<?> handleRateLimit(RateLimitException ex, WebRequest request) {
        log.error("Rate limit exception");
        ErrorDetails details = new ErrorDetails(
                ex.getMessage(),
                "RATE LIMIT EXCEEDED",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.TOO_MANY_REQUESTS);
    }

    //Payments
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<?> paymentException(PaymentException e, WebRequest request) {
        log.error("Payment not processed");
        ErrorDetails details = new ErrorDetails(
                e.getMessage(),
                "PAYMENT NOT PROCESSED",
                request.getDescription(false),
                LocalDateTime.now());
        return new ResponseEntity<>(details, HttpStatus.INTERNAL_SERVER_ERROR);

    }


}
