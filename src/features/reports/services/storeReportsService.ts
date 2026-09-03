import apiClient from '../../../shared/services/apiClient';
import {
  DashboardReportData,
  PurchaseAnalyticsData,
  ExpenseAnalyticsData,
  InventoryAnalyticsData,
  StockMovementAnalyticsData,
  KitchenConsumptionAnalyticsData,
  WasteAnalyticsData,
  VendorPayablesAnalyticsData,
  DateRangeFilterParams,
} from '../types/reports.types';

export const storeReportsService = {
  getStoreDashboard: (params?: DateRangeFilterParams) =>
    apiClient.get<DashboardReportData>('/store/reports/dashboard', params),

  getPurchaseAnalytics: (params?: DateRangeFilterParams & { vendorId?: string }) =>
    apiClient.get<PurchaseAnalyticsData>('/store/reports/purchases', params),

  getExpenseAnalytics: (params?: DateRangeFilterParams & { category?: string; paymentMethod?: string; search?: string }) =>
    apiClient.get<ExpenseAnalyticsData>('/store/reports/expenses', params),

  getInventoryAnalytics: (params?: { category?: string }) =>
    apiClient.get<InventoryAnalyticsData>('/store/reports/inventory', params),

  getStockMovementAnalytics: (params?: DateRangeFilterParams & { ingredientId?: string; movementType?: string }) =>
    apiClient.get<StockMovementAnalyticsData>('/store/reports/stock-movements', params),

  getKitchenConsumptionAnalytics: (params?: DateRangeFilterParams) =>
    apiClient.get<KitchenConsumptionAnalyticsData>('/store/reports/kitchen-consumption', params),

  getWasteAnalytics: (params?: DateRangeFilterParams) =>
    apiClient.get<WasteAnalyticsData>('/store/reports/waste', params),

  getVendorPayablesAnalytics: (params?: { vendorId?: string }) =>
    apiClient.get<VendorPayablesAnalyticsData>('/store/reports/vendors', params),
};

export default storeReportsService;
