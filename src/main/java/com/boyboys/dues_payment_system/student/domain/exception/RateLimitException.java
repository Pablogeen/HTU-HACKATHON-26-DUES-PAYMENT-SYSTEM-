package com.boyboys.dues_payment_system.student.domain.exception;

public class RateLimitException extends  RuntimeException{
    public RateLimitException(String message) {
        super(message);
    }
}
