package com.boyboys.dues_payment_system.student.domain.dto;

import lombok.Data;

@Data
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String role;
}
