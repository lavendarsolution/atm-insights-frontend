import { useEffect, useRef, useState } from "react";

import { useATMData } from "@/features/atms/hooks";
import { ATM } from "@/features/atms/schema";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryParams } from "@/hooks/useQueryParams";
import { PaginationState } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Building, Download, Filter, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ATMActionsDropdown } from "@/components/ATMActionsDropdown";
import { StatusBadge } from "@/components/StatusBadge";
import PageContainer from "@/components/layouts/PageContainer";
import KDataTable from "@/components/table/KDataTable";
import KPaginatedKDataTable from "@/components/table/KPaginatedDataTable";

const atmColumns: ColumnDef<ATM>[] = [
  {
    accessorKey: "atm_id",
    header: "ATM ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("atm_id")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "cash_level",
    header: "Cash Level",
    cell: ({ row }) => {
      //   const cashLevel = row.original.lastTelemetry?.cash_level || 0;
      const cashLevel = 0;
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${cashLevel > 70 ? "bg-green-500" : cashLevel > 30 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${cashLevel}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{cashLevel}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "temperature",
    header: "Temperature",
    cell: ({ row }) => {
      //   const temp = row.original.lastTelemetry?.temperature;
      const temp = 0;
      return temp ? `${temp}°C` : "N/A";
    },
  },
  {
    accessorKey: "network_status",
    header: "Network",
    cell: ({ row }) => {
      const networkStatus = "good";
      //   const networkStatus = row.original.lastTelemetry?.network_status || "unknown";
      return (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            networkStatus === "good" ? "bg-green-100 text-green-800" : networkStatus === "fair" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
          }`}
        >
          {networkStatus}
        </span>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: "Last Update",
    cell: ({ row }) => new Date(row.getValue("updated_at")).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <ATMActionsDropdown
          atmId={row.original.atm_id}
          onDelete={(id) => {
            // Handle delete action
            console.log("Delete ATM:", id);
          }}
        />
      </div>
    ),
  },
];

export default function PageAtms() {
  const navigate = useNavigate();
  const { queryParams, updateQueryParams } = useQueryParams();
  const isInitialMount = useRef(true);

  // Initialize filters from URL params
  const [searchTerm, setSearchTerm] = useState(queryParams.search || "");
  const [statusFilter, setStatusFilter] = useState(queryParams.status || "all");
  const [regionFilter, setRegionFilter] = useState(queryParams.region || "all");

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Initialize pagination from URL params
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: queryParams.page || 0, // Keep as 0-based index to match backend
    pageSize: queryParams.limit || 10,
  });

  // Create normalized filter params for API
  const apiParams = {
    page: pagination.pageIndex, // Use 0-based page index directly
    limit: pagination.pageSize, // Use limit instead of pageSize
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    region: regionFilter !== "all" ? regionFilter : undefined,
  };

  // Fetch ATM data
  const { data: atmData, isLoading, error } = useATMData(apiParams);

  // Update URL when filters change (skip on initial mount if defaults)
  useEffect(() => {
    // Skip URL update on initial mount if all values are defaults
    if (isInitialMount.current) {
      const hasNonDefaultValues =
        (queryParams.page && queryParams.page !== 0) ||
        (queryParams.limit && queryParams.limit !== 10) ||
        queryParams.search ||
        (queryParams.status && queryParams.status !== "all") ||
        (queryParams.region && queryParams.region !== "all");

      if (!hasNonDefaultValues) {
        isInitialMount.current = false;
        return;
      }
    }

    isInitialMount.current = false;

    const newFilters: any = {};

    // Only include non-default values in URL
    if (pagination.pageIndex !== 0) {
      newFilters.page = pagination.pageIndex;
    }
    if (pagination.pageSize !== 100) {
      newFilters.limit = pagination.pageSize;
    }
    if (debouncedSearchTerm) {
      newFilters.search = debouncedSearchTerm;
    }
    if (statusFilter !== "all") {
      newFilters.status = statusFilter;
    }
    if (regionFilter !== "all") {
      newFilters.region = regionFilter;
    }

    updateQueryParams(newFilters);
  }, [pagination, debouncedSearchTerm, statusFilter, regionFilter, updateQueryParams, queryParams]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (!isInitialMount.current && debouncedSearchTerm !== (queryParams.search || "")) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [debouncedSearchTerm, queryParams.search]);

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleRegionFilterChange = (value: string) => {
    setRegionFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleAddATM = () => {
    navigate("/atms/add");
  };

  // Get unique regions from data for filter options
  const regions = atmData?.data
    ? [
        ...new Set(
          atmData.data
            .map((atm) => {
              // Extract region from atm_id (assuming format like "REGION-XXX")
              const regionMatch = atm.atm_id.match(/^([A-Z]+)-/);
              return regionMatch ? regionMatch[1] : null;
            })
            .filter(Boolean)
        ),
      ]
    : [];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-2 text-red-500">Error loading ATM data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1>ATM Management</h1>
          <p className="text-muted-foreground">Monitor and manage your ATM network</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddATM}>
            <Plus className="mr-2 h-4 w-4" />
            Add ATM
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ATMs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 md:w-[300px]" />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="decommissioned">Decommissioned</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={handleRegionFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <KPaginatedKDataTable
        columns={atmColumns}
        data={atmData?.data || []}
        loading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        total={atmData?.total || 0}
      />
    </PageContainer>
  );
}
