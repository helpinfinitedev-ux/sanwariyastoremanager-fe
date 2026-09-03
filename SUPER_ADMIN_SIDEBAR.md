# Super Admin Frontend: Navigation Architecture & Sidebar Map

The sidebar architecture is derived directly from verified backend endpoints in `sr-backend`. Modules that are not backed by real backend routes (such as raw material purchases or multi-branch settings) are omitted to preserve architectural integrity.

---

## 🧭 Proposed Sidebar Navigation Structure

```text
Sanwariya ERP — Super Admin
├── 📊 Dashboard
│   └── Overview & Live Stats              (/dashboard)
│
├── ⚡ Live Operations
│   ├── Live Orders Monitor                (/operations/orders)
│   ├── Table & Floor Monitor              (/operations/tables)
│   └── Kitchen (KDS) Monitor              (/operations/kds)
│
├── 🍽️ Menu Management
│   ├── Menu Items (Products)              (/menu/products)
│   └── Availability & Pricing             (/menu/availability)
│
├── 🏢 Restaurant Architecture
│   ├── Floor Plan & Tables                (/restaurant/tables)
│   └── Customer Directory                 (/restaurant/customers)
│
├── 👥 Staff & Access
│   ├── Staff Accounts                     (/staff/users)
│   └── Roles Overview                     (/staff/roles)
│
├── 📈 Reports & Analytics
│   ├── Sales & Revenue Summary            (/reports/sales)
│   └── Floor Occupancy Analytics          (/reports/occupancy)
│
└── ⚙️ Account & Session
    ├── Admin Profile                      (/profile)
    └── Logout                             (Auth Clear & Redirect)
```

---

## 📋 Sidebar Menu Item Details & Backend Route Mapping

| Sidebar Item | URL Path | Backend Endpoint(s) | Required Roles | Realtime Socket Events | Description |
|---|---|---|---|---|---|
| **📊 Dashboard** | `/dashboard` | `GET /api/reports/summary`<br>`GET /api/reports/floor` | `admin` | `order:*`<br>`table:updated` | Executive KPI cards, sales overview, live table occupancy, order status funnel, and top selling dishes. |
| **⚡ Live Orders** | `/operations/orders` | `GET /api/orders`<br>`PATCH /api/orders/:id/status`<br>`POST /api/orders/:id/*` | `admin` | `order:*` | Full view of all active/past orders with filter by status, table, or waiter, and admin emergency overrides. |
| **🪑 Table Monitor** | `/operations/tables` | `GET /api/tables`<br>`POST /api/tables/:id/*` | `admin` | `table:*` | Visual floor status map grouped by section. Quick actions to seat, clear, or reserve tables. |
| **🍳 KDS Monitor** | `/operations/kds` | `GET /api/orders?status=approved,preparing` | `admin` | `order:approved`<br>`order:preparing`<br>`order:readyToServe`<br>`order:rejected` | Read-only mirror of the Kitchen Display System showing tickets cooking, ETAs, and overdue warnings. |
| **🍽️ Menu Items** | `/menu/products` | `GET /api/products`<br>`POST /api/products`<br>`PATCH /api/products/:id`<br>`DELETE /api/products/:id` | `admin` | `menu:updated` | Full CRUD for menu dishes: name, category, price, veg/non-veg type, prep time, and image URL. |
| **⚡ Availability (86)**| `/menu/availability` | `GET /api/products`<br>`PATCH /api/products/:id` | `admin` | `menu:updated` | Dedicated fast-toggle grid for managers to 86 items or adjust daily product counts. |
| **🏢 Floor & Tables** | `/restaurant/tables` | `GET /api/tables`<br>`POST /api/tables`<br>`PATCH /api/tables/:id`<br>`DELETE /api/tables/:id` | `admin` | `table:*` | Configure physical tables: table numbers, sections (Ground Floor, Terrace), and seating capacities. |
| **👤 Customers** | `/restaurant/customers`| `GET /api/customers`<br>`POST /api/customers` | `admin` | None | Guest directory with visit counts, phone numbers, last seated table, and guest notes. |
| **👥 Staff Accounts** | `/staff/users` | `GET /api/users`<br>`POST /api/users`<br>`PATCH /api/users/:id`<br>`DELETE /api/users/:id` | `admin` | None | Create and manage employee logins (Waiters, Cashiers, Kitchen staff, Admins) and reset passwords. |
| **🛡️ Roles Overview** | `/staff/roles` | Read-only matrix view | `admin` | None | Informational matrix explaining permissions and access limits for each of the 4 backend roles. |
| **💰 Sales Analytics** | `/reports/sales` | `GET /api/reports/summary` | `admin` | None | Period sales report with custom date pickers, revenue breakdowns, tax, discounts, and item performance. |
| **📈 Floor Analytics** | `/reports/occupancy` | `GET /api/reports/floor` | `admin` | None | Historical and live table utilization rates and turnover metrics. |
| **👤 Admin Profile** | `/profile` | `GET /api/auth/me`<br>`PATCH /api/users/:id` | `admin` | None | View current admin details and change admin password. |
