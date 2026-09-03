import apiClient from '../../../shared/services/apiClient';
import { WasteEntry, WasteReason } from '../../../shared/mock/mockDb';
import { WasteQueryParams, CreateWasteDto } from '../types';
import { PaginatedResponse } from '../../../shared/types/common';

export interface BackendWasteItem {
  ingredient: {
    _id: string;
    id?: string;
    name: string;
    sku?: string;
    unit?: string;
  };
  quantity: number;
  unit?: string;
  unitCost?: number;
  lineCost?: number;
}

export interface BackendWaste {
  _id: string;
  id?: string;
  wasteNumber: string;
  reason: string;
  wasteDate: string;
  notes?: string;
  items: BackendWasteItem[];
  createdBy?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
}

function mapBackendWaste(w: BackendWaste): WasteEntry {
  const firstItem = w.items?.[0];
  const totalQty = (w.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0);
  const totalLoss = (w.items || []).reduce(
    (acc, it) => acc + (it.lineCost || (it.quantity || 0) * (it.unitCost || 0)),
    0
  );

  return {
    id: w._id || w.id || '',
    date: w.wasteDate || w.createdAt || new Date().toISOString(),
    productId: firstItem?.ingredient?._id || firstItem?.ingredient?.id || '',
    productName: firstItem?.ingredient?.name || (w.items?.length > 1 ? 'Multiple ingredients' : 'Ingredient'),
    quantity: totalQty,
    unit: (firstItem?.unit || firstItem?.ingredient?.unit || 'unit') as any,
    reason: w.reason,
    valueLost: totalLoss,
    notes: w.notes || '',
    photoUrl: '',
  };
}

export const wasteService = {
  getWasteHistory: async (params: WasteQueryParams = {}): Promise<PaginatedResponse<WasteEntry>> => {
    const query: Record<string, any> = {
      page: params.page || 1,
      limit: params.pageSize || 10,
    };
    if (params.search) query.search = params.search;
    if (params.reason) query.reason = params.reason;
    if (params.startDate) query.startDate = params.startDate;
    if (params.endDate) query.endDate = params.endDate;

    const res = await apiClient.get<{
      waste: BackendWaste[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/store/waste', query);

    const items = (res.waste || []).map(mapBackendWaste);
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

  getWasteById: async (id: string): Promise<WasteEntry> => {
    const res = await apiClient.get<{ waste: BackendWaste }>(`/store/waste/${id}`);
    const w = res.waste || (res as any);
    return mapBackendWaste(w);
  },

  createWasteEntry: async (dto: CreateWasteDto): Promise<WasteEntry> => {
    const payload = {
      reason: dto.reason,
      notes: dto.notes || undefined,
      items: [
        {
          ingredient: dto.productId,
          quantity: dto.quantity,
        },
      ],
    };

    const res = await apiClient.post<{ waste: BackendWaste }>('/store/waste', payload);
    const w = res.waste || (res as any);
    return mapBackendWaste(w);
  },

  getWasteReasons: async (): Promise<WasteReason[]> => {
    return [
      { name: 'Spoiled', description: 'Natural decay or passed freshness', status: 'Active' },
      { name: 'Damaged Packaging', description: 'Torn or contaminated bags', status: 'Active' },
      { name: 'Burnt/Preparation Error', description: 'Cookery failures or drops', status: 'Active' },
      { name: 'Handling Loss', description: 'Dropped or spilled in store', status: 'Active' },
      { name: 'Expired Batch', description: 'Passed manufacturer best-by date', status: 'Active' },
      { name: 'Other Loss', description: 'Other causes', status: 'Active' },
    ];
  },

  createWasteReason: async (reason: WasteReason): Promise<WasteReason> => {
    return Promise.resolve(reason);
  },
};

export default wasteService;
