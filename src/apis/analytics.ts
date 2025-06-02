import HttpClient from "@/lib/HttpClient";
import env from "@/lib/env";

export interface AnalyticsOverview {
  total_atms: number;
  operational_rate: number;
  issue_rate: number;
  regions_count: number;
  active_atms: number;
  atms_with_issues: number;
}

export interface CashLevelDistribution {
  name: string;
  value: number;
  color: string;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface LocationAnalytics {
  region: string;
  count: number;
  active: number;
  warning: number;
  error: number;
  inactive: number;
}

export interface TrendData {
  name: string;
  transactions: number;
  errors: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  cash_levels: CashLevelDistribution[];
  status_data: StatusDistribution[];
  region_data: LocationAnalytics[];
  weekly_trends: TrendData[];
  last_updated: string;
}

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/analytics/data`);
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/analytics/overview`);
}

export async function fetchCashLevelDistribution(): Promise<CashLevelDistribution[]> {
  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/analytics/cash-levels`);
}

export async function fetchStatusDistribution(): Promise<StatusDistribution[]> {
  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/analytics/status-distribution`);
}

export async function fetchLocationAnalytics(): Promise<LocationAnalytics[]> {
  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/analytics/regions`);
}

export async function fetchWeeklyTrends(): Promise<TrendData[]> {
  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/analytics/trends`);
}
