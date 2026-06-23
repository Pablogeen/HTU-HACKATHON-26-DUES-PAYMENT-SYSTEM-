package com.boyboys.dues_payment_system.student.domain.exception;

public class PhoneNumberAlreadyTakenException extends RuntimeException{

    public PhoneNumberAlreadyTakenException(String message) {
        super(message);
    }
}
