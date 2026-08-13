# Restaurant Store ERP — Phase 1 (Store Manager) — Frontend Task Doc

> Scope: **Frontend only**. No backend. Mock data + mock API layer designed for future real API swap.
> Role: **Store Manager only** (single role, no RBAC complexity needed in Phase 1).

---

## 1. Objective

Build a **production-ready, enterprise-grade** React Native (Expo + TypeScript) frontend for a Restaurant Store ERP system, Phase 1 only. UI/UX should feel like SAP / Oracle Fusion / Zoho Inventory — dense data tables, clean forms, strong information hierarchy, desktop-first but responsive down to tablet.

## 2. Hard Constraints (Do NOT Break)

- ❌ No Super Admin, Cashier/POS, Waiter, KDS, Sales, Billing, CRM, HRM, Payroll, Customer Management, Multi-Branch, Accounting modules.
- ❌ No backend calls — mock data only, but structured so swapping to real APIs later requires touching only the service/query layer.
- ❌ No business logic inside UI components (validation rules, calculations, stock logic all live in `services/` or `utils/`, hooks call them).
- ❌ Do not restructure or rename existing project architecture if one already exists — extend it.
- ✅ Feature-First folder structure.
- ✅ Zustand for local/UI state (auth session, theme, filters, drawer state).
- ✅ React Query (TanStack Query) architecture — `useQuery`/`useMutation` wrapping mock service functions, so later only the fetcher function body changes (mock → axios/fetch).
- ✅ MMKV for persisted local storage (auth token, theme preference, last filters).
- ✅ React Navigation (stack + drawer/tab hybrid, desktop-first side nav).
- ✅ TypeScript strict mode.

---

## 3. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Expo (React Native) + TypeScript (strict) |
| Navigation | React Navigation (Drawer for desktop sidebar + native stack per feature) |
| Server-state | @tanstack/react-query (mock query functions) |
| Client/UI state | Zustand |
| Storage | react-native-mmkv |
| Forms | react-hook-form + zod (schema validation) |
| Tables | Custom `DataTable` component (virtualized for large lists via FlashList) |
| Icons | @expo/vector-icons |
| Charts (KPI trends) | victory-native or react-native-svg-charts |
| Theming | Custom ThemeProvider (Context) + Zustand persisted preference — Light/Dark |
| Toasts | react-native-toast-message or custom Toast provider |
| Date handling | dayjs |

---

## 4. Feature-First Folder Structure

