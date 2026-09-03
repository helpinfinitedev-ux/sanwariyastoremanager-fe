# Complete API Inventory: Sanwariya Restaurant Backend (`sr-backend`)

All routes are prefixed with `/api`.  
Base URL: `http://localhost:5000/api` (or configured `PORT`).

---

## 1. System Health
| Method | Endpoint | Auth | Allowed Roles | Query Params | Request Body | Response Data Shape | Realtime Event |
|---|---|---|---|---|---|---|---|
| `GET` | `/health` | No | Public | None | None | `{ success: true, data: { status: "ok" } }` | None |

---

## 2. Authentication Module (`/auth`)
| Method | Endpoint | Auth | Allowed Roles | Query Params | Request Body | Response Data Shape | Realtime Event |
|---|---|---|---|---|---|---|---|
| `POST` | `/auth/login` | No | Public | None | `{ phoneNumber, password }` | `{ success: true, data: { token, user: { id, name, phoneNumber, role, age, restrictions, isActive } } }` | None |
| `GET` | `/auth/me` | Yes (JWT) | Any active user | None | None | `{ success: true, data: { id, name, phoneNumber, role, age, restrictions, isActive } }` | None |

---

## 3. User & Staff Management Module (`/users`)
*All endpoints in this group require `admin` role.*

| Method | Endpoint | Auth | Allowed Roles | Query Params | Request Body | Response Data Shape | Realtime Event |
|---|---|---|---|---|---|---|---|
| `POST` | `/users` | Yes | `admin` | None | `{ name, phoneNumber, password, role, age?, restrictions? }` | `{ success: true, data: UserObject }` (Status 201) | None |
| `GET` | `/users` | Yes | `admin` | `role`, `isActive` | None | `{ success: true, data: [UserObject] }` | None |
| `GET` | `/users/:id` | Yes | `admin` | None | None | `{ success: true, data: UserObject }` | None |
| `PATCH` | `/users/:id` | Yes | `admin` | None | `{ name?, phoneNumber?, password?, role?, age?, restrictions?, isActive? }` | `{ success: true, data: UserObject }` | None |
| `DELETE`| `/users/:id` | Yes | `admin` | None | None | `{ success: true, data: UserObject }` *(Sets `isActive: false`)* | None |

---

## 4. Product & Menu Management Module (`/products`)
| Method | Endpoint | Auth | Allowed Roles | Query Params | Request Body | Response Data Shape | Realtime Event |
|---|---|---|---|---|---|---|---|
| `GET` | `/products` | Yes | All Staff | `category`, `isAvailable`, `includeInactive` | None | `{ success: true, data: [ProductObject] }` | None |
| `GET` | `/products/:id` | Yes | All Staff | None | None | `{ success: true, data: ProductObject }` | None |
| `POST` | `/products` | Yes | `admin` | None | `{ name, description?, price, category?, foodType?, isAvailable?, prepTimeMins?, imageUrl?, stock? }` | `{ success: true, data: ProductObject }` (Status 201) | `menu:updated` (`action: "created"`) |
| `PATCH` | `/products/:id` | Yes | `admin` | None | `{ name?, description?, price?, category?, foodType?, isAvailable?, prepTimeMins?, imageUrl?, stock?, isActive? }` | `{ success: true, data: ProductObject }` | `menu:updated` (`action: "updated"`) |
| `DELETE`| `/products/:id` | Yes | `admin` | None | None | `{ success: true, data: ProductObject }` *(Sets `isActive: false`)* | `menu:updated` (`action: "removed"`) |

---

## 5. Table & Floor Management Module (`/tables`)
| Method | Endpoint | Auth | Allowed Roles | Query Params | Request Body | Response Data Shape | Realtime Event |
|---|---|---|---|---|---|---|---|
| `GET` | `/tables` | Yes | All Staff | `status`, `section`, `waiter`, `includeInactive` | None | `{ success: true, data: [TableObject] }` *(populates waiter)* | None |
| `GET` | `/tables/:id` | Yes | All Staff | None | None | `{ success: true, data: TableObject }` | None |
| `POST` | `/tables` | Yes | `admin` | None | `{ tableNo, label?, section?, capacity? }` | `{ success: true, data: TableObject }` (Status 201) | `table:created` |
| `PATCH` | `/tables/:id` | Yes | `admin` | None | `{ label?, section?, capacity? }` | `{ success: true, data: TableObject }` | `table:updated` |
| `DELETE`| `/tables/:id` | Yes | `admin` | None | None | `{ success: true, data: TableObject }` *(Sets `isActive: false`)* | `table:removed` |
| `POST` | `/tables/:id/seat` | Yes | `waiter`, `cashier`, `admin` | None | `{ customerName?, guestCount?, waiterId? }` | `{ success: true, data: TableObject }` *(sets occupied)* | `table:updated` |
| `POST` | `/tables/:id/clear` | Yes | `waiter`, `cashier`, `admin` | None | None | `{ success: true, data: TableObject }` *(sets available)* | `table:updated` |
| `POST` | `/tables/:id/status`| Yes | `waiter`, `cashier`, `admin` | None | `{ status: "available" \| "occupied" \| "reserved" \| "cleaning" }` | `{ success: true, data: TableObject }` | `table:updated` |

