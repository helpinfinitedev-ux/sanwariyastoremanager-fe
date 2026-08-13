import { useQuery } from '@tanstack/react-query';
import { getPurchaseReport, getInventoryReport, getKitchenIssueReport, getWasteReport } from '../services/reportsService.mock';

export function usePurchaseReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['purchaseReport', startDate, endDate],
    queryFn: () => getPurchaseReport(startDate, endDate),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['inventoryReport'],
    queryFn: () => getInventoryReport(),
  });
}

export function useKitchenIssueReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['kitchenIssueReport', startDate, endDate],
    queryFn: () => getKitchenIssueReport(startDate, endDate),
  });
}

export function useWasteReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['wasteReport', startDate, endDate],
    queryFn: () => getWasteReport(startDate, endDate),
  });
}
