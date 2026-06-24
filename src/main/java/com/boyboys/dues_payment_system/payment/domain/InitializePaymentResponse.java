package com.boyboys.dues_payment_system.payment.domain;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InitializePaymentResponse {

    private String authorizationUrl;
    private String accessCode;
    private String reference;
    private TransactionStatus status;
}
