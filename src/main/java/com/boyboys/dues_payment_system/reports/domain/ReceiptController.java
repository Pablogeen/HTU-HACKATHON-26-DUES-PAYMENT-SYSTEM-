package com.boyboys.dues_payment_system.reports.domain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/receipts")
@RequiredArgsConstructor
@Slf4j
public class ReceiptController {

    private final ReceiptService receiptService;

    @GetMapping("/{reference}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable String reference) {
        log.info("Receipt download request for reference: {}", reference);
        byte[] receipt = receiptService.downloadReceipt(reference);
        log.info("Receipt generated for reference: {}", reference);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"receipt-" + reference + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(receipt);
    }
}
