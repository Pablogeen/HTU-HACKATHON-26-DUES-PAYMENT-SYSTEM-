package com.boyboys.dues_payment_system.student.domain.exception;

public class AccessDeniedException extends RuntimeException{

    public AccessDeniedException(String message) {
        super(message);
    }
}
