import apiClient from '../../../shared/services/apiClient';
import purchaseService from '../../purchase/services/purchaseService';
import { OtherExpense, OtherExpenseFormInputs, IngredientExpenseRecord } from '../types/expenses.types';

export interface BackendExpense {
  _id: string;
  id?: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  title?: string;
  description?: string;
  notes?: string;
  createdAt?: string;
}

function mapBackendExpense(e: BackendExpense): OtherExpense {
  return {
    id: e._id || e.id || '',
    category: e.category,
    amount: e.amount || 0,
    date: e.expenseDate || e.createdAt || new Date().toISOString(),
    paymentMethod: (e.paymentMethod as any) || 'Cash',
    remark: e.description || e.notes || e.title || '',
  };
}

export const expensesService = {
  getOtherExpenses: async (): Promise<OtherExpense[]> => {
    const res = await apiClient.get<any>('/store/expenses', { limit: 1000 });
    const list: BackendExpense[] = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.expenses)
      ? res.expenses
      : Array.isArray(res)
      ? res
      : [];
    return list.map(mapBackendExpense);
  },

  getIngredientExpenses: async (): Promise<IngredientExpenseRecord[]> => {
    const firstPage = await purchaseService.getPurchases({ page: 1, pageSize: 1000 });
    let purchases = firstPage.data || [];

    if (firstPage.totalPages > 1) {
      const remainingPagesPromises = [];
      for (let p = 2; p <= firstPage.totalPages; p++) {
        remainingPagesPromises.push(purchaseService.getPurchases({ page: p, pageSize: 1000 }));
      }
      const remainingResults = await Promise.all(remainingPagesPromises);
      remainingResults.forEach((res) => {
        if (res.data) {
          purchases = purchases.concat(res.data);
        }
      });
    }

    const records: IngredientExpenseRecord[] = [];

    purchases.forEach((p) => {
      const items = p.items || [];
      const pTotal = p.totalAmount || 0;
      const pPaid = p.paidAmount || 0;

      items.forEach((it, idx) => {
        const itemSubtotal = it.subtotal || (it.quantity || 0) * (it.unitCost || 0);
        const itemPaid = pTotal > 0 ? (itemSubtotal / pTotal) * pPaid : 0;
        const itemDue = Math.max(0, itemSubtotal - itemPaid);

        records.push({
          id: `${p.id}_${idx}`,
          purchaseId: p.id,
          invoiceNo: p.invoiceNo || 'Invoice',
          vendorId: p.vendorId,
          vendorName: p.vendorName || 'Vendor',
          orderDate: p.orderDate || new Date().toISOString(),
          ingredientName: it.productName || 'Ingredient',
          quantity: it.quantity || 0,
          unit: 'unit',
          unitCost: it.unitCost || 0,
          totalAmount: itemSubtotal,
          paidAmount: Math.round(itemPaid * 100) / 100,
          dueAmount: Math.round(itemDue * 100) / 100,
          paymentStatus: p.paymentStatus || 'PAID',
        });
      });
    });

    return records;
  },

  createOtherExpense: async (data: OtherExpenseFormInputs): Promise<OtherExpense> => {
    const payload = {
      category: data.category,
      amount: Number(data.amount),
      expenseDate: data.date,
      paymentMethod: data.paymentMethod || 'Cash',
      description: data.remark || undefined,
    };
    const res = await apiClient.post<{ expense: BackendExpense }>('/store/expenses', payload);
    const exp = res.expense || (res as any);
    return mapBackendExpense(exp);
  },

  updateOtherExpense: async (id: string, data: Partial<OtherExpenseFormInputs>): Promise<OtherExpense> => {
    const payload: Record<string, any> = {};
    if (data.category) payload.category = data.category;
    if (data.amount !== undefined) payload.amount = Number(data.amount);
    if (data.date) payload.expenseDate = data.date;
    if (data.paymentMethod) payload.paymentMethod = data.paymentMethod;
    if (data.remark !== undefined) payload.description = data.remark;

    const res = await apiClient.patch<{ expense: BackendExpense }>(`/store/expenses/${id}`, payload);
    const exp = res.expense || (res as any);
    return mapBackendExpense(exp);
  },

  deleteOtherExpense: async (id: string): Promise<any> => {
    return apiClient.delete(`/store/expenses/${id}`);
  },
};

export default expensesService;
