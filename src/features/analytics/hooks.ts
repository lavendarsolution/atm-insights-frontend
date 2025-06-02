import {
  type AnalyticsData,
  type AnalyticsOverview,
  type CashLevelDistribution,
  type LocationAnalytics,
  type StatusDistribution,
  type TrendData,
  fetchAnalyticsData,
  fetchAnalyticsOverview,
  fetchCashLevelDistribution,
  fetchLocationAnalytics,
  fetchStatusDistribution,
  fetchWeeklyTrends,
} from "@/apis/analytics";
import { useQuery } from "@tanstack/react-query";

// Query keys
export const analyticsKeys = {
  all: ["analytics"] as const,
  data: () => [...analyticsKeys.all, "data"] as const,
  overview: () => [...analyticsKeys.all, "overview"] as const,
  cashLevels: () => [...analyticsKeys.all, "cash-levels"] as const,
  statusDistribution: () => [...analyticsKeys.all, "status-distribution"] as const,
  regions: () => [...analyticsKeys.all, "regions"] as const,
  trends: () => [...analyticsKeys.all, "trends"] as const,
};

// Hooks
export function useAnalyticsData() {
  return useQuery<AnalyticsData>({
    queryKey: analyticsKeys.data(),
    queryFn: fetchAnalyticsData,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: analyticsKeys.overview(),
    queryFn: fetchAnalyticsOverview,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useCashLevelDistribution() {
  return useQuery<CashLevelDistribution[]>({
    queryKey: analyticsKeys.cashLevels(),
    queryFn: fetchCashLevelDistribution,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useStatusDistribution() {
  return useQuery<StatusDistribution[]>({
    queryKey: analyticsKeys.statusDistribution(),
    queryFn: fetchStatusDistribution,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useLocationAnalytics() {
  return useQuery<LocationAnalytics[]>({
    queryKey: analyticsKeys.regions(),
    queryFn: fetchLocationAnalytics,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useWeeklyTrends() {
  return useQuery<TrendData[]>({
    queryKey: analyticsKeys.trends(),
    queryFn: fetchWeeklyTrends,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
