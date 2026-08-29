import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPurchases, getPurchaseById, createPurchase, updatePurchase, getVendorsList, createSupplier } from '../services/purchaseService.mock';
import { PurchaseQueryParams, CreatePurchaseDto, UpdatePurchaseDto } from '../types';
import Toast from 'react-native-toast-message';
import { Vendor } from '../../../shared/mock/mockDb';

export function usePurchases(params: PurchaseQueryParams) {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => getPurchases(params),
  });
}

export function usePurchaseById(id: string) {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => getPurchaseById(id),
    enabled: !!id,
  });
}

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: getVendorsList,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePurchaseDto) => createPurchase(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      
      Toast.show({
        type: 'success',
        text1: 'Purchase Created',
        text2: `Invoice: ${data.invoiceNo} has been successfully logged as ${data.status}.`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create purchase',
        text2: error.message || 'Please check input data.',
      });
    },
  });
}

export function useUpdatePurchase(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdatePurchaseDto) => updatePurchase(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });

      Toast.show({
        type: 'success',
        text1: 'Purchase Updated',
        text2: `Invoice: ${data.invoiceNo} updated to ${data.status}.`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update purchase',
        text2: error.message || 'Please check input data.',
      });
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorData: Omit<Vendor, 'id' | 'code'>) => createSupplier(vendorData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      Toast.show({
        type: 'success',
        text1: 'Supplier Created',
        text2: `✓ Supplier "${data.name}" added successfully`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create supplier',
        text2: err.message || 'Please check input data.',
      });
    }
  });
}
