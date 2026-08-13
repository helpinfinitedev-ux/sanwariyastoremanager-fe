import { db, simulateDelay, StockMovement } from '../../../shared/mock/mockDb';
import { PaginatedResponse } from '../../../shared/types/common';
import dayjs from 'dayjs';

interface MovementQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: 'Purchase' | 'Kitchen Issue' | 'Waste' | 'Adjustment' | '';
  productId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getStockMovements(params: MovementQueryParams): Promise<PaginatedResponse<StockMovement>> {
  await simulateDelay(350);

  const {
    page = 1,
    pageSize = 10,
    search = '',
    type = '',
    productId = '',
    startDate = '',
    endDate = '',
  } = params;

  let filtered = [...db.movements];

  // 1. Filter by specific product
  if (productId) {
    filtered = filtered.filter((m) => m.productId === productId);
  }

  // 2. Filter by type
  if (type) {
    filtered = filtered.filter((m) => m.type === type);
  }

  // 3. Search product name or reference ID
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (m) => m.productName.toLowerCase().includes(q) || m.referenceId.toLowerCase().includes(q)
    );
  }

  // 4. Date filter
  if (startDate) {
    filtered = filtered.filter((m) => dayjs(m.date).isAfter(dayjs(startDate).subtract(1, 'day')));
  }
  if (endDate) {
    filtered = filtered.filter((m) => dayjs(m.date).isBefore(dayjs(endDate).add(1, 'day')));
  }

  // Chronological sort is pre-applied in seed but ensure sorting
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination
  const totalCount = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return {
    data: paginatedData,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
