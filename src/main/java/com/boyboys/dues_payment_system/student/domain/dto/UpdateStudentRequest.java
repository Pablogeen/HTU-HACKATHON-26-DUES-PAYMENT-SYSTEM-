package com.boyboys.dues_payment_system.student.domain.dto;

import com.boyboys.dues_payment_system.student.Programme;
import com.boyboys.dues_payment_system.student.domain.Level;
import com.boyboys.dues_payment_system.student.domain.Qualification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStudentRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String middleName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotNull(message = "Level is required")
    private Level level;

    @NotBlank(message = "Last name is required")
    private String phoneNumber;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotBlank(message = "Last name is required")
    private Qualification qualificationType;

    @NotNull(message = "Programme is required")
    private Programme programme;


}
