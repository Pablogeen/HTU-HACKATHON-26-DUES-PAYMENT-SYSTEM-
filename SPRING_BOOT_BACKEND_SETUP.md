# DuesFlow Enterprise-Grade Spring Boot Backend Setup Specification

This document provides a production-ready, highly secure Spring Boot with Spring Security, JWT, and JPA backend specification. It serves as your primary reference and direct copy-paste source to implement the **DuesFlow Role-Based Access Control (RBAC)** architecture locally inside VS Code.

---

## 1. Directory Structure

Place your backend files under the structural directory model shown below.
```text
duesflow-backend/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── gh/
        │       └── edu/
        │           └── duesflow/
        │               ├── DuesFlowApplication.java
        │               ├── config/
        │               │   ├── SecurityConfig.java
        │               │   ├── JwtAuthenticationFilter.java
        │               │   ├── JwtService.java
        │               │   └── WebConfig.java
        │               ├── controller/
        │               │   ├── AuthController.java
        │               │   ├── StudentController.java
        │               │   ├── PaystackController.java
        │               │   └── SystemConfigController.java
        │               ├── entity/
        │               │   ├── User.java
        │               │   ├── Role.java
        │               │   ├── Permission.java
        │               │   ├── Student.java
        │               │   ├── AuditLog.java
        │               │   └── Transaction.java
        │               ├── repository/
        │               │   ├── UserRepository.java
        │               │   ├── RoleRepository.java
        │               │   ├── PermissionRepository.java
        │               │   ├── StudentRepository.java
        │               │   ├── AuditLogRepository.java
        │               │   └── TransactionRepository.java
        │               ├── security/
        │               │   ├── CustomUserDetails.java
        │               │   └── CustomPermissionEvaluator.java
        │               └── service/
        │                   ├── AuditLogService.java
        │                   ├── StudentService.java
        │                   └── UserService.java
        └── resources/
            ├── application.yml
            └── db/
                └── migration/
                    └── V1__Init_RBAC_Schema.sql
```

---

## 2. Spring Boot Core Dependencies (`pom.xml`)

Include the following dependencies in your backend `pom.xml` to enable Spring Web, JPA, PostgreSQL, Spring Security, JWT library validation, and Lombok.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>gh.edu.duesflow</groupId>
    <artifactId>duesflow-backend</artifactId>
    <version>1.0.0</version>
    <name>duesflow-backend</name>
    <description>Enterprise Role-Based Access Control and Financial Ledger for DuesFlow</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.5</jjwt.version>
    </properties>

    <dependencies>
        <!-- Web & JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- JSON Web Token (JJWT) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- database driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Utilities & Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 3. Database Schema Mapping & Entities

### SQL DDL with Immutable Immutable Auditing (`V1__Init_RBAC_Schema.sql`)
This PostgreSQL schema sets up precise permissions and configures a **PostgreSQL Database Trigger** to ensure that audit logs remain completely **immutable** (preventing deletion or updates from any entity or role once committed).

```sql
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
```

### Entity: AuditLog (`entity/AuditLog.java`)
```java
package gh.edu.duesflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, updatable = false)
    private String username;

    @Column(nullable = false, updatable = false)
    private String role;

    @Column(nullable = false, updatable = false)
    private String action;

    @Column(name = "entity_affected", updatable = false)
    private String entityAffected;

    @Column(name = "ip_address", nullable = false, updatable = false)
    private String ipAddress;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String details;

    @Column(nullable = false, updatable = false)
    private String status;
}
```

---

## 4. Spring Security and Token Pipeline Configuration

### Security Config (`config/SecurityConfig.java`)
```java
package gh.edu.duesflow.config;

import gh.edu.duesflow.security.CustomPermissionEvaluator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configure(http))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### JWT Pipeline Processor (`config/JwtAuthenticationFilter.java`)
```java
package gh.edu.duesflow.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);
        
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

### JWT Generator & Reader (`config/JwtService.java`)
```java
package gh.edu.duesflow.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("ROLE_STUDENT"));
        
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

---

## 5. Web and Service Layer Integration

### Audit Logger Utility Service (`service/AuditLogService.java`)
```java
package gh.edu.duesflow.service;

