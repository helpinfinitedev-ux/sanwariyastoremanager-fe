# Role & Permission Matrix: Sanwariya Restaurant Backend (`sr-backend`)

> **Authentication Rule:** All authenticated requests must include `Authorization: Bearer <token>` in the HTTP headers.  
> **Admin Override Rule:** `src/middleware/auth.middleware.js` states:
> ```js
> if (req.user.role === 'admin' || roles.includes(req.user.role)) return next();
> ```
> This grants the `admin` role unrestricted access across all endpoints.

---

## 1. Backend Role Definitions

The backend defines exactly **4 roles** in `src/constants/roles.js`:

| Role Key | String Value | Client Destination | Primary Operational Scope |
|---|---|---|---|
| `ROLES.ADMIN` | `"admin"` | **Super Admin Web Dashboard** | Full system control: Staff, Menu, Floor plan, Overrides, Financial Analytics. |
| `ROLES.CASHIER` | `"cashier"` | **Cashier Touch POS** | Approving orders, sending back orders, completing/billing, seating tables, floor stats. |
| `ROLES.WAITER` | `"waiter"` | **Waiter Mobile/Tablet App** | Creating/editing draft orders, sending to cashier, serving ready food, seating guests. |
| `ROLES.KITCHEN` | `"kitchen"` | **Kitchen Display System (KDS)** | Accepting orders with ETA, rejecting orders with reason, marking items ready to serve. |

*Note: Roles such as `super_admin` (distinct from `admin`), `manager`, `store_manager`, `accountant`, or `guest` do **NOT** exist as backend enum types. The Super Admin frontend will authenticate and operate under the `admin` role.*

---

## 2. Comprehensive Permissions Matrix

| Feature / Action | Admin | Cashier | Waiter | Kitchen | Backend Enforcement Location |
|---|:---:|:---:|:---:|:---:|---|
| **System Health** (`/health`) | ✅ | ✅ | ✅ | ✅ | Public route |
| **Login** (`POST /auth/login`) | ✅ | ✅ | ✅ | ✅ | Public route |
| **Inspect Self Profile** (`GET /auth/me`) | ✅ | ✅ | ✅ | ✅ | Authenticated |
| **Staff: Create User** (`POST /users`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Staff: List Users** (`GET /users`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Staff: View User Details** (`GET /users/:id`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Staff: Update / Reset Password** (`PATCH /users/:id`)| ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Staff: Deactivate User** (`DELETE /users/:id`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Menu: List Products** (`GET /products`) | ✅ | ✅ | ✅ | ✅ | Authenticated |
| **Menu: View Product** (`GET /products/:id`) | ✅ | ✅ | ✅ | ✅ | Authenticated |
| **Menu: Create Product** (`POST /products`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Menu: Update Product** (`PATCH /products/:id`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Menu: Delete Product** (`DELETE /products/:id`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Tables: List Floor Plan** (`GET /tables`) | ✅ | ✅ | ✅ | ✅ | Authenticated |
| **Tables: Create Table** (`POST /tables`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Tables: Edit Table Specs** (`PATCH /tables/:id`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Tables: Delete Table** (`DELETE /tables/:id`) | ✅ | ❌ | ❌ | ❌ | `authorize(ROLES.ADMIN)` |
| **Tables: Seat Guests** (`POST /tables/:id/seat`) | ✅ | ✅ | ✅ | ❌ | `authorize(ROLES.WAITER, ROLES.CASHIER)` |
| **Tables: Clear Table** (`POST /tables/:id/clear`) | ✅ | ✅ | ✅ | ❌ | `authorize(ROLES.WAITER, ROLES.CASHIER)` |
| **Tables: Set Custom Status** (`POST /tables/:id/status`)| ✅ | ✅ | ✅ | ❌ | `authorize(ROLES.WAITER, ROLES.CASHIER)` |
| **Customers: Search & List** (`GET /customers`) | ✅ | ✅ | ✅ | ✅ | Authenticated |
| **Customers: Register / Upsert** (`POST /customers`) | ✅ | ✅ | ✅ | ❌ | `authorize(ROLES.WAITER, ROLES.CASHIER)` |
| **Orders: List All Orders** (`GET /orders`) | ✅ | ✅ | ✅ | ✅ | Authenticated |
| **Orders: View Order Details** (`GET /orders/:id`) | ✅ | ✅ | ✅ | ✅ | Authenticated |
| **Orders: Create Draft** (`POST /orders`) | ✅ | ❌ | ✅ | ❌ | `authorize(ROLES.WAITER)` |
| **Orders: Edit Draft Items** (`PATCH /orders/:id`) | ✅ | ❌ | ✅ (owner only) | ❌ | `assertOwner()` + `status === 'draft'` |
| **Orders: Send to Cashier** (`POST /orders/:id/send`) | ✅ | ❌ | ✅ (owner only) | ❌ | `TRANSITIONS[pendingApproval]` |
| **Orders: Cashier Approve** (`POST /orders/:id/approve`)| ✅ | ✅ | ❌ | ❌ | `TRANSITIONS[approved]` |
| **Orders: Cashier Send Back** (`POST /orders/:id/send-back`)| ✅ | ✅ | ❌ | ❌ | `TRANSITIONS[draft]` |
| **Orders: KDS Accept & Set ETA** (`POST /orders/:id/accept`)| ✅ | ❌ | ❌ | ✅ | `TRANSITIONS[preparing]` |
| **Orders: KDS Reject** (`POST /orders/:id/reject`) | ✅ | ❌ | ❌ | ✅ | `TRANSITIONS[rejected]` |
| **Orders: Mark Ready** (`POST /orders/:id/ready`) | ✅ | ❌ | ❌ | ✅ | `TRANSITIONS[readyToServe]` |
| **Orders: Waiter Mark Served** (`POST /orders/:id/serve`)| ✅ | ❌ | ✅ (owner only) | ❌ | `TRANSITIONS[served]` |
| **Orders: Cashier Complete** (`POST /orders/:id/complete`)| ✅ | ✅ | ❌ | ❌ | `TRANSITIONS[completed]` |
| **Orders: Cancel / Void** (`POST /orders/:id/cancel`) | ✅ | ✅ | ✅ | ❌ | `TRANSITIONS[cancelled]` |
| **Orders: Emergency Status Patch** (`PATCH /orders/:id/status`)| ✅ | ✅* | ✅* | ✅* | Governed by transition rules in service |
| **Reports: Sales Summary** (`GET /reports/summary`) | ✅ | ✅ | ❌ | ❌ | `authorize(ROLES.CASHIER)` |
| **Reports: Live Floor Stats** (`GET /reports/floor`) | ✅ | ✅ | ❌ | ❌ | `authorize(ROLES.CASHIER)` |
| **Realtime: Admin Stream** (`role:admin` socket room) | ✅ | ❌ | ❌ | ❌ | Socket Handshake Role Check |

---

## 3. Staff `restrictions` Field Evaluation

The `User` model contains an array field `restrictions: [String]` (e.g. `cannot_void_bill`, `no_discount`).
* **Implementation Status:** The field is persisted in the database and returned via `/api/users` and `/api/auth/me`.
* **Enforcement Status:** **Not enforced in middleware or services.** Route access is currently controlled exclusively by the user's `role`. The Super Admin frontend can configure these strings, but enforcement must be added to backend route middleware if strict backend blocking is desired.
