package com.boyboys.dues_payment_system.reports.domain;

public record ProgrammeSummary(
        String programme,
        long totalStudents,
        long totalPaid,
        long totalUnpaid
) {}
