package com.boyboys.dues_payment_system.audit;

public record AuditEvent(
        AuditAction action,
        String entityType,
        String entityId,
        String performedBy,
        Object oldValue,
        Object newValue
) {}