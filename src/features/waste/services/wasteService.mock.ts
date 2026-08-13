import { db, simulateDelay, WasteEntry } from '../../../shared/mock/mockDb';
import { WasteQueryParams, CreateWasteDto } from '../types';
import { PaginatedResponse } from '../../../shared/types/common';
import dayjs from 'dayjs';

export async function getWasteHistory(params: WasteQueryParams): Promise<PaginatedResponse<WasteEntry>> {
  await simulateDelay(350);

  const {
    page = 1,
    pageSize = 10,
    search = '',
    reason = '',
    startDate = '',
    endDate = '',
  } = params;

  let filtered = [...db.wasteEntries];

  // 1. Reason filter
  if (reason) {
    filtered = filtered.filter((w) => w.reason === reason);
  }

  // 2. Search product name or notes
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (w) =>
        w.productName.toLowerCase().includes(q) ||
        (w.notes || '').toLowerCase().includes(q)
    );
  }

  // 3. Date filters
  if (startDate) {
    filtered = filtered.filter((w) => dayjs(w.date).isAfter(dayjs(startDate).subtract(1, 'day')));
  }
  if (endDate) {
    filtered = filtered.filter((w) => dayjs(w.date).isBefore(dayjs(endDate).add(1, 'day')));
  }

  // Sort chronological
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

export async function getWasteById(id: string): Promise<WasteEntry> {
  await simulateDelay(250);
  const waste = db.wasteEntries.find((w) => w.id === id);
  if (!waste) throw new Error('Waste record not found');
  return waste;
}

export async function createWasteEntry(dto: CreateWasteDto): Promise<WasteEntry> {
  await simulateDelay(500);

  if (!dto.productId) throw new Error('Ingredient product is required');
  if (!dto.quantity || dto.quantity <= 0) throw new Error('Quantity must be greater than zero');
  if (!dto.reason) throw new Error('Waste reason is required');

  return db.createWasteEntry(dto as any);
}
