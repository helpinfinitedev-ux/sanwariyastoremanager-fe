# Super Admin Feature Map: Frontend Architecture Mapped to Backend APIs

This document maps all features available in the Super Admin Web Frontend to the verified endpoints, schemas, and realtime events in `sr-backend`.

---

## 1. Executive Dashboard (`/dashboard`)
*The central command screen aggregating live operations and daily financial performance.*

| Frontend UI Component | Backend Data Source | Endpoint & Method | Realtime Socket Trigger | Notes |
|---|---|---|---|---|
| **KPI: Today's Gross Revenue** | Computed sum of completed orders | `GET /api/reports/summary` | `order:completed` | Sums `totalPrice` for completed orders within selected range. |
| **KPI: Completed Orders Count** | `completedOrders` | `GET /api/reports/summary` | `order:completed` | Count of orders that have been paid & closed. |
| **KPI: Average Order Value (AOV)** | `averageOrderValue` | `GET /api/reports/summary` | `order:completed` | Computed as `revenue / completedOrders`. |
| **KPI: Live Table Occupancy** | `occupancyRate` | `GET /api/reports/floor` | `table:updated` | Live percentage of active tables currently occupied. |
| **Live Order Funnel Widget** | `ordersByStatus` | `GET /api/reports/summary` | `order:*` | Counts breakdown for all 9 states: Draft, Pending, Approved, Preparing, Ready, Served, Completed, Cancelled, Rejected. |
| **Top 10 Selling Products** | `topProducts` | `GET /api/reports/summary` | `order:completed` | Ranked table by units sold and revenue contribution. |
| **Active Table Status Grid** | `available`, `occupied`, `reserved`, `cleaning` | `GET /api/reports/floor` | `table:updated` | Snapshot counts of tables in each state. |

---

## 2. Live Operations Monitoring

### 2.1 Live Orders Monitor (`/operations/orders`)
*Full oversight over active restaurant orders across all 3 client apps (Waiters, Cashiers, Kitchen).*

* **Data Fetch:** `GET /api/orders?status=&waiter=&tableNo=`
* **Socket Listeners:** `order:created`, `order:updated`, `order:pendingApproval`, `order:approved`, `order:rejectedByCashier`, `order:preparing`, `order:rejected`, `order:readyToServe`, `order:served`, `order:completed`, `order:cancelled`.
* **Available Actions for Super Admin:**
  * View complete snapshot details (Item lines, notes, quantities, subtotal, 5% tax, discount, total price).
  * Inspect `statusHistory` audit trail (Timestamp, user who transitioned, rejection/cancellation reasons).
  * **Emergency Admin Overrides:** Super Admin can execute any valid lifecycle move or force emergency status changes via `PATCH /api/orders/:id/status`.

### 2.2 Live Floor Plan & Table Monitor (`/operations/tables`)
*Live floor map showing all restaurant sections, table occupancy, and assigned staff.*

* **Data Fetch:** `GET /api/tables?includeInactive=false`
* **Socket Listeners:** `table:created`, `table:updated`, `table:removed`
* **Features:**
  * Grouped by `section` (e.g. Ground Floor, Terrace, Main).
  * Color-coded statuses: Available (Green), Occupied (Blue), Reserved (Amber), Cleaning (Purple).
  * Live occupancy popover: Customer Name, Guest Count, Assigned Waiter, Seated Duration (`occupiedAt`).
  * Admin Actions: `POST /api/tables/:id/seat`, `POST /api/tables/:id/clear`, `POST /api/tables/:id/status`.

### 2.3 Kitchen Display (KDS) Oversight (`/operations/kds`)
*Live view of orders currently in the kitchen station.*

* **Data Fetch:** `GET /api/orders?status=approved` and `GET /api/orders?status=preparing`
* **Features:**
  * Displays tickets with `liveOrderId` (e.g. `A-042`), table number, and line items with preparation notes.
  * Elapsed preparation timers tracking against `eta`.
  * Realtime notification when items are marked `readyToServe` or `rejected`.

