package com.boyboys.dues_payment_system.users.domain.exception;

public class TokenAlreadyConfirmedException extends  RuntimeException{
    public TokenAlreadyConfirmedException(String message) {
        super(message);
    }
}
