import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import purchaseService from '../services/purchaseService';
import { PurchaseQueryParams, CreatePurchaseDto, UpdatePurchaseDto } from '../types';
import Toast from '@/web/toast';

export function usePurchases(params: Partial<PurchaseQueryParams> = {}) {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => purchaseService.getPurchases(params as any),
  });
}

export function usePurchaseById(id: string) {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchaseService.getPurchaseById(id),
    enabled: !!id,
  });
}

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => purchaseService.getVendorsList(),
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePurchaseDto) => purchaseService.createPurchase(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseReport'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['vendorPayablesAnalytics'] });

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
    mutationFn: (dto: UpdatePurchaseDto) => purchaseService.updatePurchase(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });

      Toast.show({
        type: 'success',
        text1: 'Purchase Updated',
        text2: `Invoice: ${data.invoiceNo} updated successfully.`,
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

export function useSubmitPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseService.submitPurchase(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseReport'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['vendorPayablesAnalytics'] });

      Toast.show({
        type: 'success',
        text1: 'Purchase Submitted',
        text2: `Invoice: ${data.invoiceNo} stock received and updated.`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to submit purchase',
        text2: error.message || 'Error occurred.',
      });
    },
  });
}

export function useCancelPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseService.cancelPurchase(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', data.id] });
      Toast.show({
        type: 'info',
        text1: 'Purchase Cancelled',
        text2: `Invoice: ${data.invoiceNo} has been cancelled.`,
      });
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => purchaseService.createSupplier(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      Toast.show({
        type: 'success',
        text1: 'Supplier Created',
        text2: `✓ Vendor ${data.name} added successfully.`,
      });
    },
  });
}

export function useVendorOutstanding(vendorId: string, _excludePurchaseId?: string): number {
  const { data: vendors = [] } = useVendors();
  if (!vendorId) return 0;
  const vendor = vendors.find((v) => v.id === vendorId);
  return (vendor as any)?.outstanding || 0;
}


