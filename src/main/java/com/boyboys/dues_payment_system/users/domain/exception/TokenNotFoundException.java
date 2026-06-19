package com.boyboys.dues_payment_system.users.domain.exception;

public class TokenNotFoundException extends  RuntimeException{
    public TokenNotFoundException(String message) {
        super(message);
    }
}
