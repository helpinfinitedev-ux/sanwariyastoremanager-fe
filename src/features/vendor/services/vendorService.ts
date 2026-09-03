import apiClient from '../../../shared/services/apiClient';
import { Vendor, VendorSummary, VendorLedgerEntry, VendorFormInputs, MakePaymentPayload } from '../types/vendor.types';

export interface BackendVendor {
  _id: string;
  id?: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  paymentTerms?: string;
  openingBalance?: number;
  isActive?: boolean;
  totalPurchases?: number;
  totalPaid?: number;
  outstanding?: number;
}

function mapBackendVendor(v: BackendVendor): Vendor {
  return {
    id: v._id || v.id || '',
    firmName: v.name,
    name: v.name,
    code: (v.name || '').substring(0, 3).toUpperCase(),
    contactPerson: v.contactPerson || '',
    phone: v.phone || '',
    email: v.email || '',
    address: v.address || '',
    gstin: v.gstNumber || '',
    paymentTerms: (v.paymentTerms as any) || 'Cash on Delivery',
    openingBalance: v.openingBalance || 0,
    status: v.isActive !== false ? 'Active' : 'Inactive',
    totalPurchase: v.totalPurchases || 0,
    totalPaid: v.totalPaid || 0,
    outstanding: v.outstanding || 0,
  };
}

export const vendorService = {
  getVendors: async (): Promise<Vendor[]> => {
    const res = await apiClient.get<{ vendors: BackendVendor[] }>('/store/vendors');
    const vendors = res.vendors || (res as any) || [];
    return vendors.map(mapBackendVendor);
  },

  getVendorById: async (id: string): Promise<Vendor> => {
    const res = await apiClient.get<{ vendor: BackendVendor; summary?: VendorSummary }>(`/store/vendors/${id}`);
    const v = res.vendor || (res as any);
    const mapped = mapBackendVendor(v);
    if (res.summary) {
      mapped.totalPurchase = res.summary.totalPurchase;
      mapped.totalPaid = res.summary.totalPaid;
      mapped.outstanding = res.summary.outstanding;
    }
    return mapped;
  },

  getVendorLedger: async (id: string): Promise<VendorLedgerEntry[]> => {
    const [vendorRes, paymentsRes, purchasesRes] = await Promise.all([
      vendorService.getVendorById(id),
      apiClient.get<{ payments: any[] }>(`/store/vendors/${id}/payments`).catch(() => ({ payments: [] })),
      apiClient.get<{ purchases: any[] }>(`/store/vendors/${id}/purchases`).catch(() => ({ purchases: [] })),
    ]);

    const payments = paymentsRes.payments || [];
    const purchases = purchasesRes.purchases || [];

    const ledger: VendorLedgerEntry[] = [];
    let runningBalance = vendorRes.openingBalance || 0;

    purchases.forEach((p) => {
      ledger.push({
        id: p._id || p.id,
        date: p.invoiceDate || p.createdAt || new Date().toISOString(),
        type: 'Purchase',
        reference: p.invoiceNumber || p.purchaseNumber || 'Invoice',
        purchaseAmount: p.totalAmount || 0,
        paymentAmount: 0,
        balance: 0,
        notes: `Purchase Invoice: ${p.status || ''}`,
      });
    });

    payments.forEach((py) => {
      ledger.push({
        id: py._id || py.id,
        date: py.paymentDate || py.createdAt || new Date().toISOString(),
        type: 'Payment',
        reference: py.paymentMethod || 'Voucher',
        purchaseAmount: 0,
        paymentAmount: py.amount || 0,
        balance: 0,
        notes: py.notes || 'Payment settlement',
      });
    });

    ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    ledger.forEach((entry) => {
      if (entry.type === 'Purchase') runningBalance += entry.purchaseAmount;
      if (entry.type === 'Payment') runningBalance -= entry.paymentAmount;
      entry.balance = runningBalance;
    });

    return ledger;
  },

  createVendor: async (data: VendorFormInputs): Promise<Vendor> => {
    const payload = {
      name: data.firmName || data.name,
      contactPerson: data.name,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address || undefined,
      gstNumber: data.gstin || undefined,
      paymentTerms: data.paymentTerms || 'Cash on Delivery',
      openingBalance: Number(data.openingBalance) || 0,
    };
    const res = await apiClient.post<{ vendor: BackendVendor }>('/store/vendors', payload);
    const v = res.vendor || (res as any);
    return mapBackendVendor(v);
  },

  updateVendor: async (id: string, data: Partial<VendorFormInputs>): Promise<Vendor> => {
    const payload: Record<string, any> = {};
    if (data.firmName) payload.name = data.firmName;
    if (data.name) payload.contactPerson = data.name;
    if (data.phone) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.address !== undefined) payload.address = data.address;
    if (data.gstin !== undefined) payload.gstNumber = data.gstin;
    if (data.paymentTerms) payload.paymentTerms = data.paymentTerms;

    const res = await apiClient.patch<{ vendor: BackendVendor }>(`/store/vendors/${id}`, payload);
    const v = res.vendor || (res as any);
    return mapBackendVendor(v);
  },

  makePayment: async (payload: MakePaymentPayload): Promise<any> => {
    const body = {
      amount: Number(payload.amount),
      paymentMethod: payload.paymentMethod || 'Bank Transfer',
      notes: payload.notes || undefined,
      purchaseId: payload.purchaseId || undefined,
    };
    return apiClient.post(`/store/vendors/${payload.vendorId}/payments`, body);
  },
};

export default vendorService;
