package com.boyboys.dues_payment_system;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    @Bean
    public Counter paymentInitializedCounter(MeterRegistry registry) {
        return Counter.builder("payment.initialized")
                .description("Total number of payments initialized")
                .register(registry);
    }

    @Bean
    public Counter paymentSucceededCounter(MeterRegistry registry) {
        return Counter.builder("payment.succeeded")
                .description("Total number of payments succeeded")
                .register(registry);
    }

    @Bean
    public Counter paymentFailedCounter(MeterRegistry registry) {
        return Counter.builder("payment.failed")
                .description("Total number of payments failed")
                .register(registry);
    }

    @Bean
    public Counter studentImportedCounter(MeterRegistry registry) {
        return Counter.builder("student.imported")
                .description("Total number of students imported")
                .register(registry);
    }

    @Bean
    public Counter otpSentCounter(MeterRegistry registry) {
        return Counter.builder("otp.sent")
                .description("Total number of OTPs sent")
                .register(registry);
    }

    @Bean
    public Counter otpVerifiedCounter(MeterRegistry registry) {
        return Counter.builder("otp.verified")
                .description("Total number of OTPs verified successfully")
                .register(registry);
    }
}
