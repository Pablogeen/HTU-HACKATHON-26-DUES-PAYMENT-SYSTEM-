package com.boyboys.dues_payment_system.payment.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InitializePaymentRequest {

    private String email;
    private Long amount;
    private String reference;

    @JsonProperty("callback_url")
    private String callbackUrl;
}
