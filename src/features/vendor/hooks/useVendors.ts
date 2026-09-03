import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vendorService from '../services/vendorService';
import { VendorFormInputs, MakePaymentPayload } from '../types/vendor.types';

export const VENDOR_QUERY_KEYS = {
  all: ['vendors'] as const,
  details: (id: string) => ['vendors', 'details', id] as const,
  summary: (id: string) => ['vendors', 'summary', id] as const,
  ledger: (id: string) => ['vendors', 'ledger', id] as const,
};

export const useVendors = () => {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.all,
    queryFn: () => vendorService.getVendors(),
  });
};

export const useVendorDetails = (id: string) => {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.details(id),
    queryFn: () => vendorService.getVendorById(id),
    enabled: !!id,
  });
};

export const useVendorLedger = (id: string) => {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.ledger(id),
    queryFn: () => vendorService.getVendorLedger(id),
    enabled: !!id,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorFormInputs) => vendorService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['vendorPayablesAnalytics'] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VendorFormInputs> }) =>
      vendorService.updateVendor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.ledger(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['vendorPayablesAnalytics'] });
    },
  });
};

export const useMakeVendorPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MakePaymentPayload) => vendorService.makePayment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.details(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.ledger(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['vendorPayablesAnalytics'] });
    },
  });
};
