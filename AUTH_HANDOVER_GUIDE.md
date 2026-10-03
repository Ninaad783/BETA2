# 🔐 MedEasy Pharmacy OS - Authentication Handover Guide

> **Developer Guide for Authentication Integration**  
> **Backend Stack**: Node.js, Express, TypeScript, PostgreSQL (`pg`), JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`)  
> **Frontend Stack**: React 18, Vite, TypeScript, TailwindCSS, Zustand (`useAuthStore`)

---

## 📌 1. Overview & Architecture

MedEasy uses **JWT (JSON Web Token) Bearer authentication** combined with **Role-Based Access Control (RBAC)** across three staff roles:
- `ADMIN`: Full access (owner / head pharmacist)
- `PHARMACIST`: Billing, stock adjustment, purchase inward
- `STAFF`: Fast billing counter counter-sales only

All auth files are already structured, configured, and TypeScript-compiled. You can run the code directly, connect your local or remote PostgreSQL instance, and customize password rules or session parameters.

```
                    ┌─────────────────────────┐
                    │   React Frontend (Vite) │
                    │   LoginPage.tsx         │
                    │   useAuthStore.ts       │
                    └────────────┬────────────┘
                                 │ POST /api/auth/login { username, password }
                                 ▼
                    ┌─────────────────────────┐
                    │  Express Backend (5000) │
                    │  auth.controller.ts     │
                    │  auth.middleware.ts     │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │  PostgreSQL (Schema v1) │     │    Signed JWT Token     │
    │  TABLE: users           │     │    Bearer <jwt_token>   │
    │  TABLE: pharmacy_stores │     │    Valid for 7 days     │
    └─────────────────────────┘     └─────────────────────────┘
