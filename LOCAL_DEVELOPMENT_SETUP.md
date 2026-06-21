# DuesFlow Local Development Setup Guide (VS Code)

This guide walks you through setting up and running your **DuesFlow** project locally on your machine using VS Code. This configuration ensures that your frontend and backend run seamlessly side-by-side with complete **Role-Based Access Control (RBAC)** enforcement.

---

## 1. Prerequisites
Ensure you have the following installed on your local computer before continuing:
- **Node.js** (v18 or higher recommended)
- **Java Development Kit (JDK)** (JDK 17 or higher)
- **Apache Maven** (v3.8+) or uses the Spring wrapper (`./mvnw`)
- **Docker & Docker Compose** (The cleanest way to boot the PostgreSQL database)
- **VS Code Extensions**:
  - *Extension Pack for Java* (Microsoft)
  - *Spring Boot Extension Pack* (VMware)
  - *Tailwind CSS IntelliSense* (Brad Cornes)

---

## 2. Dockerized PostgreSQL Database Setup

Create a `docker-compose.yml` file in your root backend folder to host PostgreSQL database instantly:

```yaml
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

### Starting the Database
From your terminal in VS Code, run:
```bash
docker compose up -d
```
*This starts a local PostgreSQL instance listening on port `5432`, ready to receive connections from your Spring Boot app.*

---

## 3. Configuring Vite Reverse Proxy (Frontend Setup)

To avoid CORS (Cross-Origin Resource Sharing) restrictions when fetching data, you should configure Vite to act as a **Reverse Proxy**. 

Update your local `/vite.config.ts` to forward API requests from `/api` directly to your Spring Boot server on port `8080`.

Here is the recommended production-grade `vite.config.ts` for your local work:

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: true, // Re-enable Hot Module Replacement for fast local coding iterations!
    },
  };
});
```

---

## 4. Frontend Dynamic API Axios Integration

To consume JWT payloads and dynamically adjust UI dashboard visibility, create a custom Axios interceptor class in your frontend.

Create `/src/utils/api.ts` in your front-end repository:

```typescript
import axios from 'axios';

// Create central API transport client
export const api = axios.create({
  baseURL: '/api', // Re-routed dynamically by Vite Proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure Request Interceptor to auto-attach Bearer Tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('duesflow_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configure Response Interceptor to handle Session Expirations (403/401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Authentication credentials expired or unauthorized.');
      localStorage.removeItem('duesflow_auth_token');
      localStorage.removeItem('duesflow_current_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

### Accessing Roles dynamically in the Views
Use this custom hook `/src/hooks/useCurrentUser.ts` to evaluate user properties from the state securely:

```typescript
import { useState, useEffect } from 'react';

export interface UserSession {
  email: string;
  name: string;
  role: 'ROLE_FINANCIAL_SECRETARY' | 'ROLE_PRESIDENT' | 'ROLE_SUPER_ADMIN';
  permissions: string[];
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('duesflow_current_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        console.error('Failed reading active profile state', e);
      }
    }
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  return { user, isAuthenticated: !!user, hasPermission };
}
```

---

## 5. How to Run Both Applications Locally

We recommend running the frontend and backend side-by-side using VS Code's integrated terminal windows.

### Terminal 1: Spin up the Spring Boot Backend
1. Go to your `duesflow-backend` directory. eg: cd duesflow-backend
2. Build and start the service:
```bash
# Windows
mvnw.cmd spring-boot:run

# Mac / Linux
./mvnw spring-boot:run
```
*Your Spring Boot application will start and listen on standard port **`8080`**.*

### Terminal 2: Run the Vite React Frontend
1. Navigate back to your frontend root. eg: cd duesflow-frontend
2. Ensure base dependencies are updated and start the client server:
```bash
npm install
npm run dev
```
*Your browser will boot and display your beautiful, responsive UI dashboard on **`http://localhost:3000`**.*

---

## 6. Project Monorepo Configuration (Recommended Directory Layout)
To make local operations super easy to manage in VS Code, we highly recommend bundling both directories into a single VS Code Workspace as a monorepo:

```text
duesflow-workspace/
├── .vscode/
│   └── settings.json
├── duesflow-frontend/      <-- Paste your downloaded Vite/React folder here
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── duesflow-backend/       <-- Put your Spring Boot Maven project here
    ├── src/
    └── pom.xml
```

### VS Code workspace Settings configuration
Save the following configuration inside `.vscode/settings.json` to keep your environment organized:
```json
{
  "java.configuration.updateBuildConfiguration": "automatic",
  "editor.tabSize": 2,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/target": true,
    "**/node_modules": true,
    "**/dist": true
  }
}
```
---

## Summary Certification

With these files saved under your root repository, your next download zip will be fully self-contained. 

1. **Spring Boot Specs (`SPRING_BOOT_BACKEND_SETUP.md`)**: Configured with strict JWT filter bindings, JPA models mapping, and pre-seeded multi-tiered permissions ensuring strict backend gating.
2. **Reverse Proxying Configuration (`LOCAL_DEVELOPMENT_SETUP.md`)**: Guarantees zero CORS failures locally.
3. **Database Guardrails (`V1__Init_RBAC_Schema.sql`)**: Configured with immutable database triggers, blocking even administrators from tempering with financial tracks or deleting transaction trails!
