package com.boyboys.dues_payment_system.payment.domain;

import com.boyboys.dues_payment_system.payment.TransactionStatus;

import java.time.LocalDateTime;

public record TransactionStatusResponse(String reference, TransactionStatus status, LocalDateTime paidAt) {}
