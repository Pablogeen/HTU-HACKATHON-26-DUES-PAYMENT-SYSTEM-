# DuesFlow Enterprise-Grade System Blueprints & Specifications

This document contains the complete technical blueprints, system metrics, RESTful API endpoint definitions, RabbitMQ topologies, relational schemas, and infrastructure setup models for the DuesFlow University Financial Operations Platform.

---

## 1. Complete System Architecture

The DuesFlow platform is engineered using a robust, highly scalable, cloud-native **decoupled microservices architecture** configured for enterprise-grade university financial operations and SaaS multi-tenancy.

```
  [ Client Browser / WebApp ] <--> [ Nginx Reverse Proxy / SSL Termination ]
                                                 |
                                         [ API Gateway ]
                                                 |
              +----------------------------------+----------------------------------+
              |                                  |                                  |
     [ Auth Service ]                   [ Finance Service ]                 [ Event / Ticket Service ]
     (OAuth / OTP / BCrypt)             (Invoicing / Payments)              (ZXing QR / JWT Signature)
              |                                  |                                  |
              +-------------------+--------------+--------------+-------------------+
                                  |                             |
                       [ Redis Cache / Session ]             [ RabbitMQ Exchange ]
                                                                |
                                        +-----------------------+-----------------------+
                                        |                       |                       |
                               [ Notification Worker ]   [ Receipt Worker ]    [ Audit Worker ]
                                     (Mail/SMS)             (PDF Engine)         (Security CRM)
                                        |                       |                       |
                                        +-----------------------+-----------------------+
                                                                |
                                                      [ PostgreSQL DB Cluster ]
```

### Architectural Sub-Layers

1. **Edge Router & Security Control (Nginx & Spring Cloud Gateway)**:
   - Manages Rate Limiting (IP & API route tokens).
   - Handles SSL/TLS termination and routes traffic dynamically.
   - Restricts cross-origin resource requests (CORS validation) and sanitizes request payloads.

2. **Core Microservices (Spring Boot 3.x - Stateless Domain Drivers)**:
   - **Auth Service**: Manages student OTP lifecycles, executive session registries, tracking 2FA states.
   - **Finance App Service**: Coordinates Paystack callback endpoints, triggers immediate invoice generations.
   - **Ticket Engine**: Digitally signs QR ticket tickets with JWT cryptography to allow instant local client validating.

3. **Database & Data Store Layer (PostgreSQL & Redis)**:
   - PostgreSQL: Houses institutional configurations, logs, student ledgers, role specifications, with strong transaction isolation.
   - Redis Stack: Serves as an ephemeral ledger for quick student OTP caching (5 mins expiration), session registry, and API rate-limiting buckets.

4. **Asynchronous Event-Driven Messaging (RabbitMQ Cluster)**:
   - Uncouples high-load transactions from secondary routines (PDF receipts compilation, SMTP mail deliveries, tracking audit trails).
   - Uses durable queues with Dead Letter Exchanges (DLX) to guarantee zero loss of payment updates.

---

## 2. Relational Database Schema (PostgreSQL)

This production-grade PostgreSQL schema features strong data constraints, indexing strategies, and multi-tenant partitioning using `organization_id`.

