import apiClient from '../../../shared/services/apiClient';
import { Product, Category, Unit, StorageLocation, Brand } from '../../../shared/mock/mockDb';
import { PaginatedResponse } from '../../../shared/types/common';

export interface BackendIngredient {
  _id: string;
  id?: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  averageCost: number;
  stockStatus: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  stockStatus?: string;
}

export interface StockAdjustmentPayload {
  adjustmentType: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  notes?: string;
}

function mapIngredientToProduct(ing: BackendIngredient): Product {
  return {
    id: ing._id || ing.id || '',
    name: ing.name,
    sku: ing.sku,
    category: ing.category,
    unit: ing.unit,
    currentStock: ing.currentStock || 0,
    minStock: ing.minimumStock || 0,
    maxStock: ing.maximumStock || (ing.minimumStock ? ing.minimumStock * 5 : 100),
    purchaseCost: ing.averageCost || 0,
    avgCost: ing.averageCost || 0,
    storageLocation: 'Main Store',
    brand: 'Standard',
  };
}

export const inventoryService = {
  getInventoryList: async (params: InventoryQueryParams = {}): Promise<PaginatedResponse<Product>> => {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.pageSize || 10,
    };
    if (params.search) queryParams.search = params.search;
    if (params.category) queryParams.category = params.category;
    if (params.stockStatus) {
      if (params.stockStatus === 'In Stock') queryParams.stockStatus = 'NORMAL';
      else if (params.stockStatus === 'Low Stock') queryParams.stockStatus = 'LOW_STOCK';
      else if (params.stockStatus === 'Out of Stock') queryParams.stockStatus = 'OUT_OF_STOCK';
      else queryParams.stockStatus = params.stockStatus;
    }

    const res: any = await apiClient.get('/store/inventory', queryParams);

    const rawList: BackendIngredient[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : res?.ingredients || [];

    const items = rawList.map(mapIngredientToProduct);
    const total = Array.isArray(res)
      ? items.length
      : res?.totalCount ?? res?.pagination?.total ?? items.length;
    const pageSize = Array.isArray(res)
      ? 10
      : res?.pageSize ?? res?.pagination?.limit ?? 10;
    const page = Array.isArray(res)
      ? 1
      : res?.page ?? res?.pagination?.page ?? 1;
    const totalPages = Array.isArray(res)
      ? 1
      : res?.totalPages ?? res?.pagination?.pages ?? (Math.ceil(total / pageSize) || 1);

    return {
      data: items,
      totalCount: total,
      page,
      pageSize,
      totalPages,
    };
  },

  getProductById: async (id: string): Promise<Product> => {
    const res: any = await apiClient.get(`/store/inventory/${id}`);
    const ing = res?.ingredient || res;
    return mapIngredientToProduct(ing);
  },

  getAllProductsRaw: async (): Promise<Product[]> => {
    const res: any = await apiClient.get('/store/inventory', { limit: 1000 });
    const rawList: BackendIngredient[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : res?.ingredients || [];
    return rawList.map(mapIngredientToProduct);
  },

  createProduct: async (productData: {
    name: string;
    sku?: string;
    category: string;
    unit: string;
    minStock?: number;
    purchaseCost?: number;
    brand?: string;
    storageLocation?: string;
  }): Promise<Product> => {
    const sku = productData.sku || `ING-${Date.now().toString().slice(-6)}`;
    const payload = {
      name: productData.name.trim(),
      sku,
      category: productData.category.trim(),
      unit: productData.unit.trim().toLowerCase(),
      minimumStock: Number(productData.minStock) || 0,
      averageCost: Number(productData.purchaseCost) || 0,
    };
    const res = await apiClient.post<{ ingredient: BackendIngredient }>('/store/inventory', payload);
    const ing = res.ingredient || (res as any);
    return mapIngredientToProduct(ing);
  },

  updateProduct: async (id: string, data: Partial<BackendIngredient>): Promise<Product> => {
    const res = await apiClient.patch<{ ingredient: BackendIngredient }>(`/store/inventory/${id}`, data);
    const ing = res.ingredient || (res as any);
    return mapIngredientToProduct(ing);
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message?: string }> => {
    return apiClient.delete<{ success: boolean; message?: string }>(`/store/inventory/${id}`);
  },

  adjustStock: async (id: string, payload: StockAdjustmentPayload) => {
    const body = {
      movementType: payload.adjustmentType === 'IN' ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
      quantity: Number(payload.quantity),
      reason: payload.reason,
      notes: payload.notes || undefined,
    };
    return apiClient.post<{ ingredient: BackendIngredient; stockMovement: any }>(
      `/store/inventory/${id}/adjust`,
      body
    );
  },

  // Supporting Lookups
  getCategories: async (): Promise<Category[]> => {
    let backendCategories: string[] = [];
    try {
      const res: any = await apiClient.get('/store/inventory/categories');
      if (Array.isArray(res)) {
        backendCategories = res;
      } else if (Array.isArray(res?.categories)) {
        backendCategories = res.categories;
      }
    } catch {
      const prods = await inventoryService.getAllProductsRaw();
      backendCategories = prods.map((p) => p.category).filter(Boolean);
    }

    const defaultCategories = ['Dairy', 'Grains', 'Spices', 'Dry Goods', 'Packaging'];
    const categoriesMap = new Map<string, string>();

    defaultCategories.forEach((c) => {
      categoriesMap.set(c.toLowerCase(), c);
    });

    backendCategories.forEach((c) => {
      if (c && typeof c === 'string' && c.trim()) {
        const trimmed = c.trim();
        if (!categoriesMap.has(trimmed.toLowerCase())) {
          categoriesMap.set(trimmed.toLowerCase(), trimmed);
        }
      }
    });

    return Array.from(categoriesMap.values()).map((name) => ({ name, description: '', status: 'Active' }));
  },

  createCategory: async (categoryData: { name: string; description?: string; status?: string }): Promise<Category> => {
    const res: any = await apiClient.post('/store/inventory/categories', categoryData);
    const cat = res?.category || res;
    return {
      name: cat?.name || categoryData.name,
      description: cat?.description || categoryData.description || '',
      status: cat?.status || categoryData.status || 'Active',
    };
  },

  getUnits: async (): Promise<Unit[]> => {
    return [
      { name: 'kg', shortCode: 'kg' },
      { name: 'litre', shortCode: 'L' },
      { name: 'gm', shortCode: 'g' },
      { name: 'ml', shortCode: 'ml' },
      { name: 'pcs', shortCode: 'pcs' },
      { name: 'box', shortCode: 'box' },
      { name: 'pack', shortCode: 'pack' },
    ];
  },

  getStorageLocations: async (): Promise<StorageLocation[]> => {
    return [
      { name: 'Main Store', description: 'Central room', status: 'Active' },
      { name: 'Cold Room', description: 'Temperature controlled', status: 'Active' },
      { name: 'Deep Freezer', description: 'Frozen storage', status: 'Active' },
    ];
  },

  getBrands: async (): Promise<Brand[]> => {
    return [
      { name: 'Standard' },
      { name: 'Premium' },
      { name: 'Amul' },
      { name: 'Fortune' },
    ];
  },
};

export default inventoryService;
