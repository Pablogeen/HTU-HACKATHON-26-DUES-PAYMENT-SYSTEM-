package com.boyboys.dues_payment_system.reports.domain;

public record LevelSummary(
        String level,
        long totalStudents,
        long totalPaid,
        long totalUnpaid
) {}
