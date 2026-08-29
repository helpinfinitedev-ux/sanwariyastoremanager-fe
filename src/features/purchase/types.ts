import { Purchase, PurchaseItem } from '../../shared/mock/mockDb';

export interface PurchaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  vendorId?: string;
  status?: 'Draft' | 'Submitted' | '';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePurchaseDto {
  invoiceNo: string;
  vendorId: string;
  orderDate: string;
  deliveryDate: string;
  status: 'Draft' | 'Submitted';
  notes?: string;
  photoUrl?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
}

export type UpdatePurchaseDto = Partial<CreatePurchaseDto>;
