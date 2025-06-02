import { ATM, ATMCreate, ATMUpdate } from "@/features/atms/schema";

import HttpClient from "@/lib/HttpClient";
import env from "@/lib/env";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ATMQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  region?: string;
  manufacturer?: string;
}

export async function fetchATMs(params: ATMQueryParams): Promise<PaginatedResponse<ATM>> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value.toString());
    }
  });

  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/atms?${searchParams.toString()}`);
}

export async function createATM(data: ATMCreate): Promise<ATM> {
  return HttpClient.Post(`${env.BACKEND_URL}/api/v1/atms`, data);
}

export async function updateATM(atmId: string, data: ATMUpdate): Promise<ATM> {
  return HttpClient.Put(`${env.BACKEND_URL}/api/v1/atms/${atmId}`, data);
}

export async function fetchATMById(atmId: string): Promise<ATM> {
  return HttpClient.Get(`${env.BACKEND_URL}/api/v1/atms/${atmId}`);
}

export async function deleteATM(atmId: string): Promise<void> {
  return HttpClient.Delete(`${env.BACKEND_URL}/api/v1/atms/${atmId}`);
}
