import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import expensesService from '../services/expensesService';
import { OtherExpenseFormInputs } from '../types/expenses.types';
import Toast from '@/web/toast';

export const EXPENSE_QUERY_KEYS = {
  other: ['expenses', 'other'] as const,
  ingredient: ['purchases'] as const,
};

export const useOtherExpenses = () => {
  return useQuery({
    queryKey: EXPENSE_QUERY_KEYS.other,
    queryFn: () => expensesService.getOtherExpenses(),
  });
};

export const useIngredientExpenses = () => {
  return useQuery({
    queryKey: EXPENSE_QUERY_KEYS.ingredient,
    queryFn: () => expensesService.getIngredientExpenses(),
  });
};

export const useCreateOtherExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OtherExpenseFormInputs) => expensesService.createOtherExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEYS.other });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenseReport'] });
      queryClient.invalidateQueries({ queryKey: ['expenseAnalytics'] });

      Toast.show({
        type: 'success',
        text1: 'Expense Logged',
        text2: '✓ Operational expense recorded successfully.',
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to log expense',
        text2: err.message || 'Please check input fields.',
      });
    },
  });
};

export const useUpdateOtherExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OtherExpenseFormInputs> }) =>
      expensesService.updateOtherExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEYS.other });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenseReport'] });
      queryClient.invalidateQueries({ queryKey: ['expenseAnalytics'] });

      Toast.show({
        type: 'success',
        text1: 'Expense Updated',
        text2: '✓ Operational expense updated successfully.',
      });
    },
  });
};

export const useDeleteOtherExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesService.deleteOtherExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEYS.other });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenseReport'] });
      queryClient.invalidateQueries({ queryKey: ['expenseAnalytics'] });

      Toast.show({
        type: 'info',
        text1: 'Expense Deleted',
        text2: 'Operational expense record removed.',
      });
    },
  });
};