```

---

## 📂 2. File Structure

All auth files are placed in standard modular folders:

```
BETA-1/
├── backend/
│   ├── database/
│   │   └── schema.sql                 <-- PostgreSQL Schema v1.1 + Seed users
│   ├── src/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts     <-- Login, /me, change password, logout logic
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts     <-- Bearer JWT verification & role guard
│   │   ├── routes/
│   │   │   └── auth.routes.ts         <-- Express router mounting /api/auth/*
│   │   ├── types/
│   │   │   └── auth.types.ts          <-- TypeScript interfaces (User, JWT Payload)
│   │   ├── db.ts                      <-- PostgreSQL Pool connection
│   │   └── server.ts                  <-- Express entrypoint mounting /api/auth
│   ├── .env.example                   <-- Sample environment configuration
│   └── package.json                   <-- Dependencies (bcryptjs, jsonwebtoken, pg)
│
└── frontend/
    └── src/
        ├── stores/
        │   └── authStore.ts           <-- Zustand store with token & user persistence
        ├── components/
        │   └── auth/
        │       └── ProtectedRoute.tsx <-- Route guard redirecting unauthorized users
        ├── modules/
        │   └── auth/
        │       └── pages/LoginPage.tsx <-- Login form connected to /api/auth/login
        └── app/
            └── router/AppRouter.tsx   <-- Router with ProtectedRoute wrapper
```

---

## ⚙️ 3. Quick Setup Instructions

### Step 1: Install Dependencies (Already installed)
In `backend/`:
```bash
npm install bcryptjs jsonwebtoken pg express cors dotenv
npm install -D @types/bcryptjs @types/jsonwebtoken @types/pg @types/express @types/cors tsx typescript
```

### Step 2: Configure Environment Variables
Copy `backend/.env.example` to `backend/.env` and update your PostgreSQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beta1
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Authentication Secret & Expiry
JWT_SECRET=medeasy_super_secret_jwt_key_replace_in_production_2026
JWT_EXPIRES_IN=7d
```

### Step 3: Run Database Migrations & Seed Users
Load `backend/database/schema.sql` into your PostgreSQL database:

```bash
# Using psql:
psql -U postgres -d beta1 -f backend/database/schema.sql
```

The migration automatically creates default demo users:

| Username | Password | Full Name | Role | Preferred Language |
| :--- | :--- | :--- | :--- | :--- |
| `admin_rahul` | `password123` | Rahul Patil | `ADMIN` | `mr` (Marathi) |
| `staff_sachin` | `password123` | Sachin More | `STAFF` | `mr` (Marathi) |

### Step 4: Run the Backend Server
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 📡 4. API Endpoints Specification

### 1. `POST /api/auth/login`
Authenticates user with username & password, returns JWT token and sanitized user profile.

- **URL**: `http://localhost:5000/api/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "admin_rahul",
  "password": "password123"
}
```

- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22",
    "storeId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "username": "admin_rahul",
    "fullName": "Rahul Patil",
    "mobile": "9822334455",
    "role": "ADMIN",
    "preferredLanguage": "mr"
  }
}
```

- **Error Response (`401 Unauthorized`)**:
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### 2. `GET /api/auth/me` (Protected)
Retrieves the logged-in user profile and their linked pharmacy store configuration.

- **URL**: `http://localhost:5000/api/auth/me`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <jwt_token>`

- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "user": {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22",
    "storeId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "username": "admin_rahul",
    "fullName": "Rahul Patil",
    "mobile": "9822334455",
    "role": "ADMIN",
    "preferredLanguage": "mr"
  },
  "store": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "store_name": "MedEasy Khed Shivapur Medical",
    "dl_number": "MH-PUN-2024-DL9012",
    "gstin": "27AABCM9876E1Z4",
    "phone": "+91 9822334455",
    "village_town": "Khed Shivapur"
  }
}
```

- **Error Response (`401 / 403`)**:
```json
{
  "success": false,
  "message": "Access denied: No authorization token provided"
}
```

---

### 3. `POST /api/auth/change-password` (Protected)
Allows user to change their account password.

- **URL**: `http://localhost:5000/api/auth/change-password`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "oldPassword": "password123",
  "newPassword": "newSecretPassword456"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 4. `POST /api/auth/logout`
Acknowledges client session logout.
- **URL**: `http://localhost:5000/api/auth/logout`
- **Method**: `POST`
- **Response**: `{ "success": true, "message": "Logged out successfully" }`

---

## 🔒 5. Protecting Custom Backend Routes

Whenever you add new backend routes (e.g. medicines, sales invoices, stock adjustments), protect them using the middleware:

```typescript
import { Router } from 'express';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// 1. Any logged-in user can access:
router.get('/medicines', authenticateToken, listMedicinesController);

// 2. Only ADMIN or PHARMACIST can adjust stock:
router.post('/stock/adjust', authenticateToken, requireRoles('ADMIN', 'PHARMACIST'), adjustStockController);

// 3. Only ADMIN can access store settings & backup:
router.post('/settings/backup', authenticateToken, requireRoles('ADMIN'), triggerBackupController);
```

---

## 🧪 6. Testing with cURL

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

### Test 2: Database Connectivity Check
```bash
curl http://localhost:5000/api/db/health
```

### Test 3: Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_rahul","password":"password123"}'
```

### Test 4: Access Protected Profile
Replace `<TOKEN>` with the token from Test 3:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🚀 7. Frontend Integration Summary

- **Auto-Sync Token**: When a user logs in via `LoginPage.tsx`, the token is stored in `localStorage` under `medeasy_auth_token`.
- **Sidebar Profile**: Displays logged in user (`Rahul Patil (ADMIN)`). Clicking logout calls `useAuthStore().logout()` and redirects to `/login`.
- **Protected Routes**: All private dashboard/counter routes are guarded by `<ProtectedRoute />`.
- **Offline / Dev Fallback**: If the backend database isn't running yet, `useAuthStore` includes a local fallback for `admin_rahul` / `password123` so the UI remains fully testable without blocking frontend developers.
