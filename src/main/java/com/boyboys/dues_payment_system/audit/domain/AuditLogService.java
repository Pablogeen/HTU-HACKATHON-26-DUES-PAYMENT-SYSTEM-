package com.boyboys.dues_payment_system.audit.domain;

import com.boyboys.dues_payment_system.audit.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ModelMapper modelMapper;

    public List<AuditLogResponse> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).
                stream().map(logs ->modelMapper.map(logs, AuditLogResponse.class)).toList();

    }

    public List<AuditLogResponse> getOperationalLogs(Pageable pageable) {
        return auditLogRepository.findOperationalLogs(pageable)
                .stream().map(logs -> modelMapper.map(logs, AuditLogResponse.class)).toList();
    }

    public List<AuditLogResponse> getLogsByPerformedBy(String performedBy, Pageable pageable) {
        return auditLogRepository.findByPerformedByOrderByCreatedAtDesc(performedBy, pageable)
                .stream().map(logs -> modelMapper.map(logs, AuditLogResponse.class)).toList();
    }

    public List<AuditLogResponse> getLogsByEntityType(String entityType, Pageable pageable) {
        return auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, pageable)
                .stream().map(logs -> modelMapper.map(logs, AuditLogResponse.class)).toList();
    }

    public List<AuditLogResponse> getLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByActionOrderByCreatedAtDesc(action, pageable)
                .stream().map(logs -> modelMapper.map(logs, AuditLogResponse.class)).toList();
    }

}
