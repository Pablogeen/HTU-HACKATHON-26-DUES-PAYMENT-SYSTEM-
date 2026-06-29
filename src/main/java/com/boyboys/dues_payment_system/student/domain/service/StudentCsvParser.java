package com.boyboys.dues_payment_system.student.domain.service;


import com.boyboys.dues_payment_system.student.Programme;
import com.boyboys.dues_payment_system.student.Level;
import com.boyboys.dues_payment_system.student.domain.Qualification;
import com.boyboys.dues_payment_system.student.domain.Role;
import com.boyboys.dues_payment_system.student.Student;
import com.boyboys.dues_payment_system.student.PaymentStatus;
import com.boyboys.dues_payment_system.student.domain.dto.CsvParseResult;
import com.boyboys.dues_payment_system.student.domain.exception.InvalidFileException;
import io.micrometer.core.instrument.Counter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class StudentCsvParser {

    private final Counter studentImportedCounter;

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final List<String> VALID_LEVELS = List.of("L100", "L200", "L300", "L400");
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

                if (columns.length != 9) {
                    skippedReasons.add("Row " + totalRows + ": Invalid number of columns");
                    continue;
                }

                String firstName = sanitizeCsvField(columns[0].trim());
                String middleName = sanitizeCsvField(columns[1].trim());
                String lastName = sanitizeCsvField(columns[2].trim());
                String email = sanitizeCsvField(columns[3].trim());
                String phoneNumber = sanitizeCsvField(columns[4].trim());
                String levelStr = sanitizeCsvField(columns[5].trim());
                String qualification = sanitizeCsvField(columns[6].trim());
                String academicYear = sanitizeCsvField(columns[7].trim());
                String programmeStr = sanitizeCsvField(columns[8].trim());

                if (hasBlankFields(firstName, lastName, email, phoneNumber, levelStr, qualification, academicYear, programmeStr)) {
                    skippedReasons.add("Row " + totalRows + ": One or more required fields are blank");
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

                if (!VALID_LEVELS.contains(levelStr)) {
                    skippedReasons.add("Row " + totalRows + ": Level must be L100, L200, L300 or L400 - " + levelStr);
                    continue;
                }


                Programme programme;
                try {
                    programme = Programme.valueOf(programmeStr.toUpperCase().replace(" ", "_"));
                } catch (IllegalArgumentException e) {
                    skippedReasons.add("Row " + totalRows + ": Invalid programme value - " + programmeStr);
                    continue;
                }

                Student student = new Student();
                student.setFirstName(firstName);
                student.setMiddleName(middleName.isEmpty() ? null : middleName);
                student.setLastName(lastName);
                student.setEmail(email);
                student.setPhoneNumber(phoneNumber);
                student.setLevel(Level.valueOf(levelStr));
                student.setQualificationType(Qualification.valueOf(qualification.toUpperCase()));
                student.setRole(Role.STUDENT);
                student.setPaymentStatus(PaymentStatus.UNPAID);
                student.setAcademicYear(academicYear);
                student.setProgramme(programme);

                validUsers.add(student);
                studentImportedCounter.increment();
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

    private String sanitizeCsvField(String value) {
        if (value == null) return null;
        if (value.startsWith("=") || value.startsWith("+") ||
                value.startsWith("-") || value.startsWith("@")) {
            value = "'" + value;
        }
        return value;
    }
}
