export type ExpenseCategory = string;

export interface OtherExpense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Card' | 'Cheque' | 'Other';
  remark: string;
}

export interface OtherExpenseFormInputs {
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Card' | 'Cheque' | 'Other';
  remark: string;
}

export interface IngredientExpenseRecord {
  id: string; // purchaseId + item Index
  purchaseId: string;
  invoiceNo: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT';
}

export interface ExpenseFiltersState {
  fromDate?: string;
  toDate?: string;
  ingredientName?: string;
  vendorId?: string;
  paymentStatus?: string;
  category?: string;
  paymentMethod?: string;
  search?: string;
}
