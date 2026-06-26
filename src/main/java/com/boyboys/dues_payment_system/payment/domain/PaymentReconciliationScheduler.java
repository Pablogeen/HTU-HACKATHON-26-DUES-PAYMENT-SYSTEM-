package com.boyboys.dues_payment_system.payment.domain;

import com.boyboys.dues_payment_system.payment.PaymentException;
import com.boyboys.dues_payment_system.payment.Transaction;
import com.boyboys.dues_payment_system.payment.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentReconciliationScheduler {

    private final TransactionRepository transactionRepository;
    private final PayStackClient payStackClient;
    private final TransactionHelper transactionHelper;

    private static final int PENDING_THRESHOLD_MINUTES = 30;
    private static final int FAILED_THRESHOLD_HOURS = 24;

    @Scheduled(fixedDelay = 30 * 60 * 1000)
    @Transactional
    public void reconcilePendingTransactions() {
        log.info("Starting payment reconciliation scheduler");

        LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(PENDING_THRESHOLD_MINUTES);
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(FAILED_THRESHOLD_HOURS);

        List<Transaction> pendingTransactions = transactionRepository
                                           .findPendingTransactionsOlderThan(thirtyMinutesAgo);

        if (pendingTransactions.isEmpty()) {
            log.info("No pending transactions to reconcile");
            return;
        }

        log.info("Found {} pending transactions to reconcile", pendingTransactions.size());

        for (Transaction transaction : pendingTransactions) {
            try {
                if (transaction.getCreatedAt().isBefore(twentyFourHoursAgo)) {
                    transactionHelper.markAsFailed(transaction, "Transaction expired after 24 hours");
                    continue;
                }

                PaystackVerifyResponse verifyResponse = payStackClient.verifyPayment(transaction.getReference());
                String paystackStatus = verifyResponse.getData().getStatus();

                switch (paystackStatus) {
                    case "success" -> transactionHelper.handleSuccess(transaction);
                    case "failed", "abandoned" -> transactionHelper.markAsFailed(transaction, "Paystack status: " + paystackStatus);
                    default -> log.info("Transaction {} still in progress with status: {}",
                            transaction.getReference(), paystackStatus);
                }

            } catch (PaymentException e) {
                log.warn("Could not reconcile transaction {} - Paystack unreachable: {}",
                        transaction.getReference(), e.getMessage());
            } catch (Exception e) {
                log.error("Unexpected error reconciling transaction {}: {}",
                        transaction.getReference(), e.getMessage());
            }
        }

        log.info("Payment reconciliation completed");
    }


}