---

## 3. Restaurant Master Data Management

### 3.1 Menu & Product Catalog (`/menu/products`)
*Create, update, and manage restaurant food items and pricing.*

* **Data Fetch:** `GET /api/products?includeInactive=true`
* **Create Product Modal / Drawer (`POST /api/products`):**
  * `name` (String, required)
  * `description` (String)
  * `price` (Number, selling rate)
  * `category` (String, e.g. Starters, Main Course, Breads, Beverages, Desserts)
  * `foodType` (Enum: `veg`, `nonveg`, `egg`)
  * `isAvailable` (Boolean toggle — 86 / out of stock)
  * `prepTimeMins` (Number — Kitchen ETA guidance)
  * `imageUrl` (String URL)
  * `stock` (Number — optional simple count)
* **Admin Actions:**
  * Quick Availability Toggle (`PATCH /api/products/:id` `{ isAvailable: boolean }`).
  * Price Adjustment (`PATCH /api/products/:id` `{ price: number }`).
  * Soft Delete (`DELETE /api/products/:id` — sets `isActive: false` preserving order history).
* **Realtime Broadcasting:** Emits `menu:updated` to immediately sync Waiter apps and Cashier POS.

### 3.2 Tables & Floor Architecture (`/restaurant/tables`)
*Configure the physical restaurant seating and layout.*

* **Data Fetch:** `GET /api/tables?includeInactive=true`
* **Admin Actions:**
  * **Add Table (`POST /api/tables`):** `tableNo` (Unique string), `label` (e.g. "Window Table 4"), `section` (e.g. "Main Dining"), `capacity` (Default 4).
  * **Edit Table (`PATCH /api/tables/:id`):** Update label, section, or capacity.
  * **Deactivate Table (`DELETE /api/tables/:id`):** Soft delete (`isActive: false`).

### 3.3 Customer Directory (`/customers`)
*Directory of restaurant patrons and returning guests.*

* **Data Fetch:** `GET /api/customers?search=`
* **Attributes Displayed:** Name, Phone Number, Total Visits (`visitCount`), Last Table Number, Last Visit Date (`lastVisitAt`), Dietary Notes.
* **Actions:** Manually register a guest via `POST /api/customers`.

---

## 4. Staff & User Administration (`/staff/users`)
*Control user accounts, staff roles, and access credentials.*

* **Data Fetch:** `GET /api/users?role=&isActive=`
* **Create User (`POST /api/users`):**
  * `name` (String)
  * `phoneNumber` (Unique login identifier)
  * `password` (Raw password, hashed automatically by Mongoose pre-save hook)
  * `role` (`waiter` | `cashier` | `kitchen` | `admin`)
  * `age` (Optional number)
  * `restrictions` (Array of custom deny tags, e.g. `["cannot_void_bill"]`)
* **Edit User (`PATCH /api/users/:id`):**
  * Change role, name, phone number, restrictions, or reset password.
* **Deactivate User (`DELETE /api/users/:id`):**
  * Sets `isActive: false`. Immediate session invalidation via JWT check in `authenticate` middleware.

---

## 5. Reports & Business Analytics (`/reports`)

### 5.1 Sales & Revenue Audit (`/reports/sales`)
*Comprehensive sales audit for any selected date range.*

* **Endpoint:** `GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD`
* **Filters:** From Date, To Date (defaults to today midnight to current time).
* **Analytics Provided:**
  * Gross Revenue (recognized on `completed` orders only).
  * Net Food Subtotal, 5% Tax Collection, and Order Discounts.
  * Average Order Value (AOV).
  * Order status distribution counts.
  * Top selling menu items (units and revenue).

### 5.2 Floor Occupancy Analytics (`/reports/floor`)
*Floor utilization report.*

* **Endpoint:** `GET /api/reports/floor`
* **Analytics Provided:** Total table count, occupied count, available count, reserved count, cleaning count, and live occupancy percentage rate.