```sql
-- ==========================================
-- 1. BASE ORGANIZATIONAL UNITS
-- ==========================================
CREATE TABLE organizations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT u_org_dept_code UNIQUE (organization_id, code)
);

-- ==========================================
-- 2. ACCOUNTS & USER ENTITIES
-- ==========================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permissions (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE role_permissions_bridge (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles_bridge (
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ==========================================
-- 3. STUDENT PORTAL DATA
-- ==========================================
CREATE TABLE students (
    index_number VARCHAR(100) PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(id),
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    academic_level VARCHAR(20) NOT NULL, -- '100', '200', '300', '400'
    outstanding_dues NUMERIC(12, 2) DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'PENDING', -- 'PAID', 'PENDING', 'OVERDUE', 'PARTIALLY_PAID'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. INVOICES, PAYMENTS & TRANSACTIONS
-- ==========================================
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(id),
    student_index VARCHAR(100) NOT NULL REFERENCES students(index_number) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(id),
    invoice_id VARCHAR(50) REFERENCES invoices(id),
    student_index VARCHAR(100) NOT NULL REFERENCES students(index_number),
    reference_id VARCHAR(100) UNIQUE NOT NULL, -- Paystack Reference
    amount NUMERIC(12, 2) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- 'Card', 'Mobile Money'
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'FAILED', 'REVERSED'
    email_used VARCHAR(255) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. EVENTS & EVENT TICKETS
-- ==========================================
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(id),
    department_id VARCHAR(50) REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    admission_fee NUMERIC(12, 2) DEFAULT 0.00,
    max_tickets INT DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_index VARCHAR(100) NOT NULL REFERENCES students(index_number) ON DELETE CASCADE,
    ticket_code VARCHAR(100) UNIQUE NOT NULL, -- Unique secure hash
    status VARCHAR(50) NOT NULL DEFAULT 'UNUSED', -- 'UNUSED', 'VERIFIED', 'REVOKED'
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scanned_at TIMESTAMP WITH TIME ZONE,
    cryptographic_signature TEXT NOT NULL
);

-- ==========================================
-- 6. IMMUTABLE SYSTEM AUDITS & TELEMETRY
-- ==========================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_identifier VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action_performed VARCHAR(100) NOT NULL,
    table_modified VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45) NOT NULL,
    device_signature TEXT NOT NULL
);

-- ==========================================
-- 7. SECURITY & TRANSACTION WORK-FLOW TABLES
-- ==========================================
CREATE TABLE otp_requests (
    id SERIAL PRIMARY KEY,
    index_number VARCHAR(100) NOT NULL,
    hashed_otp VARCHAR(255) NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_events (
    id VARCHAR(50) PRIMARY KEY,
    provider_reference VARCHAR(100) UNIQUE NOT NULL, -- Paystack Event ID
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'FAILED'
    processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEX OPTIMIZATIONS FOR HIGHEST AUDITING SPEED
-- ==========================================
CREATE INDEX idx_students_org ON students(organization_id);
CREATE INDEX idx_students_level ON students(academic_level);
CREATE INDEX idx_transactions_ref ON transactions(reference_id);
CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_audit_time ON audit_logs(timestamp DESC, organization_id);
CREATE INDEX idx_otp_verify ON otp_requests(index_number, expiry_time) WHERE is_verified = FALSE;
```

---

## 3. Spring Boot Backend Architecture

The domain matches high-level enterprise architectures configured with **stateless service tiers** and strict token filtering pipelines.

```
com.duesflow.backend
│
├── config
│   ├── OpenApiConfig.java          # Swagger 3 specifications
│   ├── RabbitMQConfig.java         # Queue & Exchange bindings
│   ├── RedisConfig.java            # OTP caches, session drivers
│   └── SecurityConfig.java         # Spring Security 6.x rules
│
├── domain
│   ├── common                      # Global entities & tracking
│   ├── student                     # Student verification workflow
│   ├── finance                     # Invoice management, Webhook routing
│   │   ├── model
│   │   │   ├── Transaction.java
│   │   │   └── Invoice.java
│   │   ├── repository
│   │   │   └── TransactionRepository.java
│   │   ├── service
│   │   │   └── PaystackWebhookService.java
│   │   └── controller
│   │       └── WebhookController.java
│   │
│   ├── ticket                      # Ticket creation & DXing QR generators
│   └── audit                       # System level logs tracking
│
├── security
│   ├── JwtAuthenticationFilter.java  # Token filtering pipeline
│   ├── JwtTokenProvider.java       # Token issuing & validation
│   └── CustomUserDetailsService.java
│
└── BackendApplication.java         # Application Entrypoint
```

---

## 4. RESTful API Specifications

All request and response payloads enforce strict JSON serialization. Bearer JWT authorization is mandatory on headers for secured endpoints.

### Authentication Endpoints

#### `POST /api/v1/auth/student-login`
- **Request Payload**:
  ```json
  {
    "indexNumber": "STU827364",
    "level": "400"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "OTP_SENT",
    "maskEmail": "e*******5@inst.edu.gh",
    "expirySeconds": 300
  }
  ```

