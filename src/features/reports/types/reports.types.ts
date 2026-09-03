export interface DateRangeFilterParams {
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DashboardReportData {
  inventory: {
    totalItems: number;
    inventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  purchases: {
    totalAmount: number;
    count: number;
  };
  expenses: {
    totalAmount: number;
    count: number;
  };
  kitchenIssues: {
    count: number;
    totalQuantity: number;
    totalValue: number;
  };
  waste: {
    count: number;
    totalQuantity: number;
    totalValue: number;
  };
  payables: {
    totalPurchases: number;
    totalPayments: number;
    outstanding: number;
  };
}

export interface PurchaseAnalyticsData {
  summary: {
    totalSpent: number;
    purchaseCount: number;
    avgOrderRate: number;
    activeVendorsCount: number;
  };
  trend: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  byVendor: Array<{
    vendorId: string;
    vendorName: string;
    amount: number;
    count: number;
  }>;
  tableData: Array<{
    id: string;
    invoiceNumber: string;
    date: string;
    vendor: string;
    itemsCount: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentStatus: string;
  }>;
}

export interface ExpenseAnalyticsData {
  summary: {
    totalExpense: number;
    expenseCount: number;
    avgExpense: number;
  };
  trend: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  byCategory: Array<{
    category: string;
    totalAmount: number;
    count: number;
  }>;
  byPaymentMethod: Array<{
    paymentMethod: string;
    totalAmount: number;
    count: number;
  }>;
  tableData: Array<{
    id: string;
    date: string;
    category: string;
    amount: number;
    paymentMethod: string;
    description?: string;
    recordedBy: string;
  }>;
}

export interface InventoryAnalyticsData {
  summary: {
    totalItems: number;
    totalValuation: number;
    lowStockCount: number;
    outOfStockCount: number;
    overStockCount: number;
  };
  byCategory: Array<{
    category: string;
    valuation: number;
  }>;
  tableData: Array<{
    id: string;
    sku: string;
    name: string;
    category: string;
    unit: string;
    stock: number;
    rate: number;
    valuation: number;
    minimumStock: number;
    stockStatus: string;
  }>;
}

export interface StockMovementAnalyticsData {
  summary: {
    totalMovements: number;
    totalInQuantity: number;
    totalOutQuantity: number;
  };
  byMovementType: Array<{
    movementType: string;
    quantity: number;
    count: number;
  }>;
  trend: Array<{
    date: string;
    movementType: string;
    quantity: number;
  }>;
}

export interface KitchenConsumptionAnalyticsData {
  summary: {
    totalDispatches: number;
    totalQuantity: number;
    totalValue: number;
    activeSectionsCount: number;
  };
  bySection: Array<{
    section: string;
    count: number;
  }>;
  byIngredient: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    valuation: number;
  }>;
  tableData: Array<{
    id: string;
    date: string;
    destination: string;
    itemsCount: number;
    itemsList: string;
  }>;
}

export interface WasteAnalyticsData {
  summary: {
    totalFinancialLoss: number;
    wasteRecordCount: number;
    averageCostPerLoss: number;
    totalQuantityLost: number;
  };
  byReason: Array<{
    reason: string;
    count: number;
  }>;
  byIngredient: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    financialLoss: number;
  }>;
  tableData: Array<{
    id: string;
    date: string;
    reason: string;
    notes?: string;
    itemsCount: number;
    itemsList: string;
  }>;
}

export interface VendorPayablesAnalyticsData {
  summary: {
    totalPurchases: number;
    totalPayments: number;
    totalOutstanding: number;
    activeVendorsCount: number;
  };
  vendors: Array<{
    vendorId: string;
    vendorName: string;
    contactPerson?: string;
    phone?: string;
    totalPurchases: number;
    totalPayments: number;
    outstanding: number;
  }>;
}
