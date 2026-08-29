import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWasteHistory, getWasteById, createWasteEntry, getWasteReasons, createWasteReason } from '../services/wasteService.mock';
import { WasteQueryParams, CreateWasteDto } from '../types';
import Toast from 'react-native-toast-message';
import { WasteReason } from '../../../shared/mock/mockDb';

export function useWasteHistory(params: WasteQueryParams) {
  return useQuery({
    queryKey: ['wasteList', params],
    queryFn: () => getWasteHistory(params),
  });
}

export function useWasteDetails(id: string) {
  return useQuery({
    queryKey: ['wasteDetail', id],
    queryFn: () => getWasteById(id),
    enabled: !!id,
  });
}

export function useCreateWaste() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWasteDto) => createWasteEntry(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wasteList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });

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
    queryFn: getWasteReasons,
  });
}

export function useCreateWasteReason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: WasteReason) => createWasteReason(reason),
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
    }
  });
}
