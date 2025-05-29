import { ATMQueryParams, fetchATMs } from "@/apis/atms";
import { useQuery } from "@tanstack/react-query";

export function useATMData(params: ATMQueryParams) {
  return useQuery({
    queryKey: ["atms", params],
    queryFn: () => fetchATMs(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}