```
src/
├── app/                        # Navigation root, providers, theme bootstrap
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainDrawerNavigator.tsx
│   │   └── types.ts
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ToastProvider.tsx
│   └── App.tsx
│
├── features/
│   ├── auth/
│   │   ├── screens/ (LoginScreen, ProfileScreen)
│   │   ├── components/ (LoginForm, SessionGuard)
│   │   ├── store/ (authStore.ts — Zustand: user, token, isAuthenticated)
│   │   ├── services/ (authService.mock.ts)
│   │   ├── hooks/ (useLogin, useLogout, useSession)
│   │   └── types.ts
│   │
│   ├── dashboard/
│   │   ├── screens/ (DashboardScreen)
│   │   ├── components/ (KpiCard, RecentActivityList, QuickActionsGrid)
│   │   ├── services/ (dashboardService.mock.ts)
│   │   ├── hooks/ (useDashboardKpis, useRecentActivities)
│   │   └── types.ts
│   │
│   ├── purchase/
│   │   ├── screens/ (PurchaseListScreen, PurchaseDetailsScreen, CreatePurchaseScreen, EditPurchaseScreen)
│   │   ├── components/ (PurchaseTable, PurchaseFilters, InvoiceUploader, PurchaseForm, StatusBadge)
│   │   ├── store/ (purchaseFilterStore.ts)
│   │   ├── services/ (purchaseService.mock.ts)
│   │   ├── hooks/ (usePurchases, usePurchaseById, useCreatePurchase, useUpdatePurchase)
│   │   └── types.ts
│   │
│   ├── inventory/
│   │   ├── screens/ (InventoryListScreen, ProductDetailsScreen)
│   │   ├── components/ (InventoryTable, StockStatusBadge, CategoryFilter, StockFilter)
│   │   ├── services/ (inventoryService.mock.ts)
│   │   ├── hooks/ (useInventoryList, useProductDetails)
│   │   └── types.ts
│   │
│   ├── kitchen-issue/
│   │   ├── screens/ (IssueStockScreen, IssueHistoryScreen, IssueDetailsScreen)
│   │   ├── components/ (IssueForm, IssueTable, IssueFilters)
│   │   ├── services/ (kitchenIssueService.mock.ts)
│   │   ├── hooks/ (useIssueHistory, useCreateIssue, useIssueDetails)
│   │   └── types.ts
│   │
│   ├── waste/
│   │   ├── screens/ (WasteEntryScreen, WasteHistoryScreen, WasteDetailsScreen)
│   │   ├── components/ (WasteForm, WasteTable, WasteFilters, ReasonBadge)
│   │   ├── services/ (wasteService.mock.ts)
│   │   ├── hooks/ (useWasteHistory, useCreateWaste, useWasteDetails)
│   │   └── types.ts
│   │
│   ├── stock-movement/
│   │   ├── screens/ (StockMovementScreen)
│   │   ├── components/ (MovementTimeline, MovementTable, MovementTypeBadge, MovementFilters)
│   │   ├── services/ (stockMovementService.mock.ts)
│   │   ├── hooks/ (useStockMovements)
│   │   └── types.ts
│   │
│   └── reports/
│       ├── screens/ (ReportsHomeScreen, PurchaseReportScreen, InventoryReportScreen,
│       │             KitchenIssueReportScreen, WasteReportScreen, StockMovementReportScreen)
│       ├── components/ (ReportCard, ReportFilters, ReportChart, ExportButton)
│       ├── services/ (reportsService.mock.ts)
│       ├── hooks/ (usePurchaseReport, useInventoryReport, ...)
│       └── types.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/ (Button, Input, Select, DatePicker, Badge, Card, Modal, Drawer, Tooltip)
│   │   ├── table/ (DataTable, TablePagination, TableToolbar, ColumnHeader, EmptyState)
│   │   ├── feedback/ (LoadingSpinner, SkeletonLoader, ErrorState, EmptyStateIllustration, ConfirmDialog, Toast)
│   │   └── layout/ (Sidebar, TopBar, PageHeader, ScreenContainer, ResponsiveGrid)
│   ├── hooks/ (useDebounce, usePagination, useResponsive, useConfirm)
│   ├── theme/ (colors.ts, typography.ts, spacing.ts, lightTheme.ts, darkTheme.ts)
│   ├── mock/ (mockDb.ts — central mock dataset, seed data per module, latency simulator)
│   ├── utils/ (formatters.ts, validators.ts, calculations.ts)
│   ├── constants/ (routes.ts, roles.ts, statusEnums.ts)
│   └── types/ (common.ts — Pagination<T>, ApiResponse<T>, FilterState, etc.)
│
├── store/
│   └── themeStore.ts, sessionStore.ts (global Zustand slices not tied to one feature)
│
└── storage/
    └── mmkv.ts (MMKV instance + typed get/set helpers)
```

---

## 5. Navigation Structure

Desktop-first **persistent left Sidebar** (collapsible on tablet) + top bar with profile/theme toggle.

Sidebar items (in order):
1. Dashboard
2. Purchase
3. Inventory
4. Kitchen Issue
5. Waste
6. Stock Movement
7. Reports
8. Profile (bottom, near logout)

Each sidebar item = its own stack navigator (List → Details/Create/Edit) so deep linking and back-stack work per feature.

Auth flow: `AuthNavigator` (Login) → on success → `MainDrawerNavigator`. Session persisted via MMKV + Zustand `authStore` rehydration on app boot with a splash/loading gate.

---

## 6. Screen-by-Screen Requirements

