/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeliverableDoc } from '../types';

export const DELIVERABLE_DOCS: DeliverableDoc[] = [
  {
    id: 'system-architecture',
    title: '1. Complete System Architecture',
    category: 'architecture',
    summary: 'Cloud-native multi-tenant architectural design and technology stack blueprint.',
    markdown: `### DuesFlow Complete System Architecture

The DuesFlow platform is engineered using a robust, highly scalable, cloud-native **decoupled microservices architecture** configured for enterprise-grade university financial operations and SaaS multi-tenancy.

\`\`\`
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
\`\`\`

#### Architectural Sub-Layers

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
`
  },
  {
    id: 'database-schema',
    title: '2. Database Schema & ERD',
    category: 'database',
    summary: 'Production SQL definitions for multi-tenant relational schema with indexes, relationships, and foreign keys.',
    markdown: `### Real-World Multi-Tenant Relational Schema

This production-grade PostgreSQL schema features strong data constraints, indexing strategies, and multi-tenant partitioning using \`organization_id\`.

\`\`\`sql
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
    id PRIMARY KEY VARCHAR(50),
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
\`\`\`
`
  },
  {
    id: 'spring-structure',
    title: '3. Spring Boot Backend Architecture',
    category: 'architecture',
    summary: 'Enterprise standard package breakdown, JWT filter, and Spring Security 6 config.',
    markdown: `### Production Spring Boot 3.x Directory Blueprint

The project is structured following Domain-Driven Design (DDD) to promote stateless, testable modules separated by concern.

#### Package Hierarchy
\`\`\`
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
\`\`\`

#### Production JWT Authentication Filter Code Slice

\`\`\`java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromJWT(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
\`\`\`

#### Production Security Configuration (Spring Security 6.x)

\`\`\`java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint unauthorizedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/student-login", "/api/v1/auth/student-verify").permitAll()
                .requestMatchers("/api/v1/auth/exec-login", "/api/v1/auth/exec-verify-otp").permitAll()
                .requestMatchers("/api/v1/webhooks/paystack").permitAll()
                .requestMatchers("/api/v1/tickets/verify-offline").hasAnyAuthority("GATE_KEEPER", "SUPER_ADMIN")
                .requestMatchers("/api/v1/reports/**").hasAnyAuthority("FINANCIAL_SECRETARY", "PRESIDENT", "SUPER_ADMIN")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strong BCrypt strength for passwords
    }
}
\`\`\`
`
  },
  {
    id: 'api-specification',
    title: '4. RESTful API Specifications',
    category: 'api',
    summary: 'Comprehensive endpoints for authentication, dues collection, CSV imports, and event gates.',
    markdown: `### DuesFlow Complete API Platform Specifications

All request and response payploads enforce strict JSON serialization. Bearer JWT authorization is mandatory on headers for secured endpoints.

#### 1. Authentication Endpoints

##### \`POST /api/v1/auth/student-login\`
*Description*: Validates index number, triggers OTP email.
- **Request Payload**:
  \`\`\`json
  {
    "indexNumber": "STU827364",
    "level": "400"
  }
  \`\`\`
- **Response (200 OK)**:
  \`\`\`json
  {
    "status": "OTP_SENT",
    "maskEmail": "e*******5@inst.edu.gh",
    "expirySeconds": 300
  }
  \`\`\`

##### \`POST /api/v1/auth/student-verify\`
*Description*: Confirms 6-digit verification code.
- **Request Payload**:
  \`\`\`json
  {
    "indexNumber": "STU827364",
    "otpCode": "827461"
  }
  \`\`\`
- **Response (200 OK)**:
  \`\`\`json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "df87ha92-a19c-4f7f-870d-f22b7a8d11c7",
    "expiresIn": 900,
    "student": {
      "indexNumber": "STU827364",
      "name": "Kofi Mensah",
      "email": "kmensah@inst.edu.gh",
      "level": "400",
      "department": "Computer Science Association"
    }
  }
  \`\`\`

---

#### 2. Dues & Ledger Endpoints

##### \`GET /api/v1/payments/statement\`
*Description*: Compiles the full chronological dues invoice history and receipts.
- **Response (200 OK)**:
  \`\`\`json
  {
    "totalOutstanding": 120.00,
    "totalPaid": 340.00,
    "statementCode": "STA-827364-COMPSSA",
    "items": [
      {
        "id": "INV-101",
        "title": "COMPSSA Departmental Dues - Semester 1",
        "amount": 100.00,
        "status": "PAID",
        "dueDate": "2026-03-15T00:00:00Z",
        "paidAt": "2026-02-14T11:45:22Z",
        "receiptReference": "PAY-TX-98218182"
      },
      {
        "id": "INV-102",
        "title": "Annual Biotech Dinner Entrance",
        "amount": 20.00,
        "status": "PAID",
        "dueDate": "2026-06-19T00:00:00Z",
        "paidAt": "2026-06-18T20:06:01Z",
        "receiptReference": "PAY-TX-1002937"
      }
    ]
  }
  \`\`\`

---

#### 3. CSV Import Sync (Financial Secretary)

##### \`POST /api/v1/admin/students/csv-import/validate\`
*Description*: Parsers student inputs and reviews duplicates without persistent insert.
- **Multipart Form Payload**: \`file: data.csv\`
- **Response (200 OK)**:
  \`\`\`json
  {
    "validationToken": "val_token_88719273",
    "summary": {
      "totalFound": 112,
      "validCount": 105,
      "invalidCount": 4,
      "duplicateCount": 3
    },
    "errors": [
      { "row": 12, "column": "email", "error": "Invalid institutional pattern kofi@gmail.com" },
      { "row": 44, "column": "indexNumber", "error": "Index number already exists in DB" }
    ]
  }
  \`\`\`

##### \`POST /api/v1/admin/students/csv-import/confirm\`
*Description*: Commits verified ledger insertions into PostgreSQL.
- **Request Payload**:
  \`\`\`json
  {
    "validationToken": "val_token_88719273"
  }
  \`\`\`
- **Response (201 Created)**:
  \`\`\`json
  {
    "status": "IMPORTED",
    "inserted": 105,
    "auditReference": "AUD-CSV-00982-FINSEC"
  }
  \`\`\`
`
  },
  {
    id: 'rabbitmq-design',
    title: '5. RabbitMQ Event Architecture',
    category: 'api',
    summary: 'Decoupled, event-driven async message flow model securing business processes.',
    markdown: `### Asynchronous Broker Topology

DuesFlow coordinates distributed microservices actions using RabbitMQ. Critical payments records are strictly persisted BEFORE notifications, mail creations, and tickets generation are triggered as asynchronous observers.

#### Flow Graph

\`\`\`
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
\`\`\`

#### RabbitMQ Structural Exchanges & Configurations

1. **Exchange Platform Configuration**:
   - **Name**: \`duesflow.exchange\`
   - **Type**: \`topic\`
   - **Durability**: \`Durable\` (survives broker resets)

2. **Durable Queues Subscriptions**:

| Queue Name | Routing Pattern Key | Consuming Domain Service | Purpose |
| :--- | :--- | :--- | :--- |
| \`billing.calc\` | \`payment.success\` | Finance Ledger Service | Resolves balances and resets outstanding balances. |
| \`qr.calc\` | \`payment.success\` | Gate ticket Generator | Digitally signs a tickets payload and caches codes. |
| \`mail.smtp\` | \`payment.success\` | Notification Engine | Processes HTML emails and attaches PDF gate passes. |
| \`audit.log\` | \`*.*\` | Security Inspector | Records the logging trace permanently. |

3. **Fault-Tolerance Mechanism (Dead Letter Exchange)**:
   - If the institutional SMTP service experiences temporary downtime, the \`mail.smtp\` system worker throws an exception.
   - The broker routes failed notifications to \`dead-letter.exchange\` with an exponential back-off TTL (30s, 5m, 1h).
   - This prevents memory overflow and guarantees that no student goes without a ticket or confirmation receipt after a successful charge.
`
  },
  {
    id: 'qr-verification',
    title: '6. Cryptographic QR Verification',
    category: 'security',
    summary: 'JWT signed tickets payload, real-time local scanning decryption, and offline cache synchronization.',
    markdown: `### High-Security QR Verification Blueprint

DuesFlow's QR codes do not contain plain URLs, database auto-incrementing integers, or raw IDs. Doing so leaves gate records open to URL-guessing vulnerabilities. Instead, DuesFlow runs an **Encrypted Cryptographic Ticket Design**.

#### signed JWT Ticket Design

The QR code encodes a standard JSON Web Signature (JWS) payload containing high-level validation metadata:

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
.
{
  "sub": "INDEX827364",              -- Student Student Index Number
  "jti": "TKT-COMPSSA-9921827",       -- Unique Ticket Ledger ID
  "evt": "EVT-CS-2026-DINNER",       -- Event Target Code
  "name": "Evelyn Boateng",          -- Cached Student Display Name
  "org": "COMPSSA-U",                -- SaaS Organization Segment
  "iat": 1781902800,                 -- Issued At Epoch Time
  "exp": 1781938800                  -- Expiration Epoch Time (End of Event)
}
.
[ HMAC-SHA256 Signature (64 chars) ]
\`\`\`

#### Fast Gate-App Decrypt Workflow (<50ms)

When the Gatekeeper Scanner camera reads the QR code:

1. **Cryptographic Validation**:
   - The scanner decrypts and validates the signature using the Event's public key (or shared secret shared prior to the gates opening).
   - If the HMAC signature is tempered or incorrect, the ticket is instantly rejected with **INVALID SIGNATURE** (Red Screen).

2. **Temporal Validation**:
   - Compares current epoch time with \`exp\` boundaries to verify that the ticket remains valid.

3. **Status Validation**:
   - Looks up \`jti\` in the local sqlite list or memory database cache to verify that the ticket is **UNUSED**. If found with verified tag, it triggers **DUPLICATE TICKET** alerts immediately.

---

### Low-Signal Offline Operations Model

In environments with dense brick walls, basement convention centers, or remote campuses with poor 4G signals:

\`\`\`
 [ Network Available ] ---> Download Complete [ Valid Ticket Keys Table ] locally to PWA IndexDB
                                          |
                                    (Flipped Offline)
                                          |
 [ Local Scanner Reads QR Code ] --------> Validate Cryptographic Signature (Offline)
                                          |
                                          +-> Record usage status inside Local SQLite/IndexDB Cache
                                          |
                                    (Flipped Online)
                                          |
 [ Push Cache to Backend Server ] -------> Batch conflict-resolver logs and reconcile states
\`\`\`

#### Conflict Resolution Policies
- If the offline cache confirms ticket \`TKT-COMPSSA-9921827\` was scanned at 19:02:11, and another gate scanner uploaded the exact ticket scanned at 19:01:45:
- The backend identifies a double-entrance conflict and marks the second timestamp with a security flag: \`FRAUD_ALERT_DUPLICATE_SCAN\`.
- This ensures immediate operational continuity without letting a physical bottleneck stall the entrance doors.
`
  },
  {
    id: 'cicd-production-checklist',
    title: '7. Multi-Tenant DevOps, CI/CD & Production Runway',
    category: 'infrastructure',
    summary: 'GitHub Actions workflow pipeline, multi-tenant deployment, security hardening checklist, and scalability design.',
    markdown: `### Production Logistics, CI/CD, & High-Scale Operations

This architecture outline is modeled to guarantee zero-downtime, continuous testing pipelines, and high-scale SaaS operation handling 100,000+ simultaneous students.

#### 1. CI/CD GitHub Actions Workflow

\`\`\`yaml
name: DuesFlow Core Deploy

on:
  push:
    branches: [ production ]

jobs:
  audit-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'maven'

      - name: Compile & Run Unit Tests
        run: mvn clean test

      - name: Run SonarQube Code Quality Gate
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
        run: mvn sonar:sonar

  build-and-pack:
    needs: audit-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Log in to DockerHub
        uses: docker/login-action@v2
        with:
          username: \${{ secrets.DOCKER_USER }}
          password: \${{ secrets.DOCKER_PAT }}

      - name: Build and Push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: duesflow/backend:latest,duesflow/backend:\${{ github.sha }}

  deploy:
    needs: build-and-pack
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloud Run / Kubernetes Cluster via Ansible
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.PROD_SSH_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull duesflow/backend:latest
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -f
\`\`\`

---

#### 2. Scalability Roadmap for 100,000+ Accounts
When migrating from a single-department tool to a multi-university SaaS system hosting hundreds of thousands of students:

1. **Database Partitioning Strategy**:
   - Partition tables (such as \`students\` and \`transactions\`) using declarative range keys keyed by \`organization_id\`.
   - Implement read-replicas for PostgreSQL: direct 85% of traffic (reporting dashboard, ledger queries) to replicas, reserving the primary master database strictly for critical writes (ticket scans, checkouts).

2. **Global Edge CDN & DNS Tuning**:
   - Cache static student ticketing templates, SVG assets, and dashboard layouts in Cloudflare CDN.
   - Run DNS routing policies to map users to their localized database nodes depending on academic jurisdictions.

3. **High Thruput Queue Backed Processing**:
   - Scale consumer worker threads for Gmail OTP dispatching dynamically depending on request backlogs.
   - Leverage RabbitMQ clustering to partition message delivery load gracefully across multiple nodes.

---

#### 3. Enterprise Hardening Checklist

- [ ] **BCrypt Cost Factor**: Verified BCrypt cost is set to \`12\` to make password hashes highly resilient.
- [ ] **Secured OTP Constraints**: Student verification tokens expire strictly in 5 minutes, tracked in Redis with rate filters to avoid brute force scans.
- [ ] **No Raw DB IDs in JWT**: Encoded ticket structures contain strictly randomized cryptographic hashes with unique UUID tokens.
- [ ] **Rate Limiting Enforcement**: Added IP rate limitations to endpoint routes via bucket token pools:
  - Student Login: 5 attempts per 10 minutes.
  - Ticket Scan Gate: 120 scans per minute.
- [ ] **Webhook Signature Inspection**: Configured the server to parse incoming Paystack payloads using HTTP signature validation tags to prevent spoofing.
- [ ] **Audit Trail Non-Updatable**: Constructed user security logging constraints with database level permissions that reject all \`UPDATE\` and \`DELETE\` declarations on audit tables.
`
  }
];
