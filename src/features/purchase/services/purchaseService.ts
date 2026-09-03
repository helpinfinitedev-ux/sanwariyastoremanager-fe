import apiClient from '../../../shared/services/apiClient';
import { Purchase, PurchaseItem, Vendor } from '../../../shared/mock/mockDb';
import { PurchaseQueryParams, CreatePurchaseDto, UpdatePurchaseDto } from '../types';
import { PaginatedResponse } from '../../../shared/types/common';

export interface BackendPurchaseItem {
  ingredient: {
    _id: string;
    id?: string;
    name: string;
    sku?: string;
    unit?: string;
  };
  quantity: number;
  unit?: string;
  unitCost: number;
  totalCost?: number;
}

export interface BackendPurchase {
  _id: string;
  id?: string;
  purchaseNumber: string;
  vendor: {
    _id: string;
    id?: string;
    name: string;
    phone?: string;
  };
  invoiceNumber: string;
  invoiceDate: string;
  items: BackendPurchaseItem[];
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus?: string;
  status: 'Draft' | 'Submitted' | 'Cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

function mapBackendPurchase(p: BackendPurchase): Purchase {
  const items: PurchaseItem[] = (p.items || []).map((item) => ({
    productId: item.ingredient?._id || item.ingredient?.id || String(item.ingredient),
    productName: item.ingredient?.name || 'Item',
    quantity: item.quantity,
    unitCost: item.unitCost,
    subtotal: item.totalCost || item.quantity * item.unitCost,
  }));

  const totalAmount = p.totalAmount || 0;
  const paidAmount = p.paidAmount || 0;
  const dueAmount = p.dueAmount !== undefined ? p.dueAmount : Math.max(0, totalAmount - paidAmount);

  return {
    id: p._id || p.id || '',
    invoiceNo: p.invoiceNumber || p.purchaseNumber,
    vendorId: p.vendor?._id || p.vendor?.id || String(p.vendor),
    vendorName: p.vendor?.name || 'Vendor',
    orderDate: p.invoiceDate || p.createdAt || new Date().toISOString(),
    deliveryDate: p.invoiceDate || '',
    items,
    totalAmount,
    paidAmount,
    dueAmount,
    paymentStatus: p.paymentStatus === 'PAID' ? 'PAID' : p.paymentStatus === 'PARTIAL' ? 'PARTIAL' : 'CREDIT',
    paymentMethod: 'Cash',
    status: p.status === 'Cancelled' ? 'Draft' : (p.status as any),
    notes: p.notes || '',
    photoUrl: '',
  };
}

export const purchaseService = {
  getPurchases: async (params: PurchaseQueryParams = {}): Promise<PaginatedResponse<Purchase>> => {
    const query: Record<string, any> = {
      page: params.page || 1,
      limit: params.pageSize || 10,
    };
    if (params.search) query.search = params.search;
    if (params.vendorId) query.vendor = params.vendorId;
    if (params.status) query.status = params.status;
    if (params.startDate) query.startDate = params.startDate;
    if (params.endDate) query.endDate = params.endDate;

    const res = await apiClient.get<{
      purchases: BackendPurchase[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/store/purchases', query);

    const items = (res.purchases || []).map(mapBackendPurchase);
    const total = res.pagination?.total ?? items.length;
    const pageSize = res.pagination?.limit || 10;
    const page = res.pagination?.page || 1;
    const totalPages = res.pagination?.pages || Math.ceil(total / pageSize) || 1;

    return {
      data: items,
      totalCount: total,
      page,
      pageSize,
      totalPages,
    };
  },

  getPurchaseById: async (id: string): Promise<Purchase> => {
    const res = await apiClient.get<{ purchase: BackendPurchase }>(`/store/purchases/${id}`);
    const p = res.purchase || (res as any);
    return mapBackendPurchase(p);
  },

  createPurchase: async (dto: CreatePurchaseDto): Promise<Purchase> => {
    const payload = {
      vendor: dto.vendorId,
      invoiceNumber: dto.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: dto.orderDate,
      status: dto.status,
      items: dto.items.map((it) => ({
        ingredient: it.productId,
        quantity: it.quantity,
        unitCost: it.unitCost,
      })),
      notes: dto.notes || undefined,
    };

    const res = await apiClient.post<{ purchase: BackendPurchase }>('/store/purchases', payload);
    const p = res.purchase || (res as any);
    return mapBackendPurchase(p);
  },

  updatePurchase: async (id: string, dto: UpdatePurchaseDto): Promise<Purchase> => {
    const payload: Record<string, any> = {};
    if (dto.vendorId) payload.vendor = dto.vendorId;
    if (dto.invoiceNo) payload.invoiceNumber = dto.invoiceNo;
    if (dto.orderDate) payload.invoiceDate = dto.orderDate;
    if (dto.status) payload.status = dto.status;
    if (dto.notes !== undefined) payload.notes = dto.notes;
    if (dto.items) {
      payload.items = dto.items.map((it) => ({
        ingredient: it.productId,
        quantity: it.quantity,
        unitCost: it.unitCost,
      }));
    }

    const res = await apiClient.patch<{ purchase: BackendPurchase }>(`/store/purchases/${id}`, payload);
    const p = res.purchase || (res as any);
    return mapBackendPurchase(p);
  },

  submitPurchase: async (id: string): Promise<Purchase> => {
    const res = await apiClient.post<{ purchase: BackendPurchase }>(`/store/purchases/${id}/submit`);
    const p = res.purchase || (res as any);
    return mapBackendPurchase(p);
  },

  cancelPurchase: async (id: string): Promise<Purchase> => {
    const res = await apiClient.post<{ purchase: BackendPurchase }>(`/store/purchases/${id}/cancel`);
    const p = res.purchase || (res as any);
    return mapBackendPurchase(p);
  },

  getVendorsList: async (): Promise<Vendor[]> => {
    const res = await apiClient.get<{ vendors: any[] }>('/store/vendors');
    const vendors = res.vendors || (res as any) || [];
    return vendors.map((v) => ({
      id: v._id || v.id,
      name: v.name,
      firmName: v.name,
      code: (v.name || '').substring(0, 3).toUpperCase(),
      contactPerson: v.contactPerson || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || '',
      status: v.isActive !== false ? 'Active' : 'Inactive',
      paymentTerms: v.paymentTerms || 'Cash on Delivery',
      openingBalance: v.openingBalance || 0,
      totalPurchase: v.totalPurchases || 0,
      totalPaid: v.totalPaid || 0,
      outstanding: v.outstanding || 0,
    }));
  },

  getVendorOutstanding: async (vendorId: string): Promise<number> => {
    if (!vendorId) return 0;
    const vendors = await purchaseService.getVendorsList();
    const found = vendors.find((v) => v.id === vendorId);
    return (found as any)?.outstanding || 0;
  },

  createSupplier: async (data: any): Promise<Vendor> => {
    const payload = {
      name: data.name || data.firmName,
      contactPerson: data.contactPerson || data.name,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address || undefined,
    };
    const res = await apiClient.post<{ vendor: any }>('/store/vendors', payload);
    const v = res.vendor || (res as any);
    return {
      id: v._id || v.id,
      name: v.name,
      firmName: v.name,
      code: (v.name || '').substring(0, 3).toUpperCase(),
      contactPerson: v.contactPerson || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || '',
      status: 'Active',
      paymentTerms: 'Cash on Delivery',
      openingBalance: 0,
    };
  },
};

export default purchaseService;
