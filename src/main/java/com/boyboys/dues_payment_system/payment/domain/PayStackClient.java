package com.boyboys.dues_payment_system.payment.domain;

import com.boyboys.dues_payment_system.payment.PaymentException;
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

    @Value("${PAYSTACK_VERIFY_URL}")
    private String verifyUrl;

    public PayStackClient() {
        this.restClient = RestClient.builder()
                .build();
    }

    public PaystackVerifyResponse initializePayment(PaystackInitializeRequest request) {
        log.info("Initializing payment with Paystack for reference: {}", request.getReference());
        try {
            PaystackVerifyResponse response = restClient.post()
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
                    .body(PaystackVerifyResponse.class);

            if (response == null || response.getData() == null)  {
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




    public PaystackVerifyResponse verifyPayment(String reference) {
        log.info("Verifying payment with Paystack for reference: {}", reference);
        try {
            PaystackVerifyResponse response = restClient.get()
                    .uri(verifyUrl + "/" + reference)
                    .header("Authorization", "Bearer " + secretKey)
                    .header("Content-Type", "application/json")
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        log.error("Paystack client error during verify: {} - {}", res.getStatusCode(), res.getStatusText());
                        throw new PaymentException("Payment verification failed: " + res.getStatusText());
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        log.error("Paystack server error during verify: {} - {}", res.getStatusCode(), res.getStatusText());
                        throw new PaymentException("Paystack is currently unavailable. Please try again later");
                    })
                    .body(PaystackVerifyResponse.class);

            if (response == null || response.getData() == null) {
                log.error("Paystack returned null response for reference: {}", reference);
                throw new PaymentException("Payment verification failed. Please try again");
            }

            log.info("Payment verified successfully for reference: {}", reference);
            return response;

        } catch (ResourceAccessException e) {
            log.error("Timeout or connection error while verifying payment: {}", e.getMessage());
            throw new PaymentException("Unable to reach payment provider. Please try again later");
        }
    }
}
