package com.boyboys.dues_payment_system.student.domain.dto;

import java.time.Instant;

public record LoginResponse(String token, Instant expiresAt, String email, String role) {}

