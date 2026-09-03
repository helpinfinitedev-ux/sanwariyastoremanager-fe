import apiClient from '../../../shared/services/apiClient';
import { KitchenIssue, KitchenIssueItem, Kitchen } from '../../../shared/mock/mockDb';
import { KitchenIssueQueryParams, CreateKitchenIssueDto } from '../types';
import { PaginatedResponse } from '../../../shared/types/common';

export interface BackendKitchenIssueItem {
  ingredient: {
    _id: string;
    id?: string;
    name: string;
    sku?: string;
    unit?: string;
  };
  quantity: number;
  unit?: string;
}

export interface BackendKitchenIssue {
  _id: string;
  id?: string;
  issueNumber: string;
  destination: string;
  issueDate: string;
  items: BackendKitchenIssueItem[];
  createdBy?: {
    _id: string;
    name: string;
  };
  notes?: string;
  createdAt?: string;
}

function mapBackendIssue(iss: BackendKitchenIssue): KitchenIssue {
  const items: KitchenIssueItem[] = (iss.items || []).map((item) => ({
    productId: item.ingredient?._id || item.ingredient?.id || String(item.ingredient),
    productName: item.ingredient?.name || 'Item',
    quantity: item.quantity,
  }));

  return {
    id: iss._id || iss.id || '',
    date: iss.issueDate || iss.createdAt || new Date().toISOString(),
    issuedToSection: iss.destination,
    issuedBy: iss.createdBy?.name || 'Store Manager',
    items,
    notes: iss.notes || '',
  };
}

export const kitchenIssueService = {
  getIssueHistory: async (params: KitchenIssueQueryParams = {}): Promise<PaginatedResponse<KitchenIssue>> => {
    const query: Record<string, any> = {
      page: params.page || 1,
      limit: params.pageSize || 10,
    };
    if (params.search) query.search = params.search;
    if (params.section) query.destination = params.section;
    if (params.startDate) query.startDate = params.startDate;
    if (params.endDate) query.endDate = params.endDate;

    const res = await apiClient.get<{
      kitchenIssues: BackendKitchenIssue[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/store/kitchen-issues', query);

    const items = (res.kitchenIssues || []).map(mapBackendIssue);
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

  getIssueById: async (id: string): Promise<KitchenIssue> => {
    const res = await apiClient.get<{ kitchenIssue: BackendKitchenIssue }>(`/store/kitchen-issues/${id}`);
    const iss = res.kitchenIssue || (res as any);
    return mapBackendIssue(iss);
  },

  createKitchenIssue: async (dto: CreateKitchenIssueDto): Promise<KitchenIssue> => {
    const payload = {
      destination: dto.issuedToSection,
      issueDate: new Date().toISOString().split('T')[0],
      notes: dto.notes || undefined,
      items: dto.items.map((it) => ({
        ingredient: it.productId,
        quantity: it.quantity,
      })),
    };

    const res = await apiClient.post<{ kitchenIssue: BackendKitchenIssue }>('/store/kitchen-issues', payload);
    const iss = res.kitchenIssue || (res as any);
    return mapBackendIssue(iss);
  },

  getKitchens: async (): Promise<Kitchen[]> => {
    return [
      { name: 'Biryani Station', description: 'Rice & Biryani', status: 'Active' },
      { name: 'Curry Section', description: 'Curries & Gravies', status: 'Active' },
      { name: 'Tandoor Section', description: 'Breads & Tandoor', status: 'Active' },
      { name: 'Dessert Section', description: 'Sweets & Desserts', status: 'Active' },
      { name: 'Chinese Section', description: 'Wok & Starters', status: 'Active' },
      { name: 'Pantry / Cold Prep', description: 'Salads & Juices', status: 'Active' },
    ];
  },

  createKitchen: async (kitchen: Kitchen): Promise<Kitchen> => {
    return Promise.resolve(kitchen);
  },
};

export default kitchenIssueService;
