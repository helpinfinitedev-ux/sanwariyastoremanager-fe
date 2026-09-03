import apiClient from '../../../shared/services/apiClient';
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
    const res = await apiClient.get<{ expenses: BackendExpense[] }>('/store/expenses', { limit: 1000 });
    const list = res.expenses || (res as any) || [];
    return list.map(mapBackendExpense);
  },

  getIngredientExpenses: async (): Promise<IngredientExpenseRecord[]> => {
    const res = await apiClient.get<{ purchases: any[] }>('/store/purchases', {
      status: 'Submitted',
      limit: 1000,
    });
    const purchases = res.purchases || [];
    const records: IngredientExpenseRecord[] = [];

    purchases.forEach((p) => {
      const items = p.items || [];
      items.forEach((it: any, idx: number) => {
        records.push({
          id: `${p._id || p.id}_${idx}`,
          purchaseId: p._id || p.id,
          invoiceNo: p.invoiceNumber || p.purchaseNumber || 'Invoice',
          vendorId: p.vendor?._id || p.vendor?.id || String(p.vendor),
          vendorName: p.vendor?.name || 'Vendor',
          orderDate: p.invoiceDate || p.createdAt || new Date().toISOString(),
          ingredientName: it.ingredient?.name || 'Ingredient',
          quantity: it.quantity || 0,
          unit: it.unit || it.ingredient?.unit || 'unit',
          unitCost: it.unitCost || 0,
          totalAmount: it.totalCost || (it.quantity || 0) * (it.unitCost || 0),
          paidAmount: p.paidAmount || 0,
          dueAmount: p.dueAmount || 0,
          paymentStatus: (p.paymentStatus as any) || 'PAID',
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
