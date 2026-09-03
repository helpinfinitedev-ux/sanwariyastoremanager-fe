export const ROUTES = {
  AUTH: {
    ROOT: 'AuthRoot',
    LOGIN: 'Login',
  },
  MAIN: {
    ROOT: 'MainRoot',
    DASHBOARD: 'Dashboard',
    PURCHASE: 'PurchaseStack',
    INVENTORY: 'InventoryStack',
    KITCHEN_ISSUE: 'KitchenIssueStack',
    WASTE: 'WasteStack',
    STOCK_MOVEMENT: 'StockMovementStack',
    VENDORS: 'VendorsStack',
    EXPENSES: 'ExpensesStack',
    REPORTS: 'ReportsStack',
    PROFILE: 'ProfileStack',
  },
  PURCHASE_SCREENS: {
    LIST: 'PurchaseList',
    DETAILS: 'PurchaseDetails',
    CREATE: 'CreatePurchase',
    EDIT: 'EditPurchase',
  },
  VENDORS_SCREENS: {
    LIST: 'VendorList',
    DETAILS: 'VendorDetails',
  },
  EXPENSES_SCREENS: {
    MAIN: 'ExpensesMain',
  },
  INVENTORY_SCREENS: {
    LIST: 'InventoryList',
    DETAILS: 'ProductDetails',
  },
  KITCHEN_ISSUE_SCREENS: {
    LIST: 'KitchenIssueList', // IssueHistoryScreen
    CREATE: 'CreateKitchenIssue', // IssueStockScreen
    DETAILS: 'KitchenIssueDetails',
  },
  WASTE_SCREENS: {
    LIST: 'WasteList', // WasteHistoryScreen
    CREATE: 'CreateWaste', // WasteEntryScreen
    DETAILS: 'WasteDetails',
  },
  STOCK_MOVEMENT_SCREENS: {
    LIST: 'StockMovementList',
  },
  REPORTS_SCREENS: {
    HOME: 'ReportsHome',
    PURCHASE: 'PurchaseReport',
    INVENTORY: 'InventoryReport',
    KITCHEN_ISSUE: 'KitchenIssueReport',
    WASTE: 'WasteReport',
    STOCK_MOVEMENT: 'StockMovementReport',
    EXPENSE: 'ExpenseReport',
    VENDORS: 'VendorPayablesReport',
  },
  PROFILE_SCREENS: {
    DETAILS: 'ProfileDetails',
  },
} as const;