### 6.1 Auth
- **LoginScreen**: email/username + password, validation (zod), mock delay, error state, "remember me" (MMKV), loading button state.
- **ProfileScreen**: manager name, email, avatar placeholder, store name, change theme, logout button (with ConfirmDialog).
- **Session Management**: token stored in MMKV, auto-logout on token expiry simulation, session restore on app relaunch.

### 6.2 Dashboard
KPI Cards (grid, responsive 2/3/4 columns):
- Total Inventory Items
- Inventory Value (currency formatted)
- Low Stock (count, warning color)
- Out of Stock (count, danger color)
- Today's Purchase (amount + count)
- Today's Kitchen Issues (count)
- Today's Waste (value)

Each KPI card: icon, label, value, trend delta (optional), tap → navigates to relevant module filtered view.

- **Recent Activities**: unified feed (purchase created, stock issued, waste logged, adjustment) — timestamp, actor, description, icon per type.
- **Quick Actions**: buttons — New Purchase, Issue Stock, Log Waste, View Reports.

### 6.3 Purchase Management
- **PurchaseListScreen**: DataTable (Invoice#, Vendor, Date, Items, Amount, Status, Actions), filters (Date range, Vendor dropdown, Invoice Number search, Status), pagination, row click → drawer or details screen.
- **PurchaseDetailsScreen**: header summary, line items table, invoice file preview, status timeline, edit/delete actions.
- **CreatePurchaseScreen / EditPurchaseScreen**: vendor select, date picker, dynamic line-item rows (product, qty, unit cost, subtotal auto-calc via util not inline logic), invoice upload (image/pdf picker mock), save as Draft/Submit.
- **Upload Invoice**: file picker component, preview thumbnail, remove/replace.
- **Filters**: Date, Vendor, Invoice Number, Status — as a reusable `PurchaseFilters` panel (collapsible on tablet).

### 6.4 Inventory Management
- **InventoryListScreen**: DataTable (SKU, Product, Category, Current Stock, Min Stock, Purchase Cost, Avg Cost, Status Badge), Search bar (debounced), Category filter, Stock Status filter (In Stock/Low/Out), pagination.
- **ProductDetailsScreen**: product info card, stock levels (current/min/max), cost history mini chart, recent movements for that product (linked to Stock Movement feature).

### 6.5 Kitchen Issue
- **IssueStockScreen**: form — select product(s), quantity, issued-to (kitchen section, mock list), date, notes; multi-line item support like purchase.
- **IssueHistoryScreen**: DataTable (Date, Product, Qty, Issued By, Section), Filters (Date, Product).
- **IssueDetailsScreen**: full record view, linked stock movement entry.

### 6.6 Waste Management
- **WasteEntryScreen**: form — product, quantity, reason (dropdown: Expired, Spoiled, Damaged, Overproduction, Other), date, notes, optional photo.
- **WasteHistoryScreen**: DataTable (Date, Product, Qty, Reason, Value Lost), Filters (Date Range, Product, Reason).
- **WasteDetailsScreen**: full detail + reason badge + photo if present.

### 6.7 Stock Movement
- **StockMovementScreen**: 
  - **Timeline view** (chronological, icon-coded by type) and **Table view** toggle.
  - Movement Types: Purchase (in), Kitchen Issue (out), Waste (out), Adjustment (+/-).
  - Search (by product/reference), Date filter.
  - Each entry: type badge, product, qty change (+/−), balance after, reference link (navigates back to source record).

### 6.8 Reports
- **ReportsHomeScreen**: grid of report cards linking to each report type.
- **PurchaseReportScreen / InventoryReportScreen / KitchenIssueReportScreen / WasteReportScreen / StockMovementReportScreen**: 
  - Filter panel (date range primarily) 
  - Summary KPI strip
  - Chart (bar/line trend) 
  - Detailed table
  - Export button (UI only — triggers mock "export" toast, no real file generation required unless desired later).

---

## 7. Shared/Reusable Components (build once, reuse everywhere)

- `DataTable` — sortable columns, sticky header, row selection (optional), loading skeleton rows, empty state, responsive column hiding on tablet.
- `TablePagination` — page size selector, page navigation.
- `DetailsDrawer` — slide-in right panel for quick record view (used across Purchase/Inventory/Issue/Waste).
- `ConfirmDialog` — used for delete/logout/status-change actions.
- `FilterPanel` — generic collapsible filter container feeding a filter object.
- `StatusBadge` / `StockStatusBadge` / `MovementTypeBadge` / `ReasonBadge` — color-coded pill components.
- `KpiCard`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `Toast`.
- `PageHeader` — title, breadcrumb, primary action button.
- `Sidebar` / `TopBar` — layout shell, theme toggle, profile menu.

---

## 8. Mock Data & Service Layer Design

- `shared/mock/mockDb.ts`: in-memory seed data (vendors, products/categories, purchases, kitchen issues, waste entries, stock movements, activities) with realistic volume (e.g., 50–100 products, 30+ purchases) for pagination/filter testing.
- Each feature's `*.mock.ts` service exposes **async functions with the same signature a real API client would have**, e.g.:
  ```ts
  export async function getPurchases(params: PurchaseQueryParams): Promise<Paginated<Purchase>>
  export async function getPurchaseById(id: string): Promise<Purchase>
  export async function createPurchase(payload: CreatePurchaseDto): Promise<Purchase>
  ```
- Simulate network latency (300–800ms) and occasional error states (toggleable flag) to properly test Loading/Error/Empty UI states.
- React Query hooks (`usePurchases`, etc.) wrap these mock services — **only these service files need to change** when backend is ready (swap mock fetcher for axios call), hooks/components stay untouched.

---

## 9. State Management Plan

**Zustand stores:**
- `authStore` — user, token, isAuthenticated, login/logout actions (persisted via MMKV).
- `themeStore` — light/dark mode, persisted.
- Per-feature filter stores where filters must persist across navigation (e.g., `purchaseFilterStore`, `wasteFilterStore`) — optional, can also be local `useState` if filters don't need persistence.

**React Query:**
- All server-shaped data (lists, details, KPIs, reports) goes through React Query with proper `queryKey` structuring (e.g., `['purchases', filters, page]`) for caching/invalidation.
- Mutations (create/edit) invalidate relevant list queries on success + trigger Toast.

---

## 10. UX/States Checklist (apply to every list/detail screen)

- [ ] Loading state (skeleton, not spinner-only, for tables)
- [ ] Error state (retry button)
- [ ] Empty state (contextual message + primary action)
- [ ] Toast on create/update/delete success & failure
- [ ] Confirmation dialog before destructive actions
- [ ] Debounced search
- [ ] Pagination (page number + page size)
- [ ] Filters persist within session (not lost on tab switch)
- [ ] Responsive breakpoints: Desktop (>1024), Laptop (768–1024), Tablet (600–768) — landscape assumed primary

---

## 11. Theming

- Light & Dark theme objects (colors, surface, border, text, status colors: success/warning/danger/info).
- ThemeProvider + Zustand `themeStore` (persisted in MMKV), toggle in TopBar/Profile.
- Design tone: enterprise — neutral grays/blues, dense but readable spacing, avoid overly playful/consumer styling (SAP/Zoho/Oracle inspired).

---

## 12. Non-Goals (explicit — do not build)

Super Admin, Cashier/POS, Waiter App, KDS, Sales module, Billing/Invoicing (customer-facing), CRM, HRM, Payroll, Customer Management, Multi-Branch switching, Accounting/Ledger. Any of these appearing anywhere (nav, routes, mock data) is out of scope for Phase 1.

---

## 13. Definition of Done (Phase 1 Frontend)

- All screens listed in Section 6 implemented and navigable.
- Zero backend calls; all data via mock service layer.
- Strict TypeScript, no `any` in feature code.
- Reusable components used consistently (no ad-hoc duplicate tables/forms).
- Light & Dark theme both fully functional.
- Responsive verified at Desktop, Laptop, Tablet (landscape) widths.
- Loading/Error/Empty states present on every data screen.
- Auth session persists across app restarts (MMKV).