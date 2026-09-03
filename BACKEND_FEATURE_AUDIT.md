# Backend Feature Audit: Sanwariya Restaurant Backend (`sr-backend`)

> **Audit Date:** August 29, 2026  
> **Source of Truth:** `c:\Users\moazz\Desktop\sanwariyaresturantproject\sr-backend`  
> **Architecture:** Node.js + Express + Mongoose (MongoDB) + Socket.IO (Realtime)

---

## 1. Executive Summary

This audit is based on an inspection of the real backend source code in `sr-backend`. The backend implements a streamlined, centralized restaurant management engine serving four client applications:
1. **Cashier Touch POS**
2. **Waiter App**
3. **Kitchen Display System (KDS)**
4. **Super Admin / Admin Web Dashboard**

The backend enforces a strict layered architecture:
```
Routes  ──>  Controllers  ──>  Services (State Machine & Logic)  ──>  Models (MongoDB)
                                     │
                                     └──> Socket.IO (Realtime Broadcasting)
```

---

## 2. Core Entities & Data Architecture

| Entity | Model File | Primary Keys & Indexes | Key Attributes |
|---|---|---|---|
| **User** | `src/models/user.model.js` | `_id`, `phoneNumber` (unique) | `name`, `phoneNumber`, `password` (bcrypt hashed), `role` (`waiter`, `cashier`, `kitchen`, `admin`), `age`, `restrictions` (`[String]`), `isActive` |
| **Product** | `src/models/product.model.js` | `_id`, `category` (indexed) | `name`, `description`, `price`, `category`, `foodType` (`veg`, `nonveg`, `egg`), `isAvailable`, `prepTimeMins`, `imageUrl`, `stock`, `isActive` |
| **Table** | `src/models/table.model.js` | `_id`, `tableNo` (unique), `section`, `status` | `tableNo`, `label`, `section`, `capacity`, `status` (`available`, `occupied`, `reserved`, `cleaning`), `waiter` (User Ref), `customerName`, `guestCount`, `occupiedAt`, `isActive` |
| **Customer** | `src/models/customer.model.js` | `_id`, `phoneNumber` (indexed) | `name`, `phoneNumber`, `guestCount`, `notes`, `lastTableNo`, `visitCount`, `lastVisitAt`, `createdBy` (User Ref) |
| **Order** | `src/models/order.model.js` | `_id`, `liveOrderId` (indexed), `status` | `liveOrderId` (atomic daily seq e.g. "001"), `customer` (Ref), `customerName`, `customerPhone`, `guestCount`, `tableNo`, `waiter` (User Ref), `items` (embedded snapshot), `subtotal`, `tax` (5%), `discount`, `totalPrice`, `status`, `eta`, `rejectionReason`, `approvedBy` (User Ref), `rejectedBy` (User Ref), `statusHistory` |
| **Counter** | `src/models/counter.model.js` | `_id` (`order-YYYY-MM-DD`) | `seq` (atomic incrementor for human-readable daily running order IDs) |

---

## 3. Realtime Socket.IO Architecture

* **Server Integration:** Runs on the same HTTP port as Express via `http.createServer(app)`.
* **Handshake Authentication:** Validates JWT passed in `socket.handshake.auth.token`. Rejects invalid or inactive connections.
* **Auto-Joined Rooms:**
  * `role:admin` — Receives all orders, tables, and menu updates.
  * `role:cashier` — Receives orders pending approval, orders served, and cancellations.
  * `role:kitchen` — Receives orders approved for cooking.
  * `role:waiter` — Receives menu and table broadcast updates.
  * `waiter:<userId>` — Personal room for individual waiters receiving targeted updates about their specific orders.
  * `order:<orderId>` — Granular subscription room for tracking a specific order.
* **Event Dispatch Helper:** `src/realtime/emitOrderEvent.js` centralizes emission logic so controllers do not manually handle room lists.

---

## 4. End-to-End Order Lifecycle & State Machine

Order state transitions are strictly governed by `TRANSITIONS` in `src/constants/orderStatus.js` and enforced inside `order.service.js`:

```
[draft] 
   │  (Waiter sends)
   ▼
[pendingApproval] ──────────(Cashier sends back with reason)─────────> [draft]
   │  (Cashier approves)
   ▼
[approved] ─────────────────(Kitchen rejects with reason)────────────> [rejected] (Terminal)
   │  (Kitchen accepts with ETA)
   ▼
[preparing]
   │  (Kitchen marks ready)
   ▼
[readyToServe]
   │  (Waiter delivers)
   ▼
[served]
   │  (Cashier bills / completes)
   ▼
[completed] (Terminal / Revenue Recognized)

* Cancellation: Any order in [draft, pendingApproval, approved, preparing] can transition to [cancelled] by Waiter, Cashier, or Admin.
```

---

## 5. Module-by-Module Feature Audit

### 5.1 Authentication (`/api/auth`)
* **Login:** Uses `phoneNumber` + `password` (stored using bcrypt with salt rounds = 10).
* **Token:** Signs a standard JWT with payload `{ sub: user._id, role: user.role }` expiring in 7 days (configurable).
* **Current User (`/me`):** Returns authenticated profile `{ id, name, phoneNumber, role, age, restrictions, isActive }`.
* **Status:** **Fully Implemented**.

### 5.2 User & Staff Management (`/api/users`)
* **Role Gate:** Admin only (`authorize(ROLES.ADMIN)`).
* **Operations:** Full CRUD (Create, List with filters, Get by ID, Patch details/password/status, Soft deactivate).
* **Roles Supported:** Exactly 4 enum values: `waiter`, `cashier`, `kitchen`, `admin`.
* **Status:** **Fully Implemented**.

### 5.3 Product & Menu Management (`/api/products`)
* **Operations:** Read open to all authenticated staff; Create, Update, Soft-delete restricted to `admin`.
* **Realtime Sync:** Emits `menu:updated` to all staff clients when items are created, updated, or removed.
* **Price Snapshotting:** When products are added to an order, product name and price are permanently snapshotted into `OrderItem` subdocuments.
* **Status:** **Fully Implemented**.

### 5.4 Tables & Floor Management (`/api/tables`)
* **Operations:**
  * Layout CRUD (Create, Update, Soft-delete) restricted to `admin`.
  * Occupancy actions (`seatTable`, `clearTable`, `setStatus`) permitted for `waiter`, `cashier`, and `admin`.
* **Realtime Sync:** Emits `table:created`, `table:updated`, `table:removed` to all clients.
* **Status:** **Fully Implemented**.

### 5.5 Customer Directory (`/api/customers`)
* **Operations:** Search by name/phone, Get by ID, Upsert customer on seating/order creation.
* **Auto De-duplication:** Matches existing records by phone number and increments `visitCount`.
* **Status:** **Fully Implemented**.

### 5.6 Orders & POS Billing (`/api/orders`)
* **Operations:** Full lifecycle endpoints from creation through drafting, cashier approval, kitchen preparation, ready-to-serve notification, waiter dispatch, and cashier settlement.
* **Calculations:** Automatically calculates 5% tax (`TAX_RATE = 0.05`), applies order discounts, and computes total price.
* **Status:** **Fully Implemented**.

### 5.7 Reports & Analytics (`/api/reports`)
* **Operations:**
  * `GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` — Order counts by status, gross revenue, net subtotal, collected tax, discounts, average order value (AOV), and top 10 products sold.
  * `GET /api/reports/floor` — Real-time table status counts (available, occupied, reserved, cleaning) and overall occupancy rate.
* **Status:** **Fully Implemented**.
