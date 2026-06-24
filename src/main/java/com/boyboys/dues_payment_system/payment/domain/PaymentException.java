package com.boyboys.dues_payment_system.payment.domain;

public class PaymentException extends RuntimeException{

    public PaymentException(String message) {
        super(message);
    }
}
