package com.boyboys.dues_payment_system.users.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String middleName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Last name is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotNull(message = "Level is required")
    private Integer level;

    @NotBlank(message = "Last name is required")
    private String phoneNumber;

    @NotBlank(message = "Last name is required")
    private String qualification;
}
