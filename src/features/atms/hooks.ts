import { ATMQueryParams, fetchATMs } from "@/apis/atms";
import { useQuery } from "@tanstack/react-query";

import HttpClient from "@/lib/HttpClient";

export function useATMData(params: ATMQueryParams) {
  return useQuery({
    queryKey: ["atms", params],
    queryFn: () => fetchATMs(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

export function useAtmById(atmId: string) {
  return useQuery({
    queryKey: ["atm", atmId],
    queryFn: () => HttpClient.Get(`/api/v1/atms/${atmId}`),
  });
}
