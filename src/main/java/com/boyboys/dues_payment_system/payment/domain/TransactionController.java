package com.boyboys.dues_payment_system.payment.domain;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService paymentService;

    @PostMapping("/initialize")
    @PreAuthorize("hasAnyAuthority('STUDENT','PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<InitializePaymentResponse> initializePayment(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Payment initialization request for student: {}", userDetails.getUsername());
        InitializePaymentResponse response = paymentService.initializePayment(userDetails.getUsername());
        log.info("Payment initialized for student: {}", userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("x-paystack-signature") String paystackSignature,
            HttpServletRequest request) {
        log.info("Webhook received from Paystack");
        paymentService.handleWebhook(payload, paystackSignature, request);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/status/{reference}")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<TransactionStatusResponse> getPaymentStatus(@PathVariable String reference) {
        log.info("Payment status request for reference: {}", reference);
        TransactionStatusResponse response = paymentService.getPaymentStatus(reference);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(@RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size) {
        log.info("Getting all transactions");
        Pageable pageable = PageRequest.of(page, size);
        List<TransactionResponse> transactions = paymentService.getAllTransactions(pageable);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @GetMapping("/student")
    public ResponseEntity<List<TransactionResponse>> getStudentTransactions(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Getting transactions for student: {}", userDetails.getUsername());
        List<TransactionResponse> transactions = paymentService.getStudentTransactions(userDetails.getUsername());
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }
}
