CREATE TABLE audit_log (
                           id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                           action       VARCHAR(50) NOT NULL,
                           entity_type  VARCHAR(50) NOT NULL,
                           entity_id    VARCHAR(100) NOT NULL,
                           performed_by VARCHAR(100) NOT NULL,
                           old_value    TEXT,
                           new_value    TEXT,
                           created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_performed_by ON audit_log(performed_by);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);