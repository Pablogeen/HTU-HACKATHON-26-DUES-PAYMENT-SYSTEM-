package com.boyboys.dues_payment_system.student.domain.exception;

public class TokenNotFoundException extends  RuntimeException{
    public TokenNotFoundException(String message) {
        super(message);
    }
}
