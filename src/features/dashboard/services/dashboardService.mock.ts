import { db, simulateDelay } from '../../../shared/mock/mockDb';
import { calculateInventoryMetrics } from '../../../shared/utils/calculations';
import dayjs from 'dayjs';

export interface DashboardKpis {
  totalItems: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayPurchaseValue: number;
  todayPurchaseCount: number;
  todayIssueCount: number;
  todayWasteValue: number;
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  await simulateDelay(300);

  const products = db.products;
  const purchases = db.purchases;
  const issues = db.kitchenIssues;
  const waste = db.wasteEntries;

  const todayStr = dayjs().format('YYYY-MM-DD');

  // Compute inventory metrics
  const invMetrics = calculateInventoryMetrics(products);

  // Compute today's purchases
  const todayPurchases = purchases.filter(
    (p) => p.status === 'Submitted' && dayjs(p.orderDate).format('YYYY-MM-DD') === todayStr
  );
  const todayPurchaseValue = todayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  // Compute today's kitchen issues
  const todayIssues = issues.filter(
    (i) => dayjs(i.date).format('YYYY-MM-DD') === todayStr
  );
  const todayIssueCount = todayIssues.length;

  // Compute today's waste
  const todayWaste = waste.filter(
    (w) => dayjs(w.date).format('YYYY-MM-DD') === todayStr
  );
  const todayWasteValue = todayWaste.reduce((sum, w) => sum + w.valueLost, 0);

  return {
    totalItems: invMetrics.totalItems,
    inventoryValue: invMetrics.totalValue,
    lowStockCount: invMetrics.lowStockCount,
    outOfStockCount: invMetrics.outOfStockCount,
    todayPurchaseValue,
    todayPurchaseCount: todayPurchases.length,
    todayIssueCount,
    todayWasteValue,
  };
}

export async function getRecentActivities() {
  await simulateDelay(200);
  return db.activities.slice(0, 10);
}
