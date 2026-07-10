package com.boyboys.dues_payment_system.audit.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<AuditLog> findByPerformedByOrderByCreatedAtDesc(String performedBy, Pageable pageable);

    Page<AuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType, Pageable pageable);

    Page<AuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.entityType IN ('STUDENT', 'TRANSACTION') ORDER BY a.createdAt DESC")
    Page<AuditLog> findOperationalLogs(Pageable pageable);
}
