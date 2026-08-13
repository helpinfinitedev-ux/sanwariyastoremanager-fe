import { useQuery } from '@tanstack/react-query';
import { getInventoryList, getProductById, getAllProductsRaw } from '../services/inventoryService.mock';

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
