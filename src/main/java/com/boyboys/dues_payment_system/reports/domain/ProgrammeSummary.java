package com.boyboys.dues_payment_system.reports.domain;

import java.math.BigDecimal;

public record ProgrammeSummary(
        String programme,
        long totalStudents,
        long totalPaid,
        long totalUnpaid,
        BigDecimal totalAmount
) {}
