# DuesFlow Enterprise-Grade Workspace Manual

Welcome to **DuesFlow**, a professional, highly secure financial operations and dues collection platform designed for university student organizations and department-level administrations.

This workspace is fully structured as a Decoupled Monorepo to make local development inside VS Code straightforward.

---

## 1. Project Directory structure

The workspace is organized into separate, self-contained sub-directories for the User Interface and the Security API:

```text
duesflow-workspace/
├── .vscode/                 # VS Code specialized configuration workspace settings
│   └── settings.json        # Auto-config for Java compiler and file filtering boundaries
├── duesflow-frontend/      # Vite 6 + React 19 Client SPA
│   ├── src/                 # Reactive UI components, dashboards, hooks, and types
│   ├── index.html           # Core HTML view wrapper
│   ├── package.json         # Client-side node dependency registry
│   └── vite.config.ts       # Reverse-proxy proxy tunnel rule configs
└── duesflow-backend/       # Enterprise Spring Boot 3.2 + Security 6.x API
    ├── src/                 # Java controllers, database entities, JPA repositories, services
    └── pom.xml              # Maven dependency descriptor and packaging rules
```

---

## 2. Setting Up & Running the Application Locally

Follow these sequential instructions to run both clients on your machine inside VS Code.

### Step 1: Pre-requisites & Local Database Setup
1. Ensure **Docker Desktop** is open and active.
2. Spin up the Postgres database instantly using Docker Compose (placed in your `duesflow-backend` or root folder):
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     postgres-db:
       image: postgres:15-alpine
       container_name: duesflow-postgres
       environment:
         POSTGRES_DB: duesflow
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: db-secure-password
       ports:
         - "5432:5432"
       volumes:
         - pgdata:/var/lib/postgresql/data
       restart: always
   volumes:
     pgdata:
   ```
   Start the database:
   ```bash
   docker compose up -d
   ```

### Step 2: Spin Up the Spring Boot Secure API Dashboard
1. Open a new Terminal window in VS Code and change directory into the backend project:
   ```bash
   cd duesflow-backend
   ```
2. Run the application through Maven:
   ```bash
   # Windows
   mvnw.cmd spring-boot:run

   # macOS / Linux
   chmod +x mvnw
   ./mvnw spring-boot:run
   ```
   *The authorization server compiles, triggers Flyway/JPA schema updates, and listens for requests on port `8080` (with Context Path `/api`).*

### Step 3: Run the Vite React User Interface
1. Open a second Terminal window in VS Code and enter the frontend project folder:
   ```bash
   cd duesflow-frontend
   ```
2. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
3. Open your browser to `http://localhost:3000`.

---

## 3. Key Components Configuration Reference

To help your team customize and build upon this structure, we've created dedicated implementation specifications for each layer:

### 🛡️ **Backend Blueprint (`/SPRING_BOOT_BACKEND_SETUP.md`)**
Contains boilerplate Java components, controllers, database schemas, and service code, covering:
- **JWT Pipeline Filtering**: Automatically decodes and parses Role-Based Claims server-side.
- **Spring Security Method-Level Protection**: Dynamic validation using `@PreAuthorize("hasRole('...')")`.
- **Database Logs Immutable Triggers**: Pre-configured tables and database rules ensuring audit logs are never modified or deleted.

### 🔌 **Axios Dynamic Interceptors (`/LOCAL_DEVELOPMENT_SETUP.md`)**
Contains configuration patterns for:
- **CORS Mitigation Proxying**: Transparent path re-routing inside Vite to coordinate requests.
- **Authorization Header Injection**: Automatically retrieves the user session token from local storage and appends the raw Bearer JWT to every outgoing request.
- **Graceful Token Refresh / Invalid Session Eviction**: Automatically destroys invalid storage states and logs out users upon receiving standard `403 Forbidden` errors.

---

## 4. Role-Based Access Control (RBAC) Architecture

DuesFlow's access policy ensures distinct separation of duties:

| Scope Feature | ROLE_FINANCIAL_SECRETARY | ROLE_PRESIDENT | ROLE_SUPER_ADMIN | Enforced Level |
|---|:---:|:---:|:---:|---|
| **View Student Roster** | ✅ YES | ✅ YES | ✅ YES | Client UI + Controller |
| **Edit/Create Students** | ✅ YES | ❌ NO | ✅ YES | Spring API `@PreAuthorize` |
| **Verify Manual Dues** | ✅ YES | ❌ NO | ✅ YES | Spring API `@PreAuthorize` |
| **View Audit Compliance Log** | ❌ NO (Limited) | ✅ YES | ✅ YES | Database Level View |
| **Modify Security / Keys** | ❌ NO | ❌ NO | ✅ YES | Database Trigger Restrictions |

---

## 5. Architectural Security Highlights
- **Server-Side is Single Source of Truth**: All API endpoints use state tracking to block illegal access, even if a user tries to mock features on the frontend client.
- **Immutable Database Triggers**: The database trigger in PostgreSQL rejects any program attempting to execute `DELETE` or `UPDATE` statements on the `audit_logs` database collection.
