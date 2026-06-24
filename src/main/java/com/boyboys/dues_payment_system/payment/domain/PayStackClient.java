package com.boyboys.dues_payment_system.payment.domain;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Component
@Slf4j
public class PayStackClient {

    private final RestClient restClient;

    @Value("${paystack.secret}")
    private String secretKey;

    @Value("${paystack.initialize.url}")
    private String initializeUrl;

    public PayStackClient() {
        this.restClient = RestClient.builder()
                .build();
    }

    public InitializePaymentResponse initializePayment(InitializePaymentRequest request) {
        log.info("Initializing payment with Paystack for reference: {}", request.getReference());
        try {
            InitializePaymentResponse response = restClient.post()
                    .uri(initializeUrl)
                    .header("Authorization", "Bearer " + secretKey)
                    .header("Content-Type", "application/json")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        log.error("Paystack client error: {} - {}", res.getStatusCode(), res.getStatusText());
                        throw new PaymentException("Payment initialization failed: " + res.getStatusText());
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        log.error("Paystack server error: {} - {}", res.getStatusCode(), res.getStatusText());
                        throw new PaymentException("Paystack is currently unavailable. Please try again later");
                    })
                    .body(InitializePaymentResponse.class);

            if (response == null || response.getAuthorizationUrl() == null)  {
                log.error("Paystack returned unsuccessful response for reference: {}", request.getReference());
                throw new PaymentException("Payment initialization failed. Please try again");
            }

            log.info("Payment initialized successfully with Paystack for reference: {}", request.getReference());
            return response;

        } catch (ResourceAccessException e) {
            log.error("Timeout or connection error while initializing payment: {}", e.getMessage());
            throw new PaymentException("Unable to reach payment provider. Please try again later");
        }
    }
}
