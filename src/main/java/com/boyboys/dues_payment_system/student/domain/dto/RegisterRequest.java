package com.boyboys.dues_payment_system.student.domain.dto;

import com.boyboys.dues_payment_system.student.Programme;
import com.boyboys.dues_payment_system.student.Level;
import com.boyboys.dues_payment_system.student.domain.Qualification;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Pattern(regexp = "^[a-zA-Z\\s]+$",message = "Invalid First Name")
    private String firstName;

    @Pattern(regexp = "^[a-zA-Z\\s]+$",message = "Invalid Middle name")
    private String middleName;

    @NotBlank(message = "Last name is required")
    @Pattern(regexp = "^[a-zA-Z\\s]+$",message = "Invalid Last Name")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotNull(message = "Level is required")
    private Level level;

    @NotBlank(message = "Phone Number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$",message = "Invalid Phone Number")
    private String phoneNumber;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotNull(message = "Programme is required")
    private Programme programme;

    @NotNull(message = "Last name is required")
    private Qualification qualificationType;
}
