package com.boyboys.dues_payment_system.users.domain.security;

import java.time.Instant;

public record JwtToken(String token, Instant expiresAt) {}
