import { useQuery } from '@tanstack/react-query';
import { getDashboardKpis, getRecentActivities } from '../services/dashboardService.mock';

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboardKpis'],
    queryFn: getDashboardKpis,
    refetchInterval: 10000, // auto refetch every 10s to keep metrics fresh
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['recentActivities'],
    queryFn: getRecentActivities,
  });
}
