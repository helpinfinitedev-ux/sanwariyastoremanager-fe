import { Product } from '../mock/mockDb';

/**
 * Returns the stock status based on current stock levels and thresholds
 */
export function getStockStatus(product: Product): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (product.currentStock <= 0) {
    return 'Out of Stock';
  }
  if (product.currentStock <= product.minStock) {
    return 'Low Stock';
  }
  return 'In Stock';
}

/**
 * Calculates total item count, items value, and warnings
 */
export function calculateInventoryMetrics(products: Product[]) {
  let totalItems = products.length;
  let totalValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach(p => {
    totalValue += p.currentStock * p.avgCost;
    if (p.currentStock <= 0) {
      outOfStockCount++;
    } else if (p.currentStock <= p.minStock) {
      lowStockCount++;
    }
  });

  return {
    totalItems,
    totalValue,
    lowStockCount,
    outOfStockCount,
  };
}
