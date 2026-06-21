-- Create DuesFlow Schema
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(150) NOT NULL,
    entity_affected VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL
);

-- Seed Initial System Roles
INSERT INTO roles (name, description) VALUES
('ROLE_FINANCIAL_SECRETARY', 'Manager for Daily Financial Operations'),
('ROLE_PRESIDENT', 'Governance and Read-only Executive Monitor'),
('ROLE_SUPER_ADMIN', 'Platform Security and Core Org Setup Owner');

-- Seed Permission Definitions
INSERT INTO permissions (name, description) VALUES
('VIEW_STUDENTS', 'Permission to view and search student list'),
('EDIT_STUDENTS', 'Permission to edit details, de/activate, or upload student portfolios'),
('IMPORT_CSV', 'Permission to run batch integrations via CSV records'),
('CONFIGURE_DUES', 'Permission to configure base fees, billing dates, and payment lines'),
('VIEW_PAYMENTS', 'Permission to review transactions and accounting metrics'),
('VERIFY_PAYMENTS', 'Permission to confirm manual payments or initiate state audits'),
('GENERATE_RECEIPTS', 'Permission to sign transactional receipts'),
('FINANCIAL_CLEARANCE', 'Permission to check or override student clearance statuses'),
('CREATE_EVENTS', 'Permission to draft organization events'),
('MANAGE_EVENTS', 'Permission to change events details, configure ticket thresholds'),
('PUBLISH_ANNOUNCEMENTS', 'Permission to release broadcast alerts'),
('VIEW_ANALYTICS', 'Permission to monitor overall system financial ratios'),
('VIEW_AUDIT_LOGS', 'Permission to read system compliance tracks'),
('ASSIGN_ROLES', 'Permission to upgrade/downgrade executive configurations'),
('ORGANIZATION_SETTINGS', 'Permission to alter institutional criteria and attributes'),
('AUTHENTICATION_SETTINGS', 'Permission to customize OTP thresholds and session states'),
('CONFIGURE_PAYSTACK', 'Permission to configure payment token infrastructure'),
('BACKUP_DATABASE', 'Permission to trigger on-demand data snapshot routines');

-- Map Permission Allocations mapped strictly from our Permission Matrix
-- Role 1: Financial Secretary
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_FINANCIAL_SECRETARY' AND p.name IN (
    'VIEW_STUDENTS', 'EDIT_STUDENTS', 'IMPORT_CSV', 'CONFIGURE_DUES', 'VIEW_PAYMENTS', 'VERIFY_PAYMENTS',
    'GENERATE_RECEIPTS', 'FINANCIAL_CLEARANCE', 'CREATE_EVENTS', 'MANAGE_EVENTS', 'PUBLISH_ANNOUNCEMENTS',
    'VIEW_ANALYTICS'
);

-- Role 2: President
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_PRESIDENT' AND p.name IN (
    'VIEW_STUDENTS', 'VIEW_PAYMENTS', 'PUBLISH_ANNOUNCEMENTS', 'VIEW_ANALYTICS', 'VIEW_AUDIT_LOGS'
);

-- Role 3: Super Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_SUPER_ADMIN' AND p.name IN (
    'VIEW_STUDENTS', 'EDIT_STUDENTS', 'IMPORT_CSV', 'CONFIGURE_DUES', 'VIEW_PAYMENTS', 'VERIFY_PAYMENTS',
    'GENERATE_RECEIPTS', 'FINANCIAL_CLEARANCE', 'CREATE_EVENTS', 'MANAGE_EVENTS', 'PUBLISH_ANNOUNCEMENTS',
    'VIEW_ANALYTICS', 'VIEW_AUDIT_LOGS', 'ASSIGN_ROLES', 'ORGANIZATION_SETTINGS', 'AUTHENTICATION_SETTINGS',
    'CONFIGURE_PAYSTACK', 'BACKUP_DATABASE'
);

-- CREATE IMMUTABLE DATABASE LOGS PROTECTION TRIGGER
CREATE OR REPLACE FUNCTION protect_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        RAISE EXCEPTION 'CRITICAL SECURITY BREACH: Audit records are immutable. Operation disallowed.';
    ELSIF (TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'CRITICAL SECURITY BREACH: Audit records cannot be modified once written.';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_immutable_audits
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION protect_audit_logs();
