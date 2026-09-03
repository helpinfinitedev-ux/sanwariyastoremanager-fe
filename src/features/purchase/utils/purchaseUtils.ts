import { Purchase } from '../../../shared/mock/mockDb';

/**
 * Calculates the total outstanding balance for a specific vendor from a list of purchases.
 * 
 * @param vendorId The vendor ID to calculate outstanding for
 * @param purchases List of all purchases
 * @param excludePurchaseId Optional purchase ID to exclude (e.g. when editing current purchase)
 * @returns Total remaining due across all previous purchases for the vendor
 */
export function calculateVendorOutstanding(
  vendorId: string,
  purchases: Purchase[] = [],
  excludePurchaseId?: string
): number {
  if (!vendorId) return 0;

  return purchases.reduce((totalDue, purchase) => {
    // Only calculate for the specified vendor
    if (purchase.vendorId !== vendorId) return totalDue;

    // Exclude current purchase if editing
    if (excludePurchaseId && purchase.id === excludePurchaseId) return totalDue;

    // Calculate due for this purchase: totalAmount - paidAmount
    const total = Number(purchase.totalAmount) || 0;
    const paid = Number(purchase.paidAmount) || 0;
    const due = Math.max(0, total - paid);

    return totalDue + due;
  }, 0);
}
