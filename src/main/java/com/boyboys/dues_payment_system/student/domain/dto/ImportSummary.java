package com.boyboys.dues_payment_system.student.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class ImportSummary {

    private int totalRows;
    private int successCount;
    private int skippedCount;
    private List<String> skippedReasons;
}
