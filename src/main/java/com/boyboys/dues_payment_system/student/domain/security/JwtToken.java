package com.boyboys.dues_payment_system.student.domain.security;

import java.time.Instant;

public record JwtToken(String token, Instant expiresAt) {}
