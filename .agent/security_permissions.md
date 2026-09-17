# Comprehensive Security Architecture & Role-Based Permissions Specification

**System:** Restaurant Management Backend API  
**Language:** Node.js (ES Modules), Express 5, Sequelize ORM, SQLite3  
**Security Modules:** `bcryptjs`, `jsonwebtoken` (JWT), `nodemailer` (SMTP 2FA)  
**Document Version:** 1.0  
**Classification:** Internal Technical Architecture & Access Control Specification  

---

## 1. Security Architecture Overview

The system utilizes an enterprise-grade, multi-layered security model built around the **Principle of Least Privilege (PoLP)**. Every incoming request must pass through layered validation before touching controllers or persistent data.

```
                           Incoming HTTP Request
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │  Global JSON Parser & CORS   │
                      │   (Handles Malformed Bodies) │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │     authenticateJWT (L1)     │
                      │  - Basic Auth Admin Bypass   │
                      │  - Bearer Token Verification │
                      └──────────────┬───────────────┘
                                     │
                     Valid User Attached to `req.user`
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    authorizeRoles(...) (L2)  │
                      │  - Validates `req.user.role` │
                      │  - Enforces Role Permissions │
                      └──────────────┬───────────────┘
                                     │
                       Access Granted (next())
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │ Controller & Business Logic  │
                      │   (Sequelize Transactions)   │
                      └──────────────────────────────┘
```

---

## 2. Core Security Mechanisms

### A. Password Encryption & Hashing (`bcryptjs`)
* **Mechanism:** Automatic Sequelize hook (`Person.beforeSave`).
* **Implementation:** Passwords submitted during employee registration or profile updates are automatically intercepted before reaching the database. A cryptographically random salt (10 rounds) is generated, and the password is replaced with a one-way bcrypt hash (`$2b$10$...`).
* **Enforcement:** Plain text passwords never exist in database files, logs, or memory dumps. The `createEmployee` controller enforces that `password` is mandatory (`allowNull = false` validation in logic).

### B. Two-Step Email Verification (OTP via SMTP)
* **Step 1 (`POST /auth/login`):** Validates email/username and checks the bcrypt hash. Verifies the employee is active (`isActive === true`). Generates a cryptographically random 6-digit numeric One-Time Password (OTP) and sets a strict 5-minute expiration timestamp (`otpExpires`).
* **Email Delivery:** Dispatches a luxury styled Black & Gold Hebrew email notification via `nodemailer` through Google's secure SMTP (`smtp.gmail.com:587`).
* **Step 2 (`POST /auth/verify`):** Requires the temporary token (`tempToken`) and the 6-digit OTP code. Upon successful match, the OTP fields are wiped from the database (`otpCode = null`, `otpExpires = null`) to guarantee single-use security against replay attacks.

### C. Stateless Session Tokens (JWT)
* **Session Token Signing:** Signed using HMAC SHA-256 with a strong environment secret (`process.env.JWT_SECRET`).
* **Payload Claims:** Contains `{ id, email, role }`.
* **Validity Period:** 8 hours (designed to safely cover a full operational work shift without frequent re-authentications).
* **Transport:** Carried in standard HTTP headers: `Authorization: Bearer <TOKEN>`.

### D. Testing & Development Bypass (`admin:123`)
* For automated testing and administrative emergency access, the system accepts **HTTP Basic Auth** (`admin` / `123`).
* When detected on any endpoint, the middleware automatically binds `{ id: 1, email: 'admin@restaurant.com', role: 'manager' }` directly to `req.user`, bypassing 2FA and manual token handling.

---

## 3. Detailed Role Definitions

The system defines four operational tiers:

1. **Guest / Public (Unauthenticated):** Outside customers viewing menu items on tablets or mobile web.
2. **Waiter (`waiter`):** Dining floor personnel handling table service, taking orders, modifying active dining items, and managing customer loyalty profiles.
3. **Chef / Kitchen Staff (`chef`):** Kitchen personnel monitoring live dining tickets, reading custom cooking notes, and tracking dish preparation statuses.
4. **Manager (`manager`):** Administrative supervisor with full governance over staff records, pricing, menu catalog availability, dining billing, and reporting.

---

## 4. Complete Permissions Matrix by Endpoint

