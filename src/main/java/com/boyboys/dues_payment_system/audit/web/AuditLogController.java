package com.boyboys.dues_payment_system.audit.web;


import com.boyboys.dues_payment_system.audit.AuditLogResponse;
import com.boyboys.dues_payment_system.audit.domain.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Slf4j
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('PRESIDENT')")
    public ResponseEntity<List<AuditLogResponse>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("President fetching all audit logs");
        Pageable pageable = PageRequest.of(page, size);
        List<AuditLogResponse> logResponse = auditLogService.getAllLogs(pageable);
        return new ResponseEntity<>(logResponse, HttpStatus.OK);
    }

    @GetMapping("/operational")
    @PreAuthorize("hasAuthority('FINANCIAL_SECRETARY')")
    public ResponseEntity<List<AuditLogResponse>> getOperationalLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Financial Secretary fetching operational audit logs");
        Pageable pageable = PageRequest.of(page, size);
        List<AuditLogResponse> logResponse = auditLogService.getOperationalLogs(pageable);
        log.info("Audit for operational logs response given.");
        return new ResponseEntity<>(logResponse, HttpStatus.OK);
    }

    @GetMapping("/by-user")
    @PreAuthorize("hasAuthority('PRESIDENT')")
    public ResponseEntity<List<AuditLogResponse>> getLogsByUser(
            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching audit logs for user: {}", email);
        Pageable pageable = PageRequest.of(page, size);
        List<AuditLogResponse> logResponse =  auditLogService.getLogsByPerformedBy(email, pageable);
        log.info("Audit logged successfully");
        return new ResponseEntity<>(logResponse, HttpStatus.OK);
    }

    @GetMapping("/by-entity")
    @PreAuthorize("hasAuthority('PRESIDENT')")
    public ResponseEntity<List<AuditLogResponse>> getLogsByEntity(
            @RequestParam String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching audit logs for entity: {}", entityType);
        Pageable pageable = PageRequest.of(page, size);
       List<AuditLogResponse> logResponse = auditLogService.getLogsByEntityType(entityType, pageable);
       log.info("Audit logged");
        return new ResponseEntity<>(logResponse, HttpStatus.OK);
    }

    @GetMapping("/by-action")
    @PreAuthorize("hasAuthority('PRESIDENT')")
    public ResponseEntity<List<AuditLogResponse>> getLogsByAction(
            @RequestParam String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching audit logs for action: {}", action);
        Pageable pageable = PageRequest.of(page, size);
        List<AuditLogResponse> logResponse =  auditLogService.getLogsByAction(action, pageable);
        log.info("Audit marked");
        return new ResponseEntity<>(logResponse, HttpStatus.OK);
    }
}
