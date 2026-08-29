import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIssueHistory, getIssueById, createKitchenIssue, getKitchens, createKitchen } from '../services/kitchenIssueService.mock';
import { KitchenIssueQueryParams, CreateKitchenIssueDto } from '../types';
import Toast from 'react-native-toast-message';
import { Kitchen } from '../../../shared/mock/mockDb';

export function useIssueHistory(params: KitchenIssueQueryParams) {
  return useQuery({
    queryKey: ['kitchenIssues', params],
    queryFn: () => getIssueHistory(params),
  });
}

export function useIssueDetails(id: string) {
  return useQuery({
    queryKey: ['kitchenIssue', id],
    queryFn: () => getIssueById(id),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateKitchenIssueDto) => createKitchenIssue(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kitchenIssues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });

      Toast.show({
        type: 'success',
        text1: 'Stock Issued',
        text2: `Successfully issued items to ${data.issuedToSection}.`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to issue stock',
        text2: error.message || 'Please check stock limits or input data.',
      });
    },
  });
}

export function useKitchens() {
  return useQuery({
    queryKey: ['kitchens'],
    queryFn: getKitchens,
  });
}

export function useCreateKitchen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kitchen: Kitchen) => createKitchen(kitchen),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kitchens'] });
      Toast.show({
        type: 'success',
        text1: 'Kitchen Created',
        text2: `✓ Kitchen department "${data.name}" added successfully`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create kitchen',
        text2: err.message || 'Please check input data.',
      });
    }
  });
}
