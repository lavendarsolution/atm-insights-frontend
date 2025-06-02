import { ATMQueryParams, createATM, fetchATMById, fetchATMs, updateATM } from "@/apis/atms";
import { ATMCreate, ATMUpdate } from "@/features/atms/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    queryFn: () => fetchATMById(atmId),
    enabled: !!atmId,
  });
}

export function useCreateATM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ATMCreate) => createATM(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
    },
  });
}

export function useUpdateATM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ atmId, data }: { atmId: string; data: ATMUpdate }) => updateATM(atmId, data),
    onSuccess: (_, { atmId }) => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
      queryClient.invalidateQueries({ queryKey: ["atm", atmId] });
    },
  });
}

export function useDeleteAtmByIdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (atmId: string) => HttpClient.Delete(`/api/v1/atms/${atmId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
    },
  });
}
