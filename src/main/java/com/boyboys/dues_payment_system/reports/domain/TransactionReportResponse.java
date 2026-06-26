package com.boyboys.dues_payment_system.reports.domain;

public record TransactionReportResponse(
        String reference,
        String studentName,
        String email,
        String programme,
        String level,
        long amountInCedis,
        String paidAt
) {}
