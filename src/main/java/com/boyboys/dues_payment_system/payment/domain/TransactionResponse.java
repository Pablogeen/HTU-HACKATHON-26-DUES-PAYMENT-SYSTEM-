package com.boyboys.dues_payment_system.payment.domain;

import java.time.LocalDateTime;

public record TransactionResponse(
        String reference,
        Long amount,
        TransactionStatus status,
        LocalDateTime paidAt,
        LocalDateTime createdAt,
        String studentEmail
) {}
