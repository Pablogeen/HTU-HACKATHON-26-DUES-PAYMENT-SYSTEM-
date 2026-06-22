package com.boyboys.dues_payment_system.users.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public class UpdateStudentRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String middleName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotNull(message = "Level is required")
    private Integer level;

    @NotBlank(message = "Last name is required")
    private String phoneNumber;

    @NotBlank(message = "Last name is required")
    private String qualification;

}
