import { db, simulateDelay, Purchase } from '../../../shared/mock/mockDb';
import { PurchaseQueryParams, CreatePurchaseDto, UpdatePurchaseDto } from '../types';
import { PaginatedResponse } from '../../../shared/types/common';
import dayjs from 'dayjs';

/**
 * Get purchases list with pagination, search, status, date, and vendor filtering.
 */
export async function getPurchases(params: PurchaseQueryParams): Promise<PaginatedResponse<Purchase>> {
  await simulateDelay(500);

  const {
    page = 1,
    pageSize = 10,
    search = '',
    vendorId = '',
    status = '',
    startDate = '',
    endDate = '',
    sortBy = 'orderDate',
    sortOrder = 'desc',
  } = params;

  let filtered = [...db.purchases];

  // 1. Search filter (Invoice number or Vendor name)
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.invoiceNo.toLowerCase().includes(q) || p.vendorName.toLowerCase().includes(q)
    );
  }

  // 2. Vendor filter
  if (vendorId) {
    filtered = filtered.filter((p) => p.vendorId === vendorId);
  }

  // 3. Status filter
  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  // 4. Date range filter
  if (startDate) {
    filtered = filtered.filter((p) => dayjs(p.orderDate).isAfter(dayjs(startDate).subtract(1, 'day')));
  }
  if (endDate) {
    filtered = filtered.filter((p) => dayjs(p.orderDate).isBefore(dayjs(endDate).add(1, 'day')));
  }

  // 5. Sorting
  filtered.sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'orderDate' || sortBy === 'deliveryDate') {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 6. Pagination
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

export async function getPurchaseById(id: string): Promise<Purchase> {
  await simulateDelay(300);
  const purchase = db.purchases.find((p) => p.id === id);
  if (!purchase) throw new Error('Purchase order not found');
  return purchase;
}

export async function createPurchase(dto: CreatePurchaseDto): Promise<Purchase> {
  await simulateDelay(600);
  
  if (!dto.invoiceNo) throw new Error('Invoice Number is required');
  if (!dto.vendorId) throw new Error('Vendor is required');
  if (dto.items.length === 0) throw new Error('At least one item is required');

  return db.createPurchase(dto as any);
}

export async function updatePurchase(id: string, dto: UpdatePurchaseDto): Promise<Purchase> {
  await simulateDelay(600);
  return db.updatePurchase(id, dto as any);
}

export async function getVendorsList() {
  await simulateDelay(200);
  return db.vendors;
}
