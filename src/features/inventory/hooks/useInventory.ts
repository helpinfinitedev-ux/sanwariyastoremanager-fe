import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService, { StockAdjustmentPayload } from '../services/inventoryService';
import Toast from '@/web/toast';
import { Category, Unit, StorageLocation } from '../../../shared/mock/mockDb';

export function useInventoryList(params: {
  page: number;
  pageSize: number;
  search: string;
  category: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | '';
}) {
  return useQuery({
    queryKey: ['inventoryList', params],
    queryFn: () => inventoryService.getInventoryList(params),
  });
}

export function useProductDetails(id: string) {
  return useQuery({
    queryKey: ['productDetails', id],
    queryFn: () => inventoryService.getProductById(id),
    enabled: !!id,
  });
}

export function useAllProductsRaw() {
  return useQuery({
    queryKey: ['allProductsRaw'],
    queryFn: () => inventoryService.getAllProductsRaw(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => inventoryService.getCategories(),
  });
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => inventoryService.getUnits(),
  });
}

export function useStorageLocations() {
  return useQuery({
    queryKey: ['storageLocations'],
    queryFn: () => inventoryService.getStorageLocations(),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => inventoryService.getBrands(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: Category) => Promise.resolve(category),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      Toast.show({
        type: 'success',
        text1: 'Category Created',
        text2: `✓ Category "${data.name}" added successfully`,
      });
    },
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unit: Unit) => Promise.resolve(unit),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      Toast.show({
        type: 'success',
        text1: 'Unit Created',
        text2: `✓ Unit "${data.name}" added successfully`,
      });
    },
  });
}

export function useCreateStorageLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (location: StorageLocation) => Promise.resolve(location),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storageLocations'] });
      Toast.show({
        type: 'success',
        text1: 'Storage Location Created',
        text2: `✓ Location "${data.name}" added successfully`,
      });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productData: {
      name: string;
      category: string;
      unit: string;
      minStock?: number;
      purchaseCost?: number;
      brand?: string;
      storageLocation?: string;
    }) => inventoryService.createProduct(productData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['allProductsRaw'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryReport'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryAnalytics'] });
      Toast.show({
        type: 'success',
        text1: 'Ingredient Created',
        text2: `✓ Ingredient "${data.name}" added successfully`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create ingredient',
        text2: err.message || 'Please check input data.',
      });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StockAdjustmentPayload }) =>
      inventoryService.adjustStock(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['allProductsRaw'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryReport'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovementAnalytics'] });
      Toast.show({
        type: 'success',
        text1: 'Stock Adjusted',
        text2: `✓ Successfully adjusted stock (${variables.payload.adjustmentType}).`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Adjustment Failed',
        text2: err.message || 'Please check quantity and try again.',
      });
    },
  });
}
