import { useCallback } from "react";

import { useSearchParams } from "react-router-dom";

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  [key: string]: any;
}

export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getQueryParams = useCallback((): QueryParams => {
    const params: QueryParams = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === "page" || key === "pageSize") {
        params[key] = parseInt(value, 10);
      } else {
        params[key] = value;
      }
    }
    return params;
  }, [searchParams]);

  const updateQueryParams = useCallback(
    (updates: Partial<QueryParams>, skipDefaults = true) => {
      const current = getQueryParams();
      
      // Create new params object
      const newParams = { ...updates };

      // Remove undefined/null/empty values and default values if skipDefaults is true
      Object.keys(newParams).forEach((key) => {
        const value = newParams[key];
        if (value === undefined || value === null || value === "") {
          delete newParams[key];
        } else if (skipDefaults) {
          // Remove default values to keep URL clean
          if ((key === "page" && value === 1) || (key === "pageSize" && value === 10)) {
            delete newParams[key];
          }
        }
      });

      // Only update if there are actual changes
      const currentUrlParams = new URLSearchParams();
      Object.entries(current).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Skip defaults in current params comparison
          if (skipDefaults && ((key === "page" && value === 1) || (key === "pageSize" && value === 10))) {
            return;
          }
          currentUrlParams.set(key, value.toString());
        }
      });

      const newUrlParams = new URLSearchParams();
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          newUrlParams.set(key, value.toString());
        }
      });

      // Compare URL params to avoid unnecessary updates
      if (currentUrlParams.toString() !== newUrlParams.toString()) {
        setSearchParams(newUrlParams);
      }
    },
    [getQueryParams, setSearchParams]
  );

  return {
    queryParams: getQueryParams(),
    updateQueryParams,
  };
}
