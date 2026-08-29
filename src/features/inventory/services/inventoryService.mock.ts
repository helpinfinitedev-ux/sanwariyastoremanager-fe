import { db, simulateDelay, Product, Category, Unit, StorageLocation, Brand } from '../../../shared/mock/mockDb';
import { PaginatedResponse } from '../../../shared/types/common';
import { getStockStatus } from '../../../shared/utils/calculations';

interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock' | '';
}

export async function getInventoryList(params: InventoryQueryParams): Promise<PaginatedResponse<Product>> {
  await simulateDelay(400);

  const {
    page = 1,
    pageSize = 10,
    search = '',
    category = '',
    stockStatus = '',
  } = params;

  let filtered = [...db.products];

  // 1. Search by SKU or Name
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }

  // 2. Category filter
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  // 3. Stock Status filter
  if (stockStatus) {
    filtered = filtered.filter((p) => getStockStatus(p) === stockStatus);
  }

  // Sorting: SKU ascending
  filtered.sort((a, b) => a.sku.localeCompare(b.sku));

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

export async function getProductById(id: string): Promise<Product> {
  await simulateDelay(250);
  const product = db.products.find((p) => p.id === id);
  if (!product) throw new Error('Product not found in inventory');
  return product;
}

export async function getAllProductsRaw() {
  await simulateDelay(100);
  return db.products;
}

export async function getCategories(): Promise<Category[]> {
  await simulateDelay(150);
  return db.categories;
}

export async function getUnits(): Promise<Unit[]> {
  await simulateDelay(150);
  return db.units;
}

export async function getStorageLocations(): Promise<StorageLocation[]> {
  await simulateDelay(150);
  return db.storageLocations;
}

export async function getBrands(): Promise<Brand[]> {
  await simulateDelay(150);
  return db.brands;
}

export async function createCategory(category: Category): Promise<Category> {
  await simulateDelay(300);
  return db.createCategory(category);
}

export async function createUnit(unit: Unit): Promise<Unit> {
  await simulateDelay(300);
  return db.createUnit(unit);
}

export async function createStorageLocation(location: StorageLocation): Promise<StorageLocation> {
  await simulateDelay(300);
  return db.createStorageLocation(location);
}

export async function createProduct(productData: {
  name: string;
  category: string;
  unit: string;
  minStock?: number;
  purchaseCost?: number;
  brand?: string;
  storageLocation?: string;
}): Promise<Product> {
  await simulateDelay(300);
  return db.createProduct(productData);
}
