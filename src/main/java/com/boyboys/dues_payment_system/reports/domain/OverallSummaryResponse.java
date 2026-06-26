package com.boyboys.dues_payment_system.reports.domain;


import java.util.List;

public record OverallSummaryResponse(
        long totalStudents,
        long totalPaid,
        long totalUnpaid,
        long totalAmountCollectedInCedis,
        List<ProgrammeSummary> programmeSummaries,
        List<LevelSummary> levelSummaries
) {}
