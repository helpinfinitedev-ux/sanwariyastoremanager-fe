export interface Vendor {
  id: string;
  firmName: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  paymentTerms: 'Cash on Delivery' | '7 Days' | '15 Days' | '30 Days' | 'Custom';
  openingBalance: number;
  status: 'Active' | 'Inactive';
  totalPurchase?: number;
  totalPaid?: number;
  outstanding?: number;
}

export interface VendorSummary {
  totalPurchase: number;
  totalPaid: number;
  outstanding: number;
}

export interface VendorLedgerEntry {
  id: string;
  date: string;
  type: 'Purchase' | 'Payment';
  reference: string;
  purchaseAmount: number;
  paymentAmount: number;
  balance: number;
  notes?: string;
}

export interface MakePaymentPayload {
  vendorId: string;
  purchaseId?: string;
  invoiceNo?: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other' | string;
  reference?: string;
  notes?: string;
  date?: string;
}

export interface VendorFormInputs {
  firmName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  paymentTerms: 'Cash on Delivery' | '7 Days' | '15 Days' | '30 Days' | 'Custom';
  openingBalance: number;
}