#### `POST /api/v1/auth/student-verify`
- **Request Payload**:
  ```json
  {
    "indexNumber": "STU827364",
    "otpCode": "827461"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "student": {
      "indexNumber": "STU827364",
      "name": "Kofi Mensah",
      "email": "kmensah@inst.edu.gh",
      "level": "400"
    }
  }
  ```

---

## 5. RabbitMQ Asynchronous Message Broker Topology

DuesFlow coordinates distributed microservices actions using RabbitMQ. Critical payments records are strictly persisted BEFORE notifications, mail creations, and tickets generation are triggered as asynchronous observers.

```
 [ Paystack Webhook API ]
           |
           v
 [ Persist Transaction Records ] (Stateless Spring Core)
           |
           +--> Publish Payment Event to [ Topic Exchange: duesflow.exchange ]
                                                   |
      +------------------------+-------------------+--------------------+------------------------+
      | (Routing: payment.pay) | (Routing: qr.gen) | (Routing: mail.tx) | (Routing: audit.track) |
      v                        v                   v                    v                        v
 [ Queue: billing.calc ]  [ Queue: qr.calc ]  [ Queue: mail.smtp ] [ Queue: audit.log ]   [ Queue: webhook.retry ]
      |                        |                   |                    |                        |
      v                        v                   v                    v                        v
 [ Job Workers ]          [ Job Workers ]     [ Job Workers ]      [ Job Workers ]          [ DeadLetter Exchange ]
  (Outstanding Calc)      (ZXing QR Engine)    (HTML Mailer)       (Immutable Audit)         (Exponential Backoff)
```

1. **Exchange Platform Configuration**:
   - **Name**: `duesflow.exchange`
   - **Type**: `topic`
   - **Durability**: `Durable`

2. **Durable Queues Subscriptions**:
   - `billing.calc` (Routing: `payment.success`) -> Resolves balances & resets dues.
   - `qr.calc` (Routing: `payment.success`) -> Digitally signs a ticket payload and caches code.
   - `mail.smtp` (Routing: `payment.success`) -> Generates confirmation emails with attached QR.
   - `audit.log` (Routing: `*.*`) -> Feeds telemetry securely onto non-updatable audits.

---

## 6. Cryptographic QR Verification & Offline Operations

DuesFlow's QR tickets enforce secure cryptographic signatures instead of containing plain raw database IDs. This blocks malicious actors from scraping event admission gates.

### Signed JWT Ticket Design
The QR code encodes a standard JSON Web Signature (JWS) payload containing high-level validation metadata:
```json
{
  "sub": "INDEX827364",              -- Student Student Index Number
  "jti": "TKT-COMPSSA-9921827",       -- Unique Ticket Ledger ID
  "evt": "EVT-CS-2026-DINNER",       -- Event Target Code
  "name": "Evelyn Boateng",          -- Cached Student Display Name
  "org": "COMPSSA-U",                -- SaaS Organization Segment
  "iat": 1781902800,                 -- Issued At Epoch Time
  "exp": 1781938800                  -- Expiration Epoch Time (End of Event)
}
```

### Low-Signal Offline Operations Model
In environments with poor internet connection (e.g. basement event halls), gate scanners pull high-level valid hashes into local cache in advance, validating inputs, processing check-ins completely off-grid, and syncing back logs upon connection.

---

## 7. DevOps, CI/CD Pipeline & Enterprise Hardening Runway

The production CI/CD runway leverages Dockerizing workflows wrapped in GitHub Actions automation.

### Enterprise Hardening Checklist
- [x] **Secure BCrypt Hash Strength**: Password hashes calculated dynamically with a strength factor of `12`.
- [x] **Rate Limitations**: Form submission limits block brute force attempts on student lookups and SMS dispatch.
- [x] **Webhook Signature Inspection**: Verifies incoming digital webhook triggers from Paystack or Mobile money callbacks safely.
- [x] **Immutable Audits**: Restricts data access constraints at PostgreSQL level to reject dynamic `DELETE`/`UPDATE` requests on audit trails.
