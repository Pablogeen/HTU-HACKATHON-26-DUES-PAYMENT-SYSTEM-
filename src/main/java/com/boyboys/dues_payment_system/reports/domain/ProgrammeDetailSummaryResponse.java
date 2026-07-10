package com.boyboys.dues_payment_system.reports.domain;

import java.math.BigDecimal;
import java.util.List;

public record ProgrammeDetailSummaryResponse(
        String programme,
        long totalStudents,
        long totalPaid,
        long totalUnpaid,
        BigDecimal totalAmountCollectedInCedis,
        List<LevelSummary> levelSummaries
) {}
