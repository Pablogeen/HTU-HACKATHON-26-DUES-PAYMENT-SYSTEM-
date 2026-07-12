package com.boyboys.dues_payment_system.student.domain.exception;

public class StudentAlreadyDeletedException extends RuntimeException{

    public StudentAlreadyDeletedException(String message) {
        super(message);
    }
}
