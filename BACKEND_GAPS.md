# Backend Gaps & Capability Analysis: `sr-backend`

> **Critical Rule:** The backend is the source of truth. Features that do not have corresponding models, services, and endpoints in `sr-backend` must not be assumed or coded into the Super Admin frontend without backend extensions.

---

## 1. Feature Status Breakdown

### 🟢 1.1 Fully Implemented Features (Ready for Frontend Integration)
1. **Authentication & Session Management:**
   * JWT-based authentication via `POST /api/auth/login` and `GET /api/auth/me`.
   * Hashed passwords via `bcryptjs` (salt rounds: 10).
2. **Staff & User Management:**
   * Full CRUD operations via `/api/users`.
   * Roles: `waiter`, `cashier`, `kitchen`, `admin`.
   * Soft-deactivation pattern (`isActive: false`).
3. **Menu / Product Catalog:**
   * Full CRUD via `/api/products`.
   * Attributes: Name, description, price, category, veg/non-veg/egg type, prep time, image URL, availability.
   * Realtime broadcast on updates (`menu:updated`).
4. **Table & Floor Management:**
   * Full CRUD via `/api/tables`.
   * Attributes: Table number, label, section name, seating capacity, live occupancy.
   * Status lifecycle: `available`, `occupied`, `reserved`, `cleaning`.
   * Seating and clearing actions.
   * Realtime broadcast on updates (`table:*`).
5. **Customer Directory:**
   * Auto-upserting guests via phone number on seating/ordering (`POST /api/customers`).
   * Search by name and phone number (`GET /api/customers`).
   * Historical visit tracking (`visitCount`, `lastTableNo`, `lastVisitAt`).
6. **Order State Machine & Lifecycle:**
   * Complete transition engine: `draft` -> `pendingApproval` -> `approved` -> `preparing` -> `readyToServe` -> `served` -> `completed`.
   * Rejections with reasons and cancellations with reasons.
   * Atomic daily sequential running numbers (`liveOrderId`, e.g. "001", "042").
   * Snapshotting of product names and prices into orders at add time.
   * Automatic subtotal, 5% tax, and discount computation.
   * Socket.IO event broadcasting to role-specific rooms.
7. **Basic Analytics & Reports:**
   * Sales & financial summary for any date range (`GET /api/reports/summary`).
   * Floor status & occupancy analytics (`GET /api/reports/floor`).

---

### 🟡 1.2 Partially Implemented Features
1. **Staff Restrictions:**
   * The `User` model stores an array of strings `restrictions: [String]` (e.g. `cannot_void_bill`).
   * **Gap:** The backend does **not** evaluate these strings in middleware or services. Access is currently governed strictly by `role`.
2. **Product Stock Tracking:**
   * The `Product` model has an optional `stock: Number` field.
   * **Gap:** Stock is a raw number that is not automatically decremented when orders are placed or completed, nor are there restock or low-stock alerts.
3. **Multi-Section Floor Layout:**
   * The `Table` model stores a `section` string (e.g. "Ground Floor", "Terrace").
   * **Gap:** There is no separate `Section` or `Floor` model. Coordinates (X/Y) or canvas layout dimensions are not stored; tables are only returned as an array sorted by `section tableNo`.
4. **Order Types:**
   * Orders store `tableNo` and optional customer details.
   * **Gap:** There is no formal `orderType` enum (`dine_in`, `takeaway`, `delivery`). Orders without `tableNo` are accepted, but delivery addresses or aggregator references are not modeled.

---

### 🔴 1.3 Missing / Not Implemented Features (Backend Extensions Required)

The following modules exist in frontend prototypes or full-scale ERPs, but have **zero backend endpoints, models, or services** in `sr-backend`:

| Missing Feature | What is Missing in Backend | Impact on Super Admin Frontend |
|---|---|---|
| **Raw Material Inventory & Recipes** | No `Ingredient` model, no recipe mapping (BOM), no unit conversions (Kg, L, pcs), no minimum threshold alerts. | Super Admin cannot track ingredient stock or automatic consumption per dish without adding backend models. |
| **Purchases & Restock Management** | No `PurchaseOrder` model, no vendor/supplier collection, no GRN (Goods Received Note), no invoice tracking. | Cannot manage supplier restock invoices in Super Admin yet. |
| **Food Waste & Spoilage Ledger** | No `Waste` model, no waste reason codes, no financial shrinkage calculation. | Waste tracking cannot be recorded in the centralized backend yet. |
| **Kitchen Stock Issues** | No `KitchenIssue` model for dispatching bulk ingredients from dry storage to kitchen stations. | Cannot track internal inventory dispatches. |
| **Payments & POS Settlement** | Order model has `totalPrice`, but **no payment fields** (payment method: cash, card, UPI; payment status; transaction ID; tendered amount; change returned). | Super Admin can see billed amounts, but cannot filter by payment mode (Cash vs Card vs UPI) until payment fields are added to `Order`. |
| **Split Billing & Multi-Bill POS** | No split order capability. Orders must be paid and completed as a single bill. | Cannot offer split bill settlements. |
| **Image File Uploads** | No file upload routes (`multer`, Cloudinary, S3, or local static upload). Product `imageUrl` is simply a string. | Frontend must either provide external image URLs or a backend upload route must be created. |
| **Multi-Branch / Multi-Tenant Settings** | No `Restaurant` or `Branch` model. The backend is single-tenant. | Cannot manage multiple restaurant branches under one Super Admin account. |
| **Tax & System Settings** | Tax rate (`5%`) and currency (`INR`) are hardcoded in `order.service.js` and `.env`. There is no `/api/settings` endpoint. | Super Admin cannot configure taxes, service charges, or business hours from the UI. |
| **Report Exports** | `/api/reports/summary` returns JSON data, but has no PDF/CSV file generation. | Super Admin frontend must implement client-side export (e.g. CSV generation via JavaScript). |

---

## 2. Recommended Strategy for Super Admin Frontend

1. **Focus on Verified Core Modules:** Build the Super Admin frontend strictly around the 7 fully implemented backend modules (Dashboard, Live Orders, Floor Monitor, KDS Mirror, Menu Management, Table Configuration, Staff Administration, Customer Directory, Sales Reports).
2. **Handle File Uploads via External URLs or Simple Input:** Use image URL strings for menu items until a backend file-upload service is deployed.
3. **Implement Client-Side CSV Export:** The frontend can easily serialize JSON from `/api/reports/summary` into downloadable CSV spreadsheets without needing backend modifications.
4. **Phase 2 Backend Roadmap:** When raw material inventory, purchases, and payments are required, develop the corresponding Mongoose models and Express routes before exposing them in the Super Admin interface.
