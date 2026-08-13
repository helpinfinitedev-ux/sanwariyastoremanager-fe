import { WasteEntry } from '../../shared/mock/mockDb';

export interface WasteQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  reason?: 'Expired' | 'Spoiled' | 'Damaged' | 'Overproduction' | 'Other' | '';
  startDate?: string;
  endDate?: string;
}

export interface CreateWasteDto {
  productId: string;
  quantity: number;
  reason: 'Expired' | 'Spoiled' | 'Damaged' | 'Overproduction' | 'Other';
  notes?: string;
  photoUrl?: string;
}
