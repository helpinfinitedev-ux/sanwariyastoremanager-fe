import { WasteEntry } from '../../shared/mock/mockDb';

export interface WasteQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateWasteDto {
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
  photoUrl?: string;
}
