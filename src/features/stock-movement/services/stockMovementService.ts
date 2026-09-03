import apiClient from '../../../shared/services/apiClient';
import { StockMovement } from '../../../shared/mock/mockDb';
import { PaginatedResponse } from '../../../shared/types/common';

export interface BackendStockMovement {
  _id: string;
  id?: string;
  ingredient: {
    _id: string;
    id?: string;
    name: string;
    sku?: string;
    unit?: string;
  };
  movementType: 'PURCHASE_IN' | 'KITCHEN_ISSUE_OUT' | 'WASTE_OUT' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | string;
  quantity: number;
  unit?: string;
  unitCost?: number;
  stockBefore: number;
  stockAfter: number;
  referenceId?: string;
  referenceType?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface StockMovementQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: 'Purchase' | 'Kitchen Issue' | 'Waste' | 'Adjustment' | '' | string;
  productId?: string;
  startDate?: string;
  endDate?: string;
}

function mapMovement(m: BackendStockMovement): StockMovement {
  let mappedType: StockMovement['type'] = 'Adjustment';
  if (m.movementType === 'PURCHASE_IN') mappedType = 'Purchase';
  else if (m.movementType === 'KITCHEN_ISSUE_OUT') mappedType = 'Kitchen Issue';
  else if (m.movementType === 'WASTE_OUT') mappedType = 'Waste';
  else mappedType = 'Adjustment';

  const isPositive = m.movementType.endsWith('_IN') || m.movementType === 'ADJUSTMENT_IN';
  const qtyDelta = isPositive ? m.quantity : -m.quantity;

  return {
    id: m._id || m.id || '',
    date: m.createdAt || new Date().toISOString(),
    productId: m.ingredient?._id || m.ingredient?.id || '',
    productName: m.ingredient?.name || 'Item',
    type: mappedType,
    quantityChange: qtyDelta,
    balanceAfter: m.stockAfter,
    referenceId: m.referenceId || m.reason || m.movementType,
  };
}

export const stockMovementService = {
  getStockMovements: async (params: StockMovementQueryParams = {}): Promise<PaginatedResponse<StockMovement>> => {
    const query: Record<string, any> = {
      page: params.page || 1,
      limit: params.pageSize || 10,
    };
    if (params.productId) query.ingredientId = params.productId;
    if (params.startDate) query.startDate = params.startDate;
    if (params.endDate) query.endDate = params.endDate;

    if (params.type) {
      if (params.type === 'Purchase') query.movementType = 'PURCHASE_IN';
      else if (params.type === 'Kitchen Issue') query.movementType = 'KITCHEN_ISSUE_OUT';
      else if (params.type === 'Waste') query.movementType = 'WASTE_OUT';
      else if (params.type === 'Adjustment') query.movementType = 'ADJUSTMENT_IN,ADJUSTMENT_OUT';
    }

    const res = await apiClient.get<{
      movements: BackendStockMovement[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/store/inventory/movements', query);

    let items = (res.movements || []).map(mapMovement);

    // Client search filter if provided
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter((i) => i.productName.toLowerCase().includes(q));
    }

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
};

export default stockMovementService;
