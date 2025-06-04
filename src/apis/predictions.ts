import HttpClient from "@/lib/HttpClient";
import env from "@/lib/env";

// Prediction Types
export interface PredictionRequest {
  atm_id: string;
  history_hours?: number;
  use_cache?: boolean;
  cache_ttl?: number;
}

export interface PredictionResponse {
  atm_id: string;
  failure_probability: number;
  confidence: number;
  risk_level: string;
  prediction_available: boolean;
  timestamp: string;
  reason?: string;
  top_risk_factors?: Array<{
    feature: string;
    importance: number;
    value?: string | number;
  }>;
  processing_time_ms?: number;
}

export interface HighRiskATM {
  atm_id: string;
  name: string;
  location: string;
  failure_probability: number;
  confidence: number;
  risk_level: string;
  top_risk_factors: Array<{
    feature: string;
    importance: number;
    value?: string | number;
  }>;
  timestamp: string;
}

export interface HighRiskATMsResponse {
  high_risk_atms: HighRiskATM[];
  threshold: number;
  total_checked: number;
  processing_time_ms?: number;
  timestamp: string;
}

export interface BulkPredictionRequest {
  atm_ids: string[];
  use_cache?: boolean;
  cache_ttl?: number;
  parallel_processing?: boolean;
}

export interface BulkPredictionResponse {
  predictions: PredictionResponse[];
  total_predictions: number;
  successful_predictions: number;
  failed_predictions: number;
  high_risk_count: number;
  critical_risk_count: number;
  processing_time_ms: number;
  throughput_per_second: number;
  cache_hit_rate?: number;
}

// API Functions
export async function predictATMFailure(data: PredictionRequest): Promise<PredictionResponse> {
  return HttpClient.Post(`${env.BACKEND_URL}/api/v1/predictions/failure`, data);
}

export async function getHighRiskATMs(threshold: number = 0.7, limit: number = 20, useCache: boolean = true): Promise<HighRiskATMsResponse> {
  const params = new URLSearchParams({
    threshold: threshold.toString(),
    limit: limit.toString(),
    use_cache: useCache.toString(),
  });

  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/predictions/high-risk?${params.toString()}`);
}

export async function bulkPredictFailures(data: BulkPredictionRequest): Promise<BulkPredictionResponse> {
  return HttpClient.Post(`${env.BACKEND_URL}/api/v1/predictions/bulk`, data);
}
