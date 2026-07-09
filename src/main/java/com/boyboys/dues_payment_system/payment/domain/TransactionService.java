package com.boyboys.dues_payment_system.payment.domain;

import com.boyboys.dues_payment_system.payment.*;
import com.boyboys.dues_payment_system.student.PaymentStatus;
import com.boyboys.dues_payment_system.student.Student;
import com.boyboys.dues_payment_system.student.StudentRepository;
import com.boyboys.dues_payment_system.student.StudentNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.Counter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionHelper transactionHelper;
    private final StudentRepository studentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PayStackClient paystackClient;
    private final WebhookHelper webhookHelper;
    private final ObjectMapper objectMapper;
    private final Counter paymentInitializedCounter;
    private final Counter paymentSucceededCounter;
    private final Counter paymentFailedCounter;

    @Value("${paystack.callback.url}")
    private String callbackUrl;

    @Transactional
    public InitializePaymentResponse initializePayment(String email) {
        log.info("Initializing payment for student: {}", email);

        //Pessemitic lock implementedto prevent race conditions
        Student student = studentRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));

        if (transactionRepository.existsByStudentIdAndStatus(student.getId(), TransactionStatus.SUCCESS)) {
            throw new PaymentException("You have already paid your dues for this academic year");
        }

        //Lets check if the student is already having a pending status if yes we don't allow payment until we verify the source of truth.
        if (transactionRepository.existsByStudentIdAndStatus(student.getId(), TransactionStatus.PENDING)) {
            Transaction existing = transactionRepository.findByStudentIdAndStatus(student.getId(), TransactionStatus.PENDING)
                    .orElseThrow(() -> new PaymentException("Transaction not found"));
            log.info("Returning existing pending transaction for student: {}", email);
            return InitializePaymentResponse.builder()
                    .authorizationUrl("https://checkout.paystack.com/"+existing.getAccessCode())
                    .accessCode(existing.getAccessCode())
                    .reference(existing.getReference())
                    .status(TransactionStatus.PENDING)
                    .build();
        }

        String reference = transactionHelper.generateReference();
        log.info("Reference generated: {}",reference);
        long amount = transactionHelper.getDuesAmountInPesewas();
        log.info("Amount generated: {}",amount);

        PaystackInitializeRequest paystackRequest = PaystackInitializeRequest.builder()
                .email(student.getEmail())
                .amount(amount)
                .reference(reference)
                .callbackUrl(callbackUrl)
                .build();

        PaystackVerifyResponse paystackResponse = paystackClient.initializePayment(paystackRequest);

        Transaction transaction = new Transaction();
        transaction.setReference(reference);
        transaction.setPaystackReference(paystackResponse.getData().getReference());
        transaction.setAccessCode(paystackResponse.getData().getAccessCode());
        transaction.setAmount(amount);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setStudent(student);

        transactionRepository.save(transaction);
        log.info("Transaction saved successfully for student: {}", email);
        paymentInitializedCounter.increment();

        return InitializePaymentResponse.builder()
                .authorizationUrl(paystackResponse.getData().getAuthorizationUrl())
                .accessCode(paystackResponse.getData().getAccessCode())
                .reference(reference)
                .status(TransactionStatus.PENDING)
                .build();
    }


    @Transactional
    public void handleWebhook(byte[] payload, String paystackSignature, HttpServletRequest request) {
        log.info("Webhook received from Paystack");

        if (!webhookHelper.isValidIp(request)) {
            log.warn("Webhook request from unauthorized IP");
            throw new PaymentException("Unauthorized webhook request");
        }

        if (!webhookHelper.isValidSignature(payload, paystackSignature)) {
            log.warn("Invalid webhook signature");
            throw new PaymentException("Invalid webhook signature");
        }

        try {
            JsonNode webhookData = objectMapper.readTree(payload);
            String event = webhookData.get("event").asText();
            String reference = webhookData.get("data").get("reference").asText();
            // rest of the code remains the same


            log.info("Webhook event: {} for reference: {}", event, reference);

            //Locks implemented here
            Transaction transaction = transactionRepository.findByReference(reference)
                    .orElseThrow(() -> new PaymentException("Transaction not found for reference: " + reference));

            switch (event) {
                case "charge.success" -> {
                    transaction.setStatus(TransactionStatus.SUCCESS);
                    transaction.setPaidAt(LocalDateTime.now());
                    transactionRepository.save(transaction);
                    transaction.getStudent().setPaymentStatus(PaymentStatus.PAID);
                    studentRepository.save(transaction.getStudent());
                    log.info("Payment successful for reference: {}", reference);
                    paymentSucceededCounter.increment();
                    eventPublisher.publishEvent(new PaymentSucceededEvent(transaction.getStudent().getEmail(), transaction.getStudent().getFirstName(), reference));
                }
                case "charge.failed" -> {
                    transaction.setStatus(TransactionStatus.FAILED);
                    transactionRepository.save(transaction);
                    log.info("Payment failed for reference: {}", reference);
                    paymentFailedCounter.increment();
                }
                default -> log.info("Unhandled webhook event: {}", event);
            }

        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
            throw new PaymentException("Error processing webhook");
        }
    }

    @Transactional
    public TransactionStatusResponse getPaymentStatus(String reference) {
        //Pessimistic locks implemented here
        Transaction transaction = transactionRepository.findByReference(reference)
                .orElseThrow(() -> new PaymentException("Transaction not found"));
        return new TransactionStatusResponse(
                transaction.getReference(),
                transaction.getStatus(),
                transaction.getPaidAt()
        );
    }

    public List<TransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable)
                .stream()
                .map(t -> new TransactionResponse(
                        t.getReference(),
                        t.getAmount(),
                        t.getStatus(),
                        t.getPaidAt(),
                        t.getCreatedAt(),
                        t.getStudent().getEmail()
                ))
                .toList();
    }

    public List<TransactionResponse> getStudentTransactions(String email) {
        //Pessimistic locks implemented here
        Student student = studentRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        return transactionRepository.findByStudentId(student.getId())
                .stream()
                .map(t -> new TransactionResponse(
                        t.getReference(),
                        t.getAmount(),
                        t.getStatus(),
                        t.getPaidAt(),
                        t.getCreatedAt(),
                        t.getStudent().getEmail()
                ))
                .toList();
    }
}
