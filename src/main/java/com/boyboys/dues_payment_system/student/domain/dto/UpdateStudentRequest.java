package com.boyboys.dues_payment_system.student.domain.dto;

import com.boyboys.dues_payment_system.student.Programme;
import com.boyboys.dues_payment_system.student.Level;
import com.boyboys.dues_payment_system.student.domain.Qualification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateStudentRequest {

    @NotBlank(message = "First name is required")
    @Pattern(regexp = "^[a-zA-Z\\s]+$",message = "Invalid First Name")
    private String firstName;

    @Pattern(regexp = "^[a-zA-Z\\s]+$",message = "Invalid Middle Name")
    private String middleName;

    @NotBlank(message = "Last name is required")
    @Pattern(regexp = "^[a-zA-Z\\s]+$",message = "Invalid Last Name")
    private String lastName;

    @NotNull(message = "Level is required")
    private Level level;

    @NotBlank(message = "Phone Number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$",message = "Invalid Phone Number")
    private String phoneNumber;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotNull(message = "Qualification name is required")
    private Qualification qualificationType;

    @NotNull(message = "Programme is required")
    private Programme programme;


}
