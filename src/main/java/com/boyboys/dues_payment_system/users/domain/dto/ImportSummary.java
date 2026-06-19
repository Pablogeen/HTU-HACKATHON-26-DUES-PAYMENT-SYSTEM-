package com.boyboys.dues_payment_system.users.domain.dto;

import java.util.List;

public class ImportSummary {

    private int totalRows;
    private int successCount;
    private int skippedCount;
    private List<String> skippedReasons;
}
