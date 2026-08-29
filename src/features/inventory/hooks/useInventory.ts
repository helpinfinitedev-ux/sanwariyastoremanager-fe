import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInventoryList,
  getProductById,
  getAllProductsRaw,
  getCategories,
  getUnits,
  getStorageLocations,
  getBrands,
  createCategory,
  createUnit,
  createStorageLocation,
  createProduct
} from '../services/inventoryService.mock';
import Toast from 'react-native-toast-message';
import { Category, Unit, StorageLocation, Product } from '../../../shared/mock/mockDb';

export function useInventoryList(params: {
  page: number;
  pageSize: number;
  search: string;
  category: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | '';
}) {
  return useQuery({
    queryKey: ['inventoryList', params],
    queryFn: () => getInventoryList(params),
  });
}

export function useProductDetails(id: string) {
  return useQuery({
    queryKey: ['productDetails', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

export function useAllProductsRaw() {
  return useQuery({
    queryKey: ['allProductsRaw'],
    queryFn: getAllProductsRaw,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
  });
}

export function useStorageLocations() {
  return useQuery({
    queryKey: ['storageLocations'],
    queryFn: getStorageLocations,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: Category) => createCategory(category),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      Toast.show({
        type: 'success',
        text1: 'Category Created',
        text2: `✓ Category "${data.name}" added successfully`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create category',
        text2: err.message || 'Please check input data.',
      });
    }
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unit: Unit) => createUnit(unit),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      Toast.show({
        type: 'success',
        text1: 'Unit Created',
        text2: `✓ Unit "${data.name}" added successfully`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create unit',
        text2: err.message || 'Please check input data.',
      });
    }
  });
}

export function useCreateStorageLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (location: StorageLocation) => createStorageLocation(location),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storageLocations'] });
      Toast.show({
        type: 'success',
        text1: 'Storage Location Created',
        text2: `✓ Location "${data.name}" added successfully`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create location',
        text2: err.message || 'Please check input data.',
      });
    }
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
    }) => createProduct(productData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['allProductsRaw'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
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
    }
  });
}
