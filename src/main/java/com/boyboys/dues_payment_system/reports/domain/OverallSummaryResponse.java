package com.boyboys.dues_payment_system.reports.domain;


import java.math.BigDecimal;
import java.util.List;

public record OverallSummaryResponse(
        long totalStudents,
        long totalPaid,
        long totalUnpaid,
        BigDecimal totalAmountCollectedInCedis,
        List<ProgrammeSummary> programmeSummaries,
        List<LevelSummary> levelSummaries
) {}
