package com.boyboys.dues_payment_system.reports.domain;

import java.util.List;

public record ProgrammeDetailSummaryResponse(
        String programme,
        long totalStudents,
        long totalPaid,
        long totalUnpaid,
        long totalAmountCollectedInCedis,
        List<LevelSummary> levelSummaries
) {}