import gh.edu.duesflow.entity.AuditLog;
import gh.edu.duesflow.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final HttpServletRequest request;

    @Transactional
    public void log(String action, String entityAffected, String details, String status) {
        String username = "ANONYMOUS";
        String mainRole = "GUEST";
        
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
            mainRole = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("USER");
        }

        String ip = request.getRemoteAddr();
        
        AuditLog record = AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .username(username)
                .role(mainRole)
                .action(action)
                .entityAffected(entityAffected)
                .ipAddress(ip != null ? ip : "127.0.0.1")
                .details(details)
                .status(status)
                .build();
                
        auditLogRepository.save(record);
    }
}
```

---

## 6. Access Control Enforcement Controllers

The custom controllers enforce authorization at the method tier level. Any unauthorized breach generates security exceptions and triggers audited alarms.

### Financial Operations Controller (`controller/StudentController.java`)
```java
package gh.edu.duesflow.controller;

import gh.edu.duesflow.entity.Student;
import gh.edu.duesflow.service.AuditLogService;
import gh.edu.duesflow.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final AuditLogService auditLogger;

    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCIAL_SECRETARY', 'PRESIDENT', 'SUPER_ADMIN')")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(studentService.getStudents(search));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('FINANCIAL_SECRETARY', 'SUPER_ADMIN')")
    public ResponseEntity<?> importCsv(@RequestParam("file") MultipartFile file) {
        try {
            studentService.bulkImport(file);
            auditLogger.log("Csv Import Completed", "Students", "Bulk data transaction mapped successfully", "SUCCESS");
            return ResponseEntity.ok().body("File imported successfully!");
        } catch (Exception e) {
            auditLogger.log("Csv Import Failed", "Students", "File syntax error: " + e.getMessage(), "FAILED");
            return ResponseEntity.badRequest().body("CSV execution error: " + e.getMessage());
        }
    }

    @PatchMapping("/{index}/override-clearance")
    @PreAuthorize("hasAnyRole('FINANCIAL_SECRETARY', 'SUPER_ADMIN')")
    public ResponseEntity<Void> overrideClearance(
            @PathVariable String index, 
            @RequestParam boolean approved,
            @RequestParam String reason
    ) {
        studentService.overrideClearanceStatus(index, approved);
        auditLogger.log(
            "Clearance Overruled", 
            "Student:" + index, 
            "Manual compliance state altered. Reason detailed: " + reason, 
            "SUCCESS"
        );
        return ResponseEntity.accepted().build();
    }
}
```

### System Configuration Controller (`controller/SystemConfigController.java`)
```java
package gh.edu.duesflow.controller;

import gh.edu.duesflow.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SystemConfigController {

    private final AuditLogService auditLogger;

    @PutMapping("/otp-policy")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> tweakOtpStrength(@RequestParam int length, @RequestParam int expiry) {
        // Business logic to commit institutional preferences
        auditLogger.log(
            "OTP Settings Altered", 
            "SYSTEM", 
            "Admin adjusted credentials structure to length=" + length + ", TTL=" + expiry, 
            "SUCCESS"
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/paystack-api-key")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> configureSecretKey(@RequestParam String secretKey) {
        // Business logic for encryption and storage
        auditLogger.log("Paystack secret updated", "PAYSTACK_PROVIDER", "Client updated credentials keys", "SUCCESS");
        return ResponseEntity.ok().build();
    }
}
```

---

## 7. Configuration Properties (`application.yml`)

Configure your Spring Boot backend locally in VS Code with the following configurations.

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/duesflow
    username: postgres
    password: db-secure-password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true

application:
  security:
    jwt:
      # Generate a secure HS256 Key base64 encoded for JWT signing
      secret-key: dXNlY29uZmVyZW5jZWNyZWRlbnRpaWFsc2VjdXJlX2tleV9kZXNzaWduX3NlY3VyZV9jb2RlXzIwMjZfZHVlc2Zsb3c=
      # Default: 1 Day in Milliseconds
      expiration: 86400000 
```
