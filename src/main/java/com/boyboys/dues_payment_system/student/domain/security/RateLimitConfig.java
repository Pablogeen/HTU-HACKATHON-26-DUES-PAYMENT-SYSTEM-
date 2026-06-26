package com.boyboys.dues_payment_system.student.domain.security;

import io.github.bucket4j.BucketConfiguration;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class RateLimitConfig {

    public BucketConfiguration authConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(5)
                        .refillIntervally(5, Duration.ofMinutes(1)))
                .build();
    }

    public BucketConfiguration studentsConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(40)
                        .refillIntervally(40, Duration.ofMinutes(1)))
                .build();
    }

    public BucketConfiguration paymentsConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(10)
                        .refillIntervally(10, Duration.ofMinutes(1)))
                .build();
    }


    public BucketConfiguration receiptsConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(30)
                        .refillIntervally(30, Duration.ofMinutes(1)))
                .build();
    }

    public BucketConfiguration reportsConfig() {
        return BucketConfiguration.builder()
                .addLimit(limit -> limit
                        .capacity(30)
                        .refillGreedy(30, Duration.ofMinutes(1)))
                .build();
    }
}
