package com.boyboys.dues_payment_system.users.domain.service;


import com.boyboys.dues_payment_system.users.Role;
import com.boyboys.dues_payment_system.users.Student;
import com.boyboys.dues_payment_system.users.domain.PaymentStatus;
import com.boyboys.dues_payment_system.users.domain.dto.CsvParseResult;
import com.boyboys.dues_payment_system.users.domain.exception.InvalidFileException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Component
public class StudentCsvParser {

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final List<Integer> VALID_LEVELS = List.of(100, 200, 300, 400);
    private static final List<String> VALID_CONTENT_TYPES = List.of("text/csv", "application/vnd.ms-excel");

    public CsvParseResult parse(MultipartFile file) {
        validateFile(file);

        List<Student> validUsers = new ArrayList<>();
        List<String> skippedReasons = new ArrayList<>();
        int totalRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                totalRows++;
                String[] columns = line.split(",");

                if (columns.length != 4) {
                    skippedReasons.add("Row " + totalRows + ": Invalid number of columns");
                    continue;
                }

                String firstName = columns[0].trim();
                String middleName = columns[1].trim();
                String lastName = columns[2].trim();
                String email = columns[3].trim();
                String phoneNumber = columns[4].trim();
                String levelStr = columns[5].trim();
                String qualification = columns[6].trim();

                if (hasBlankFields(firstName, lastName, email, phoneNumber , levelStr, qualification)) {
                    skippedReasons.add("Row " + totalRows + ": One or more fields are blank");
                    continue;
                }

                if (exceedsMaxLength(firstName, 100)) {
                    skippedReasons.add("Row " + totalRows + ": First name exceeds 100 characters");
                    continue;
                }
                if (exceedsMaxLength(middleName, 100)) {
                    skippedReasons.add("Row " + totalRows + ": Middle name exceeds 100 characters");
                    continue;
                }
                if (exceedsMaxLength(lastName, 100)) {
                    skippedReasons.add("Row " + totalRows + ": Last name exceeds 100 characters");
                    continue;
                }

                if (exceedsMaxLength(email, 100)) {
                    skippedReasons.add("Row " + totalRows + ": Email exceeds 100 characters");
                    continue;
                }

                if (!isValidEmail(email)) {
                    skippedReasons.add("Row " + totalRows + ": Invalid email format - " + email);
                    continue;
                }
                if (exceedsMaxLength(phoneNumber, 100)) {
                    skippedReasons.add("Row " + totalRows + ": Phone Number exceeds 100 characters");
                    continue;
                }
                if (exceedsMaxLength(levelStr, 100)) {
                    skippedReasons.add("Row " + totalRows + ": Level exceeds 100 characters");
                    continue;
                }

                if (exceedsMaxLength(qualification, 100)) {
                    skippedReasons.add("Row " + totalRows + ": Qualification exceeds 100 characters");
                    continue;
                }

                Integer level;
                try {
                    level = Integer.parseInt(levelStr);
                } catch (NumberFormatException e) {
                    skippedReasons.add("Row " + totalRows + ": Invalid level value - " + levelStr);
                    continue;
                }

                if (!VALID_LEVELS.contains(level)) {
                    skippedReasons.add("Row " + totalRows + ": Level must be 100, 200, 300 or 400 - " + level);
                    continue;
                }


                Student user = new Student();
                user.setFirstName(firstName);
                user.setMiddleName(middleName.isEmpty() ? null : middleName);
                user.setLastName(lastName);
                user.setEmail(email);
                user.setPhoneNumber(phoneNumber);
                user.setLevel(level);
                user.setRole(Role.STUDENT);
                user.setPaymentStatus(PaymentStatus.UNPAID);

                validUsers.add(user);
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to read CSV file", e);
        }

        return new CsvParseResult(totalRows, validUsers, skippedReasons);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty or missing");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File size exceeds the 2MB limit");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".csv")) {
            throw new InvalidFileException("Only CSV files are allowed");
        }

        String contentType = file.getContentType();
        if (contentType == null || !VALID_CONTENT_TYPES.contains(contentType)) {
            throw new InvalidFileException("Invalid file content type");
        }
    }

    private boolean hasBlankFields(String... fields) {
        for (String field : fields) {
            if (field == null || field.isBlank()) return true;
        }
        return false;
    }

    private boolean exceedsMaxLength(String value, int maxLength) {
        return value.length() > maxLength;
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }
}
