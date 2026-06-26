package com.boyboys.dues_payment_system.payment.domain;

import com.boyboys.dues_payment_system.student.Student;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payments  ", description = "Endpoints to enable Payments")
public class TransactionController {

    private final TransactionService paymentService;

    @Tag(name = "Initialize Payments", description = "This endpoint enable initialization of payments")
    @PostMapping("/initialize")
    @PreAuthorize("hasAnyAuthority('STUDENT','PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<InitializePaymentResponse> initializePayment(
            @AuthenticationPrincipal Student student) {
        log.info("Payment initialization request for student: {}", student.getEmail());
        InitializePaymentResponse response = paymentService.initializePayment(student.getEmail());
        log.info("Payment initialized for student: {}", student.getEmail());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Tag(name = "Webhook", description = "Endpoints to validate payments from Paystack")
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody byte[] payload,
            @RequestHeader("x-paystack-signature") String paystackSignature,
            HttpServletRequest request) {
        log.info("Webhook received from Paystack");
        paymentService.handleWebhook(payload, paystackSignature, request);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Tag(name = "Payment Status ", description = "Getting the Payment status of a payment using payment reference")
    @GetMapping("/status/{reference}")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<TransactionStatusResponse> getPaymentStatus(@PathVariable String reference) {
        log.info("Payment status request for reference: {}", reference);
        TransactionStatusResponse response = paymentService.getPaymentStatus(reference);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Tag(name = "All Transactions  ", description = "Endpoints to get all transactions")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(@RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size) {
        log.info("Getting all transactions");
        Pageable pageable = PageRequest.of(page, size);
        List<TransactionResponse> transactions = paymentService.getAllTransactions(pageable);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @Tag(name = "Individual Transaction  ", description = "Endpoints to get individual Transactions made")
    @GetMapping("/student")
    @PreAuthorize("hasAnyAuthority('STUDENT','PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<List<TransactionResponse>> getStudentTransactions(
            @AuthenticationPrincipal Student student) {
        log.info("Getting transactions for student: {}", student.getEmail());
        List<TransactionResponse> transactions = paymentService.getStudentTransactions(student.getEmail());
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }
}
