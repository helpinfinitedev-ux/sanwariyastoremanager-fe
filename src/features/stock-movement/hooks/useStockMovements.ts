import { useQuery } from '@tanstack/react-query';
import { getStockMovements } from '../services/stockMovementService.mock';

export function useStockMovements(params: {
  page: number;
  pageSize: number;
  search: string;
  type: 'Purchase' | 'Kitchen Issue' | 'Waste' | 'Adjustment' | '';
  productId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['stockMovements', params],
    queryFn: () => getStockMovements(params),
  });
}
