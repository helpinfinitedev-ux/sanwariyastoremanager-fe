import { useQuery } from '@tanstack/react-query';
import storeReportsService from '../../reports/services/storeReportsService';
import { getRecentActivities } from '../services/dashboardService.mock';
import { DateRangeFilterParams } from '../../reports/types/reports.types';

export function useDashboardKpis(params?: DateRangeFilterParams) {
  return useQuery({
    queryKey: ['dashboardKpis', params],
    queryFn: async () => {
      const data = await storeReportsService.getStoreDashboard(params);
      return {
        ...data,
        totalItems: data.inventory?.totalItems || 0,
        inventoryValue: data.inventory?.inventoryValue || 0,
        lowStockCount: data.inventory?.lowStockCount || 0,
        outOfStockCount: data.inventory?.outOfStockCount || 0,
        todayPurchaseValue: data.purchases?.totalAmount || 0,
        todayPurchaseCount: data.purchases?.count || 0,
        todayIssueCount: data.kitchenIssues?.count || 0,
        todayWasteValue: data.waste?.totalValue || 0,
        totalExpenses: data.expenses?.totalAmount || 0,
        vendorOutstanding: data.payables?.outstanding || 0,
      };
    },
    refetchInterval: 15000,
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['recentActivities'],
    queryFn: getRecentActivities,
  });
}
