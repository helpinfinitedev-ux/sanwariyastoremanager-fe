import { db, simulateDelay } from '../../../shared/mock/mockDb';
import { OtherExpense, OtherExpenseFormInputs, IngredientExpenseRecord } from '../types/expenses.types';

export const expensesMockService = {
  getOtherExpenses: async (): Promise<OtherExpense[]> => {
    await simulateDelay(200);
    return db.getOtherExpenses();
  },

  createOtherExpense: async (data: OtherExpenseFormInputs): Promise<OtherExpense> => {
    await simulateDelay(300);
    return db.createOtherExpense(data);
  },

  updateOtherExpense: async (id: string, data: Partial<OtherExpenseFormInputs>): Promise<OtherExpense> => {
    await simulateDelay(300);
    return db.updateOtherExpense(id, data);
  },

  deleteOtherExpense: async (id: string): Promise<boolean> => {
    await simulateDelay(250);
    return db.deleteOtherExpense(id);
  },

  getIngredientExpenses: async (): Promise<IngredientExpenseRecord[]> => {
    await simulateDelay(200);
    const records: IngredientExpenseRecord[] = [];

    db.purchases
      .filter(p => p.status === 'Submitted')
      .forEach(p => {
        p.items.forEach((item, idx) => {
          // Proportionate paid/due breakdown per line item for clean presentation
          const itemRatio = p.totalAmount > 0 ? item.subtotal / p.totalAmount : 0;
          const itemPaid = parseFloat((p.paidAmount * itemRatio).toFixed(2));
          const itemDue = Math.max(0, parseFloat((item.subtotal - itemPaid).toFixed(2)));

          // Infer unit from product name or default Kg
          const prod = db.products.find(pr => pr.id === item.productId);
          const unit = prod ? prod.unit : 'Units';

          records.push({
            id: `${p.id}-${idx}`,
            purchaseId: p.id,
            invoiceNo: p.invoiceNo,
            vendorId: p.vendorId,
            vendorName: p.vendorName,
            orderDate: p.orderDate,
            ingredientName: item.productName,
            quantity: item.quantity,
            unit,
            unitCost: item.unitCost,
            totalAmount: item.subtotal,
            paidAmount: itemPaid,
            dueAmount: itemDue,
            paymentStatus: p.paymentStatus,
          });
        });
      });

    return records.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  },
};
