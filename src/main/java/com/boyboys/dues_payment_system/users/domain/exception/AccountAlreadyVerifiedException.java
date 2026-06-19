package com.boyboys.dues_payment_system.users.domain.exception;

public class AccountAlreadyVerifiedException extends RuntimeException{

    public AccountAlreadyVerifiedException(String message) {
        super(message);
    }
}
