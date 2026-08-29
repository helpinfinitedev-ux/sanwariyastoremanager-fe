import { db, simulateDelay } from '../../../shared/mock/mockDb';
import { getStockStatus, calculateInventoryMetrics } from '../../../shared/utils/calculations';
import dayjs from 'dayjs';

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
  tableData: Array<{ id: string; date: string; invoiceNo: string; vendor: string; itemsCount: number; amount: number }>;
}

export interface InventoryReportData {
  kpis: ReportSummaryKpi[];
  chartData: ChartDataPoint[]; // value by category
  tableData: Array<{ id: string; sku: string; name: string; category: string; stock: number; rate: number; valuation: number }>;
}

export interface KitchenIssueReportData {
  kpis: ReportSummaryKpi[];
  chartData: ChartDataPoint[]; // dispatch by section
  tableData: Array<{ id: string; date: string; section: string; itemsCount: number; itemsList: string }>;
}

export interface WasteReportData {
  kpis: ReportSummaryKpi[];
  chartData: ChartDataPoint[]; // lost value by reason
  tableData: Array<{ id: string; date: string; product: string; qty: number; reason: string; lostValue: number }>;
}

// 1. Purchase report compiler
export async function getPurchaseReport(startDate: string, endDate: string): Promise<PurchaseReportData> {
  await simulateDelay(500);
  
  let purchases = [...db.purchases].filter(p => p.status === 'Submitted');

  if (startDate) {
    purchases = purchases.filter(p => dayjs(p.orderDate).isAfter(dayjs(startDate).subtract(1, 'day')));
  }
  if (endDate) {
    purchases = purchases.filter(p => dayjs(p.orderDate).isBefore(dayjs(endDate).add(1, 'day')));
  }

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const avgOrder = purchases.length ? (totalSpent / purchases.length) : 0;
  const uniqueVendors = new Set(purchases.map(p => p.vendorId)).size;

  const kpis: ReportSummaryKpi[] = [
    { label: 'Total Inflow Spent', value: `₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'cash-outline' },
    { label: 'Average Order Rate', value: `₹${avgOrder.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'calculator-outline' },
    { label: 'Purchases Count', value: purchases.length, icon: 'receipt-outline' },
    { label: 'Active Vendors Ordered', value: uniqueVendors, icon: 'people-outline' },
  ];

  // Group purchases by date for daily chart trends (last 7 days or matching ranges)
  const dailyGroups: Record<string, number> = {};
  purchases.forEach(p => {
    const day = dayjs(p.orderDate).format('MM/DD');
    dailyGroups[day] = (dailyGroups[day] || 0) + p.totalAmount;
  });

  const chartData = Object.entries(dailyGroups).map(([label, value]) => ({
    label,
    value: parseFloat(value.toFixed(2)),
  })).slice(-7); // last 7 points

  const tableData = purchases.map(p => ({
    id: p.id,
    date: p.orderDate,
    invoiceNo: p.invoiceNo,
    vendor: p.vendorName,
    itemsCount: p.items.length,
    amount: p.totalAmount,
  }));

  return { kpis, chartData, tableData };
}

// 2. Inventory report compiler
export async function getInventoryReport(): Promise<InventoryReportData> {
  await simulateDelay(400);

  const products = db.products;
  const metrics = calculateInventoryMetrics(products);

  const kpis: ReportSummaryKpi[] = [
    { label: 'Total SKU Range', value: metrics.totalItems, icon: 'cube-outline' },
    { label: 'Total Stock Valuation', value: `₹${metrics.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'trending-up-outline' },
    { label: 'Low Stock SKU Warning', value: metrics.lowStockCount, icon: 'warning-outline' },
    { label: 'Out of Stock SKU Alert', value: metrics.outOfStockCount, icon: 'alert-circle-outline' },
  ];

  // Group valuations by category for chart
  const catGroups: Record<string, number> = {};
  products.forEach(p => {
    const val = p.currentStock * p.avgCost;
    catGroups[p.category] = (catGroups[p.category] || 0) + val;
  });

  const chartData = Object.entries(catGroups).map(([label, value]) => ({
    label,
    value: parseFloat(value.toFixed(2)),
  }));

  const tableData = products.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    stock: p.currentStock,
    rate: p.avgCost,
    valuation: p.currentStock * p.avgCost,
  }));

  return { kpis, chartData, tableData };
}

// 3. Kitchen Dispatch report compiler
export async function getKitchenIssueReport(startDate: string, endDate: string): Promise<KitchenIssueReportData> {
  await simulateDelay(400);

  let issues = [...db.kitchenIssues];

  if (startDate) {
    issues = issues.filter(i => dayjs(i.date).isAfter(dayjs(startDate).subtract(1, 'day')));
  }
  if (endDate) {
    issues = issues.filter(i => dayjs(i.date).isBefore(dayjs(endDate).add(1, 'day')));
  }

  const totalDispatches = issues.length;
  const totalItemsDispatched = issues.reduce((sum, i) => sum + i.items.reduce((s, it) => s + it.quantity, 0), 0);
  const activeSections = new Set(issues.map(i => i.issuedToSection)).size;

  const kpis: ReportSummaryKpi[] = [
    { label: 'Dispatch Orders Logged', value: totalDispatches, icon: 'restaurant-outline' },
    { label: 'Total Quantities Dispatched', value: totalItemsDispatched, icon: 'file-tray-full-outline' },
    { label: 'Active Kitchen Sections', value: activeSections, icon: 'grid-outline' },
  ];

  // Group count of issues by kitchen section for chart
  const sectionGroups: Record<string, number> = {};
  issues.forEach(i => {
    sectionGroups[i.issuedToSection] = (sectionGroups[i.issuedToSection] || 0) + 1;
  });

  const chartData = Object.entries(sectionGroups).map(([label, value]) => ({
    label,
    value,
  }));

  const tableData = issues.map(i => ({
    id: i.id,
    date: i.date,
    section: i.issuedToSection,
    itemsCount: i.items.length,
    itemsList: i.items.map(it => `${it.productName} (${it.quantity})`).join(', '),
  }));

  return { kpis, chartData, tableData };
}

// 4. Waste report compiler
export async function getWasteReport(startDate: string, endDate: string): Promise<WasteReportData> {
  await simulateDelay(450);

  let waste = [...db.wasteEntries];

  if (startDate) {
    waste = waste.filter(w => dayjs(w.date).isAfter(dayjs(startDate).subtract(1, 'day')));
  }
  if (endDate) {
    waste = waste.filter(w => dayjs(w.date).isBefore(dayjs(endDate).add(1, 'day')));
  }

  const totalLoss = waste.reduce((sum, w) => sum + w.valueLost, 0);
  const totalRecords = waste.length;
  const avgLoss = totalRecords ? (totalLoss / totalRecords) : 0;

  const kpis: ReportSummaryKpi[] = [
    { label: 'Total Financial Loss', value: `₹${totalLoss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'alert-circle-outline' },
    { label: 'Waste Logs Logged', value: totalRecords, icon: 'trash-outline' },
    { label: 'Average Cost Per Loss', value: `₹${avgLoss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'calculator-outline' },
  ];

  // Group value lost by reason category for chart
  const reasonGroups: Record<string, number> = {};
  waste.forEach(w => {
    reasonGroups[w.reason] = (reasonGroups[w.reason] || 0) + w.valueLost;
  });

  const chartData = Object.entries(reasonGroups).map(([label, value]) => ({
    label,
    value: parseFloat(value.toFixed(2)),
  }));

  const tableData = waste.map(w => ({
    id: w.id,
    date: w.date,
    product: w.productName,
    qty: w.quantity,
    reason: w.reason,
    lostValue: w.valueLost,
  }));

  return { kpis, chartData, tableData };
}
