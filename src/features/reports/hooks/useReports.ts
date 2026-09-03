import { useQuery } from '@tanstack/react-query';
import storeReportsService from '../services/storeReportsService';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

export interface ReportSummaryKpi {
  label: string;
  value: string | number;
  icon: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface PurchaseReportData {
  kpis: ReportSummaryKpi[];
  chartData: ChartDataPoint[];
  tableData: Array<{
    id: string;
    date: string;
    invoiceNo: string;
    vendor: string;
    itemsCount: number;
    amount: number;
    paidAmount?: number;
    dueAmount?: number;
  }>;
  byVendor: Array<{ vendorId: string; vendorName: string; amount: number; count: number }>;
}

export interface InventoryReportData {
  kpis: ReportSummaryKpi[];
  chartData: ChartDataPoint[];
  tableData: Array<{
    id: string;
    sku: string;
    name: string;
    category: string;
    stock: number;
    rate: number;
    valuation: number;
    stockStatus?: string;
  }>;
}

export interface KitchenIssueReportData {
  kpis: ReportSummaryKpi[];
  chartData: ChartDataPoint[];
  tableData: Array<{
    id: string;
    date: string;
    section: string;
    itemsCount: number;
    itemsList: string;
  }>;
  byIngredient: Array<{ ingredientId: string; ingredientName: string; quantity: number; unit: string; valuation: number }>;
}

export interface WasteReportData {
  kpis: ReportSummaryKpi[];
  chartData: ChartDataPoint[];
  tableData: Array<{
    id: string;
    date: string;
    reason: string;
    notes?: string;
    itemsCount: number;
    itemsList: string;
  }>;
  byIngredient: Array<{ ingredientId: string; ingredientName: string; quantity: number; unit: string; financialLoss: number }>;
}

export function usePurchaseReport(startDate: string, endDate: string) {
  return useQuery<PurchaseReportData>({
    queryKey: ['purchaseReport', startDate, endDate],
    queryFn: async () => {
      const res = await storeReportsService.getPurchaseAnalytics({ startDate, endDate });

      const kpis: ReportSummaryKpi[] = [
        { label: 'Total Inflow Spent', value: formatCurrency(res.summary?.totalSpent || 0), icon: 'cash-outline' },
        { label: 'Average Order Rate', value: formatCurrency(res.summary?.avgOrderRate || 0), icon: 'calculator-outline' },
        { label: 'Purchases Count', value: res.summary?.purchaseCount || 0, icon: 'receipt-outline' },
        { label: 'Active Vendors Ordered', value: res.summary?.activeVendorsCount || 0, icon: 'people-outline' },
      ];

      const chartData: ChartDataPoint[] = (res.trend || []).map((t) => ({
        label: t.date ? t.date.slice(5) : '',
        value: t.amount || 0,
      }));

      const tableData = (res.tableData || []).map((p) => ({
        id: p.id,
        date: p.date,
        invoiceNo: p.invoiceNumber,
        vendor: p.vendor,
        itemsCount: p.itemsCount,
        amount: p.totalAmount,
        paidAmount: p.paidAmount,
        dueAmount: p.dueAmount,
      }));

      return {
        kpis,
        chartData,
        tableData,
        byVendor: res.byVendor || [],
      };
    },
  });
}

export function useInventoryReport() {
  return useQuery<InventoryReportData>({
    queryKey: ['inventoryReport'],
    queryFn: async () => {
      const res = await storeReportsService.getInventoryAnalytics();

      const kpis: ReportSummaryKpi[] = [
        { label: 'Total SKU Range', value: res.summary?.totalItems || 0, icon: 'cube-outline' },
        { label: 'Total Stock Valuation', value: formatCurrency(res.summary?.totalValuation || 0), icon: 'trending-up-outline' },
        { label: 'Low Stock SKU Warning', value: res.summary?.lowStockCount || 0, icon: 'warning-outline' },
        { label: 'Out of Stock SKU Alert', value: res.summary?.outOfStockCount || 0, icon: 'alert-circle-outline' },
      ];

      const chartData: ChartDataPoint[] = (res.byCategory || []).map((c) => ({
        label: c.category,
        value: c.valuation,
      }));

      const tableData = (res.tableData || []).map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        stock: p.stock,
        rate: p.rate,
        valuation: p.valuation,
        stockStatus: p.stockStatus,
      }));

      return { kpis, chartData, tableData };
    },
  });
}

export function useKitchenIssueReport(startDate: string, endDate: string) {
  return useQuery<KitchenIssueReportData>({
    queryKey: ['kitchenIssueReport', startDate, endDate],
    queryFn: async () => {
      const res = await storeReportsService.getKitchenConsumptionAnalytics({ startDate, endDate });

      const kpis: ReportSummaryKpi[] = [
        { label: 'Dispatch Orders Logged', value: res.summary?.totalDispatches || 0, icon: 'restaurant-outline' },
        { label: 'Total Quantities Dispatched', value: res.summary?.totalQuantity || 0, icon: 'file-tray-full-outline' },
        { label: 'Total Issue Valuation', value: formatCurrency(res.summary?.totalValue || 0), icon: 'cash-outline' },
        { label: 'Active Kitchen Sections', value: res.summary?.activeSectionsCount || 0, icon: 'grid-outline' },
      ];

      const chartData: ChartDataPoint[] = (res.bySection || []).map((s) => ({
        label: s.section,
        value: s.count,
      }));

      const tableData = (res.tableData || []).map((i) => ({
        id: i.id,
        date: i.date,
        section: i.destination,
        itemsCount: i.itemsCount,
        itemsList: i.itemsList,
      }));

      return {
        kpis,
        chartData,
        tableData,
        byIngredient: res.byIngredient || [],
      };
    },
  });
}

export function useWasteReport(startDate: string, endDate: string) {
  return useQuery<WasteReportData>({
    queryKey: ['wasteReport', startDate, endDate],
    queryFn: async () => {
      const res = await storeReportsService.getWasteAnalytics({ startDate, endDate });

      const kpis: ReportSummaryKpi[] = [
        { label: 'Total Financial Loss', value: formatCurrency(res.summary?.totalFinancialLoss || 0), icon: 'alert-circle-outline' },
        { label: 'Waste Logs Logged', value: res.summary?.wasteRecordCount || 0, icon: 'trash-outline' },
        { label: 'Average Cost Per Loss', value: formatCurrency(res.summary?.averageCostPerLoss || 0), icon: 'calculator-outline' },
        { label: 'Total Quantity Lost', value: res.summary?.totalQuantityLost || 0, icon: 'scale-outline' },
      ];

      const chartData: ChartDataPoint[] = (res.byReason || []).map((r) => ({
        label: r.reason,
        value: r.count,
      }));

      const tableData = (res.tableData || []).map((w) => ({
        id: w.id,
        date: w.date,
        reason: w.reason,
        notes: w.notes,
        itemsCount: w.itemsCount,
        itemsList: w.itemsList,
      }));

      return {
        kpis,
        chartData,
        tableData,
        byIngredient: res.byIngredient || [],
      };
    },
  });
}
