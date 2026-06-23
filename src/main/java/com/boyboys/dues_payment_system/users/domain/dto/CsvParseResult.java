package com.boyboys.dues_payment_system.users.domain.dto;

import com.boyboys.dues_payment_system.users.Student;

import java.util.List;

public class CsvParseResult {

    private final int totalRows;
    private final List<Student> validUsers;
    private final List<String> skippedReasons;

    public CsvParseResult(int totalRows, List<Student> validUsers, List<String> skippedReasons) {
        this.totalRows = totalRows;
        this.validUsers = validUsers;
        this.skippedReasons = skippedReasons;
    }

    public int getTotalRows() { return totalRows; }
    public List<Student> getValidUsers() { return validUsers; }
    public List<String> getSkippedReasons() { return skippedReasons; }
}