| HTTP Method | Route / Endpoint | Public / Unauth | Waiter (`waiter`) | Chef (`chef`) | Manager (`manager`) | Enforcing Middleware |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **AUTH MODULE** | | | | | | |
| `POST` | `/auth/login` |  ALLOWED |  ALLOWED |  ALLOWED |  ALLOWED | Public (Credential verification) |
| `POST` | `/auth/verify` |  ALLOWED |  ALLOWED |  ALLOWED |  ALLOWED | Public (Validates OTP & Temp Token) |
| **MENU MODULE** | | | | | | |
| `GET` | `/menu` |  ALLOWED |  ALLOWED |  ALLOWED |  ALLOWED | Public (No middleware) |
| `GET` | `/menu/name/:name` |  ALLOWED |  ALLOWED |  ALLOWED |  ALLOWED | Public (No middleware) |
| `POST` | `/menu` |  BLOCKED (401) |  BLOCKED (403) |  BLOCKED (403) |  ALLOWED | `authenticateJWT`, `authorizeRoles('manager')` |
| `PUT` | `/menu/:id` |  BLOCKED (401) |  BLOCKED (403) |  BLOCKED (403) |  ALLOWED | `authenticateJWT`, `authorizeRoles('manager')` |
| `DELETE` | `/menu/:id` |  BLOCKED (401) |  BLOCKED (403) |  BLOCKED (403) |  ALLOWED | `authenticateJWT`, `authorizeRoles('manager')` |
| **EMPLOYEES MODULE** | | | | | | |
| `GET` | `/employees` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `GET` | `/employees/:id` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `GET` | `/employees/name/:name` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `POST` | `/employees` |  BLOCKED (401) |  BLOCKED (403) |  BLOCKED (403) |  ALLOWED | `authenticateJWT`, `authorizeRoles('manager')` |
| `PUT` | `/employees/:id` |  BLOCKED (401) |  BLOCKED (403) |  BLOCKED (403) |  ALLOWED | `authenticateJWT`, `authorizeRoles('manager')` |
| `DELETE` | `/employees/:id` |  BLOCKED (401) |  BLOCKED (403) |  BLOCKED (403) |  ALLOWED | `authenticateJWT`, `authorizeRoles('manager')` |
| **CUSTOMERS MODULE** | | | | | | |
| `GET` | `/customers` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `GET` | `/customers/:id` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `GET` | `/customers/name/:name` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `POST` | `/customers` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `PUT` | `/customers/:id` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `DELETE` | `/customers/:id` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| **ORDERS MODULE** | | | | | | |
| `POST` | `/orders` |  BLOCKED (401) |  ALLOWED |  BLOCKED (Biz) |  ALLOWED | `authenticateJWT` (Validates active waiter) |
| `GET` | `/orders` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `GET` | `/orders/:id` |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `GET` | `/orders/customer/name/:name`|  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `PUT` | `/orders/:id` (Status) |  BLOCKED (401) |  ALLOWED |  ALLOWED |  ALLOWED | `authenticateJWT` |
| `DELETE` | `/orders/:id` |  BLOCKED (401) |  ALLOWED |  BLOCKED (Biz) |  ALLOWED | `authenticateJWT` |
| **ORDER ITEMS (NESTED DISHES)** | | | | | | |
| `POST` | `/orders/:id/items` |  BLOCKED (401) |  ALLOWED |  BLOCKED (403) |  ALLOWED | `authenticateJWT` (Active order check) |
| `PUT` | `/orders/:id/items/:menuItemId`| BLOCKED (401)|  ALLOWED |  ALLOWED (Notes) |  ALLOWED | `authenticateJWT` (Active order check) |
| `DELETE` | `/orders/:id/items/:menuItemId`| BLOCKED (401)|  ALLOWED |  BLOCKED (403) |  ALLOWED | `authenticateJWT` (Active order check) |

---

## 5. Granular Breakdown by Employee Role

### 1. Waiter (`role: "waiter"`)

#### Permissions & Capabilities:
* **Table Service & Ordering:**
  - Can open new dining orders (`POST /orders`).
  - Can dynamically append dishes to active tables (`POST /orders/:id/items`). If a dish is ordered multiple times, quantity accumulates and total pricing automatically recalculates.
  - Can modify item quantities and record special kitchen instructions (`PUT /orders/:id/items/:menuItemId`, e.g., "no onions", "extra spicy").
  - Can remove incorrectly entered items from active orders (`DELETE /orders/:id/items/:menuItemId`).
  - Can update order lifecycle status (`PUT /orders/:id`: `'open'` -> `'in_progress'` -> `'served'` -> `'paid'`).
