package com.boyboys.dues_payment_system.audit;


import java.time.LocalDateTime;

public record AuditLogResponse(
        String action,
        String entityType,
        String entityId,
        String performedBy,
        String oldValue,
        String newValue,
        LocalDateTime createdAt
) {}

