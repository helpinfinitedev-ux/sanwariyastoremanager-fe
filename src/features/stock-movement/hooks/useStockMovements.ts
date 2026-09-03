import { useQuery } from '@tanstack/react-query';
import stockMovementService, { StockMovementQueryParams } from '../services/stockMovementService';

export function useStockMovements(params: StockMovementQueryParams) {
  return useQuery({
    queryKey: ['stockMovements', params],
    queryFn: () => stockMovementService.getStockMovements(params),
  });
}
