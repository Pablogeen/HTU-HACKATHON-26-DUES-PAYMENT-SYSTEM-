package com.boyboys.dues_payment_system.users.domain.security;

import io.github.bucket4j.BucketConfiguration;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class RateLimitConfig {

    public BucketConfiguration loginConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(5)
                        .refillIntervally(5, Duration.ofMinutes(1)))
                .build();
    }

    public BucketConfiguration registerStudentConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(3)
                        .refillIntervally(3, Duration.ofMinutes(1)))
                .build();
    }

    public BucketConfiguration verifyConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(5)
                        .refillIntervally(5, Duration.ofMinutes(5)))
                .build();
    }

    public BucketConfiguration publicConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(60)
                        .refillGreedy(60, Duration.ofMinutes(1)))
                .build();
    }
}
