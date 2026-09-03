import { useQuery } from '@tanstack/react-query';
import storeReportsService from '../services/storeReportsService';
import { DateRangeFilterParams } from '../types/reports.types';

export function useStoreDashboardQuery(params?: DateRangeFilterParams) {
  return useQuery({
    queryKey: ['storeDashboard', params],
    queryFn: () => storeReportsService.getStoreDashboard(params),
    refetchInterval: 15000, // keep dashboard metrics fresh
  });
}

export function usePurchaseAnalyticsQuery(params?: DateRangeFilterParams & { vendorId?: string }) {
  return useQuery({
    queryKey: ['purchaseAnalytics', params],
    queryFn: () => storeReportsService.getPurchaseAnalytics(params),
  });
}

export function useExpenseAnalyticsQuery(
  params?: DateRangeFilterParams & { category?: string; paymentMethod?: string; search?: string }
) {
  return useQuery({
    queryKey: ['expenseAnalytics', params],
    queryFn: () => storeReportsService.getExpenseAnalytics(params),
  });
}

export function useInventoryAnalyticsQuery(params?: { category?: string }) {
  return useQuery({
    queryKey: ['inventoryAnalytics', params],
    queryFn: () => storeReportsService.getInventoryAnalytics(params),
  });
}

export function useStockMovementAnalyticsQuery(
  params?: DateRangeFilterParams & { ingredientId?: string; movementType?: string }
) {
  return useQuery({
    queryKey: ['stockMovementAnalytics', params],
    queryFn: () => storeReportsService.getStockMovementAnalytics(params),
  });
}

export function useKitchenConsumptionAnalyticsQuery(params?: DateRangeFilterParams) {
  return useQuery({
    queryKey: ['kitchenConsumptionAnalytics', params],
    queryFn: () => storeReportsService.getKitchenConsumptionAnalytics(params),
  });
}

export function useWasteAnalyticsQuery(params?: DateRangeFilterParams) {
  return useQuery({
    queryKey: ['wasteAnalytics', params],
    queryFn: () => storeReportsService.getWasteAnalytics(params),
  });
}

export function useVendorPayablesAnalyticsQuery(params?: { vendorId?: string }) {
  return useQuery({
    queryKey: ['vendorPayablesAnalytics', params],
    queryFn: () => storeReportsService.getVendorPayablesAnalytics(params),
  });
}
