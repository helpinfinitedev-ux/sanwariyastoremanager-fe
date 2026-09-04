import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import kitchenIssueService from '../services/kitchenIssueService';
import { KitchenIssueQueryParams, CreateKitchenIssueDto } from '../types';
import Toast from '@/web/toast';
import { Kitchen } from '../../../shared/mock/mockDb';

export function useIssueHistory(params: KitchenIssueQueryParams) {
  return useQuery({
    queryKey: ['kitchenIssues', params],
    queryFn: () => kitchenIssueService.getIssueHistory(params),
  });
}

export function useIssueDetails(id: string) {
  return useQuery({
    queryKey: ['kitchenIssue', id],
    queryFn: () => kitchenIssueService.getIssueById(id),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateKitchenIssueDto) => kitchenIssueService.createKitchenIssue(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kitchenIssues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['allProductsRaw'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['kitchenIssueReport'] });
      queryClient.invalidateQueries({ queryKey: ['kitchenConsumptionAnalytics'] });

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
    queryFn: () => kitchenIssueService.getKitchens(),
  });
}

export function useCreateKitchen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kitchen: Kitchen) => kitchenIssueService.createKitchen(kitchen),
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
    },
  });
}
