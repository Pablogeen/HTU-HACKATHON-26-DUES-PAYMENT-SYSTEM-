package com.boyboys.dues_payment_system.payment.domain;

import com.boyboys.dues_payment_system.payment.PaymentSucceededEvent;
import com.boyboys.dues_payment_system.student.PaymentStatus;
import com.boyboys.dues_payment_system.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class TransactionHelper {

    private final TransactionRepository transactionRepository;
    private final StudentRepository studentRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final long DUES_AMOUNT_CEDIS = 100L;
    private static final long PESEWAS_MULTIPLIER = 100L;

    public String generateReference() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYT0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder("COMPSSA-");
        for(int i = 0; i < 6; i++){
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public long convertCedisToPesewas(long amountInCedis) {
        return amountInCedis * PESEWAS_MULTIPLIER;
    }

    public long getDuesAmountInPesewas() {
        return convertCedisToPesewas(DUES_AMOUNT_CEDIS);
    }

    public void handleSuccess(Transaction transaction) {
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setPaidAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        transaction.getStudent().setPaymentStatus(PaymentStatus.PAID);
        studentRepository.save(transaction.getStudent());

        log.info("Reconciliation: Transaction {} marked as PAID", transaction.getReference());

        eventPublisher.publishEvent(new PaymentSucceededEvent(
                transaction.getStudent().getEmail(),
                transaction.getStudent().getFirstName(),
                transaction.getReference()));
        log.info("Payment succeeded event published");
    }

    public void markAsFailed(Transaction transaction, String reason) {
        transaction.setStatus(TransactionStatus.FAILED);
        transactionRepository.save(transaction);
        log.info("Reconciliation: Transaction {} marked as FAILED — {}",
                transaction.getReference(), reason);
    }
}