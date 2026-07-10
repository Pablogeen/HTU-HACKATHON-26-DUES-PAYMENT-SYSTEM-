package com.boyboys.dues_payment_system.audit.domain;

import com.boyboys.dues_payment_system.audit.AuditEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @ApplicationModuleListener
    public void onAuditEvent(AuditEvent event) {
        log.info("Audit event received: {} on {} by {}",
                event.action(), event.entityType(), event.performedBy());
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(event.action().name())
                    .entityType(event.entityType())
                    .entityId(event.entityId())
                    .performedBy(event.performedBy())
                    .oldValue(event.oldValue() != null ?
                            objectMapper.writeValueAsString(event.oldValue()) : null)
                    .newValue(event.newValue() != null ?
                            objectMapper.writeValueAsString(event.newValue()) : null)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
            log.info("Audit log saved successfully for action: {}", event.action());
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }
}