---

## 6. Customer Management Module (`/customers`)
| Method | Endpoint | Auth | Allowed Roles | Query Params | Request Body | Response Data Shape | Realtime Event |
|---|---|---|---|---|---|---|---|
| `GET` | `/customers` | Yes | All Staff | `search`, `phoneNumber` | None | `{ success: true, data: [CustomerObject] }` | None |
| `GET` | `/customers/:id` | Yes | All Staff | None | None | `{ success: true, data: CustomerObject }` | None |
| `POST` | `/customers` | Yes | `waiter`, `cashier`, `admin` | None | `{ name, phoneNumber?, guestCount?, notes?, tableNo? }` | `{ success: true, data: CustomerObject }` *(upserts by phone)* | None |

---

## 7. Order Lifecycle Module (`/orders`)
| Method | Endpoint | Auth | Allowed Roles | Query Params | Request Body | Response Data Shape | Realtime Event |
|---|---|---|---|---|---|---|---|
| `GET` | `/orders` | Yes | All Staff | `status`, `waiter`, `tableNo` | None | `{ success: true, data: [OrderObject] }` | None |
| `GET` | `/orders/:id` | Yes | All Staff | None | None | `{ success: true, data: OrderObject }` | None |
| `POST` | `/orders` | Yes | `waiter`, `admin` | None | `{ tableNo?, customerName?, customerPhone?, guestCount?, discount?, items: [{ productId, quantity, notes? }] }` | `{ success: true, data: OrderObject }` *(Status: draft, generates liveOrderId)* | `order:created` |
| `PATCH` | `/orders/:id` | Yes | `waiter`, `admin` | None | `{ tableNo?, customerName?, discount?, items?: [...] }` | `{ success: true, data: OrderObject }` *(only when draft)* | `order:updated` |
| `POST` | `/orders/:id/send` | Yes | `waiter`, `admin` | None | None | `{ success: true, data: OrderObject }` *(draft -> pendingApproval)* | `order:pendingApproval` |
| `POST` | `/orders/:id/approve` | Yes | `cashier`, `admin` | None | None | `{ success: true, data: OrderObject }` *(pendingApproval -> approved)* | `order:approved` |
| `POST` | `/orders/:id/send-back`| Yes | `cashier`, `admin` | None | `{ reason: String }` | `{ success: true, data: OrderObject }` *(pendingApproval -> draft)* | `order:rejectedByCashier` |
| `POST` | `/orders/:id/accept` | Yes | `kitchen`, `admin` | None | `{ eta: ISO Date / Number }` | `{ success: true, data: OrderObject }` *(approved -> preparing)* | `order:preparing` |
| `POST` | `/orders/:id/reject` | Yes | `kitchen`, `admin` | None | `{ reason: String }` | `{ success: true, data: OrderObject }` *(approved -> rejected)* | `order:rejected` |
| `POST` | `/orders/:id/ready` | Yes | `kitchen`, `admin` | None | None | `{ success: true, data: OrderObject }` *(preparing -> readyToServe)* | `order:readyToServe` |
| `POST` | `/orders/:id/serve` | Yes | `waiter`, `admin` | None | None | `{ success: true, data: OrderObject }` *(readyToServe -> served)* | `order:served` |
| `POST` | `/orders/:id/complete`| Yes | `cashier`, `admin` | None | None | `{ success: true, data: OrderObject }` *(served -> completed)* | `order:completed` |
| `POST` | `/orders/:id/cancel` | Yes | `waiter`, `cashier`, `admin` | None | `{ reason?: String }` | `{ success: true, data: OrderObject }` *(moves to cancelled)* | `order:cancelled` |
| `PATCH` | `/orders/:id/status`| Yes | Authenticated / Admin | None | `{ status: String, reason?: String, eta?: String }` | `{ success: true, data: OrderObject }` *(generic state transition)* | Contextual event |

---

## 8. Reports & Analytics Module (`/reports`)
| Method | Endpoint | Auth | Allowed Roles | Query Params | Request Body | Response Data Shape | Realtime Event |
|---|---|---|---|---|---|---|---|
| `GET` | `/reports/summary` | Yes | `cashier`, `admin` | `from` (ISO Date), `to` (ISO Date) | None | `{ success: true, data: { range: { from, to }, totalOrders, ordersByStatus, completedOrders, revenue, subtotal, tax, discount, averageOrderValue, topProducts: [{ name, quantity, revenue }] } }` | None |
| `GET` | `/reports/floor` | Yes | `cashier`, `admin` | None | None | `{ success: true, data: { total, available, occupied, reserved, cleaning, occupancyRate, _statuses } }` | None |
