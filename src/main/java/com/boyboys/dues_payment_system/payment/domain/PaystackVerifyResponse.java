package com.boyboys.dues_payment_system.payment.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaystackVerifyResponse {

    private boolean status;
    private String message;
    private DataPayload data;

    @Data
    @Builder
    public static class DataPayload {

        @JsonProperty("authorization_url")
        private String authorizationUrl;

        @JsonProperty("access_code")
        private String accessCode;

        private String reference;

        private String status;
    }
}