* **Customer Interaction:**
  - Can register new diners in the restaurant database (`POST /customers`).
  - Can search returning diners by name or ID to review dining history and preferences.
* **Staff Directory:**
  - Can view coworker profiles (`GET /employees`) to identify assigned managers or supervisors.

#### Restrictions & Security Boundaries:
* **Strictly Forbidden from Menu Changes:** Any attempt to create (`POST /menu`), edit pricing (`PUT /menu/:id`), or delete dishes (`DELETE /menu/:id`) is immediately blocked with **`403 Forbidden`**.
* **Strictly Forbidden from Personnel Management:** Cannot create (`POST /employees`), alter roles/salaries (`PUT /employees/:id`), or delete coworkers (`DELETE /employees/:id`). Returns **`403 Forbidden`**.
* **Order Status Guards:** Once an order status is marked as `'paid'` or `'cancelled'`, the waiter cannot alter any item on that order (enforced at the database controller layer).

---

### 2. Chef / Kitchen Staff (`role: "chef"`)

#### Permissions & Capabilities:
* **Kitchen Order Display & Monitoring:**
  - Can read all incoming orders (`GET /orders`) and inspect specific tickets (`GET /orders/:id`).
  - Has full visibility into the items, quantities, and preparation notes (`OrderItems.notes`) submitted by waiters.
* **Order Progress Updates:**
  - Can update the status of tickets (`PUT /orders/:id`) from `'open'` to `'in_progress'` and from `'in_progress'` to `'served'`.
* **Menu Consultation:**
  - Can query the menu catalog (`GET /menu`) to check ingredients, categories, and item availability.

#### Restrictions & Security Boundaries:
* **Cannot Alter Pricing or Catalog:** Chefs cannot alter prices or delete menu items. Returns **`403 Forbidden`**.
* **Cannot Modify Personnel:** Chefs have zero access to modify employee records. Returns **`403 Forbidden`**.
* **Billing Integrity:** Chefs cannot cancel orders or tamper with payments.

---

### 3. Manager (`role: "manager"` or `"menager"`)

#### Permissions & Capabilities:
* **Full Administrative Governance:**
  - **Employee Lifecycle:** Can recruit and create staff profiles (`POST /employees`), update employee assignments, roles, or supervisor links (`PUT /employees/:id`), and deactivate or delete staff (`DELETE /employees/:id`).
  - **Menu & Catalog Control:** Can introduce new dishes (`POST /menu`), revise prices, toggle availability (`isAvailable: true/false`), and delete obsolete items (`DELETE /menu/:id`). *(Note: Protected by foreign key constraints preventing deletion of dishes linked to historical invoices).*
  - **Financial & Order Management:** Complete access to oversee all tables, adjust orders, void accidental charges, and manage statuses.
  - **Customer Database:** Full administrative access to edit or purge customer records.

#### Restrictions & Security Boundaries:
* Must adhere to database consistency rules (e.g., cannot delete an employee who is currently recorded as the active manager of other employees unless re-assigned; cannot set menu item prices below 0.00).

---

## 6. Error Handling & Security Status Codes

The API returns consistent HTTP status codes to distinguish authentication from authorization failures:

* **`400 Bad Request`:**
  - Malformed JSON payload (e.g., unescaped quotes).
  - Missing mandatory fields (e.g., missing password on employee registration, negative dish prices).
* **`401 Unauthorized`:**
  - Request lacks the `Authorization: Bearer <TOKEN>` header.
  - The submitted token is expired, corrupted, or signed with an invalid secret.
  - Login credentials (email/username and password) did not match.
  - Invalid or expired 2FA OTP code.
* **`403 Forbidden`:**
  - The token is 100% valid and the user is authenticated, but their `role` lacks sufficient clearance for the target endpoint (e.g., a waiter attempting to delete a dish or create an employee).
* **`404 Not Found`:**
  - Target entity (Employee ID, Order ID, Menu Item ID) does not exist in the database.
* **`500 Internal Server Error`:**
  - Unhandled exceptions or database constraint errors (sanitized by the global error handler).

