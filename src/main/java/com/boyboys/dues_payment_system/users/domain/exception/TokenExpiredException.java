package com.boyboys.dues_payment_system.users.domain.exception;

public class TokenExpiredException extends  RuntimeException{
    public TokenExpiredException(String message) {
        super(message);
    }
}
