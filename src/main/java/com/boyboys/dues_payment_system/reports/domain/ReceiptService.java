package com.boyboys.dues_payment_system.reports.domain;

import com.boyboys.dues_payment_system.payment.PaymentException;
import com.boyboys.dues_payment_system.payment.Transaction;
import com.boyboys.dues_payment_system.payment.TransactionRepository;
import com.boyboys.dues_payment_system.payment.TransactionStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptService {

    private final TransactionRepository transactionRepository;
    private final ReceiptPdfGenerator receiptPdfGenerator;

    public byte[] downloadReceipt(String reference) {
        log.info("Receipt download request for reference: {}", reference);
        Transaction transaction = transactionRepository.findByReference(reference)
                .orElseThrow(() -> new PaymentException("Transaction not found for reference: " + reference));

        if (transaction.getStatus() != TransactionStatus.SUCCESS) {
            throw new PaymentException("Receipt only available for paid transactions");
        }

        return receiptPdfGenerator.generateReceipt(transaction);
    }
}
