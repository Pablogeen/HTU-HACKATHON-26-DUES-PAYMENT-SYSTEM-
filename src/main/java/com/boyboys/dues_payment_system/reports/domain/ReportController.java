package com.boyboys.dues_payment_system.reports.domain;


import com.boyboys.dues_payment_system.student.Programme;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final ReportPdfGenerator reportPdfGenerator;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<OverallSummaryResponse> getOverallSummary() {
        log.info("Overall summary report request received");
        OverallSummaryResponse summary = reportService.getOverallSummary();
        log.info("Overall summary report generated successfully");
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @GetMapping("/summary/download")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<byte[]> downloadOverallSummary() {
        log.info("Overall summary PDF download request received");
        OverallSummaryResponse summary = reportService.getOverallSummary();
        byte[] pdf = reportPdfGenerator.generateOverallSummaryPdf(summary);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"overall-summary-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/summary/programme/{programme}")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<ProgrammeDetailSummaryResponse> getProgrammeSummary(
            @PathVariable Programme programme) {
        log.info("Programme summary report request for: {}", programme);
        ProgrammeDetailSummaryResponse summary = reportService.getProgrammeSummary(programme);
        log.info("Programme summary report generated for: {}", programme);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @GetMapping("/summary/programme/{programme}/download")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<byte[]> downloadProgrammeSummary(@PathVariable Programme programme) {
        log.info("Programme summary PDF download request for: {}", programme);
        ProgrammeDetailSummaryResponse summary = reportService.getProgrammeSummary(programme);
        byte[] pdf = reportPdfGenerator.generateProgrammeSummaryPdf(summary);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + programme.name().toLowerCase() + "-summary-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<List<TransactionReportResponse>> getTransactionHistory() {
        log.info("Transaction history report request received");
        List<TransactionReportResponse> transactions = reportService.getTransactionHistory();
        log.info("Transaction history report generated successfully");
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @GetMapping("/transactions/download")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<byte[]> downloadTransactionHistory() {
        log.info("Transaction history PDF download request received");
        List<TransactionReportResponse> transactions = reportService.getTransactionHistory();
        byte[] pdf = reportPdfGenerator.generateTransactionHistoryPdf(transactions);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"transaction-history-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
