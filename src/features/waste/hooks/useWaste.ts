import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wasteService from '../services/wasteService';
import { WasteQueryParams, CreateWasteDto } from '../types';
import Toast from '@/web/toast';
import { WasteReason } from '../../../shared/mock/mockDb';

export function useWasteHistory(params: WasteQueryParams) {
  return useQuery({
    queryKey: ['wasteList', params],
    queryFn: () => wasteService.getWasteHistory(params),
  });
}

export function useWasteDetails(id: string) {
  return useQuery({
    queryKey: ['wasteDetail', id],
    queryFn: () => wasteService.getWasteById(id),
    enabled: !!id,
  });
}

export function useCreateWaste() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWasteDto) => wasteService.createWasteEntry(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wasteList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['allProductsRaw'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['wasteReport'] });
      queryClient.invalidateQueries({ queryKey: ['wasteAnalytics'] });

      Toast.show({
        type: 'success',
        text1: 'Waste Logged',
        text2: `Logged spoiled/damaged ${data.productName} successfully.`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to log waste',
        text2: error.message || 'Please check stock limits or input data.',
      });
    },
  });
}

export function useWasteReasons() {
  return useQuery({
    queryKey: ['wasteReasons'],
    queryFn: () => wasteService.getWasteReasons(),
  });
}

export function useCreateWasteReason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: WasteReason) => wasteService.createWasteReason(reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wasteReasons'] });
      Toast.show({
        type: 'success',
        text1: 'Waste Reason Created',
        text2: `✓ Waste reason "${data.name}" added successfully`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create waste reason',
        text2: err.message || 'Please check input data.',
      });
    },
  });
}
