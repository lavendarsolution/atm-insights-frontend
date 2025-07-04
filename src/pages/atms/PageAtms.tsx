import { useEffect, useMemo, useRef, useState } from "react";

import { HighRiskATM, getHighRiskATMs } from "@/apis/predictions";
import { useATMData, useDeleteAtmByIdMutation } from "@/features/atms/hooks";
import { ATM, regionEnum } from "@/features/atms/schema";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryParams } from "@/hooks/useQueryParams";
import { RealtimeATMsProvider, useRealtimeATMs } from "@/providers/RealtimeATMsProvider";
import { PaginationState } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Clock, Plus, RefreshCcw, Search, Wifi, WifiOff } from "lucide-react";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { datetime2str, formatLastUpdate } from "@/lib/helpers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { StatusBadge } from "@/components/StatusBadge";
import { useConfirm } from "@/components/confirm";
import PageContainer from "@/components/layouts/PageContainer";
import { ATMModal } from "@/components/modals/ATMModal";
import KPaginatedKDataTable from "@/components/table/KPaginatedDataTable";

// Enhanced Status Badge with real-time indicators
const RealtimeStatusBadge = ({ atm, isRecentlyUpdated }: { atm: ATM; isRecentlyUpdated: boolean }) => {
  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={atm.status} />
      {isRecentlyUpdated && (
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
          <span className="text-xs text-blue-600">Updated</span>
        </div>
      )}
    </div>
  );
};

// Main ATMs List Content Component
function ATMsListContent() {
  const confirm = useConfirm();
  const navigate = useNavigate();

  const deleteAtmByIdMutation = useDeleteAtmByIdMutation();

  const { queryParams, updateQueryParams } = useQueryParams();
  const isInitialMount = useRef(true);
  const { state: realtimeState, actions: realtimeActions } = useRealtimeATMs();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingATMId, setEditingATMId] = useState<string | null>(null);

  // Initialize filters from URL params
  const [searchTerm, setSearchTerm] = useState(queryParams.search || "");
  const [statusFilter, setStatusFilter] = useState(queryParams.status || "all");
  const [regionFilter, setRegionFilter] = useState(queryParams.region || "all");
  const [showHighRisk, setShowHighRisk] = useState(false);

  // High-risk ATMs state
  const [highRiskATMs, setHighRiskATMs] = useState<HighRiskATM[]>([]);
  const [highRiskLoading, setHighRiskLoading] = useState(false);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Initialize pagination from URL params
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: queryParams.page || 0,
    pageSize: queryParams.limit || 10,
  });

  // Create normalized filter params for API
  const apiParams = {
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    region: regionFilter !== "all" ? regionFilter : undefined,
  };

  // Fetch ATM data
  const { data: atmData, isLoading, error } = useATMData(apiParams);

  // Update real-time provider when data changes
  useEffect(() => {
    if (atmData?.data) {
      realtimeActions.updateATMs(atmData.data);
    }
  }, [atmData?.data, realtimeActions]);

  // Fetch high-risk ATMs when show high-risk filter is enabled
  useEffect(() => {
    if (showHighRisk) {
      fetchHighRiskATMs();
    }
  }, [showHighRisk]);

  // Auto-refresh high-risk ATMs every 15 seconds when filter is active
  useEffect(() => {
    let interval: number | null = null;

    if (showHighRisk) {
      interval = window.setInterval(() => {
        fetchHighRiskATMs();
      }, 15000); // 15 seconds
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [showHighRisk]);

  const fetchHighRiskATMs = async () => {
    setHighRiskLoading(true);
    try {
      const response = await getHighRiskATMs(0.7, 50, true);
      setHighRiskATMs(response.high_risk_atms);
    } catch (error) {
      console.error("Error fetching high-risk ATMs:", error);
      toast.error("Failed to load high-risk ATMs");
    } finally {
      setHighRiskLoading(false);
    }
  };

  // Use real-time ATMs data instead of API data for rendering
  const displayATMs = useMemo(() => {
    const baseATMs = realtimeState.atms.length > 0 ? realtimeState.atms : atmData?.data || [];

    if (showHighRisk && highRiskATMs.length > 0) {
      const highRiskIds = new Set(highRiskATMs.map((hrAtm) => hrAtm.atm_id));
      return baseATMs.filter((atm) => highRiskIds.has(atm.atm_id));
    }
    return baseATMs;
  }, [realtimeState.atms, atmData?.data, showHighRisk, highRiskATMs]);

  // Create columns with real-time status updates
  const atmColumns = useMemo(() => {
    return [
      {
        accessorKey: "atm_id",
        header: "ATM ID",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "location_address",
        header: "Location",
      },
      {
        accessorKey: "region",
        header: "Region",
        cell: ({ row }) => <Badge variant="outline">{row.original.region}</Badge>,
      },
      {
        accessorKey: "model",
        header: "Model",
      },
      {
        accessorKey: "manufacturer",
        header: "Manufacturer",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isRecentlyUpdated = realtimeState.statusUpdates.has(row.original.atm_id);
          return <RealtimeStatusBadge atm={row.original} isRecentlyUpdated={isRecentlyUpdated} />;
        },
      },
      {
        accessorKey: "updated_at",
        header: "Last Update",
        cell: ({ row }) => {
          const isRecentlyUpdated = realtimeState.statusUpdates.has(row.original.atm_id);
          return <div className={isRecentlyUpdated ? "font-medium text-blue-600" : ""}>{datetime2str(row.original.updated_at)}</div>;
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => navigate(`/atm/${row.original.atm_id}`)}>
                  <Eye className="h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditATM(row.original.atm_id)}>
                  <Edit className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    confirm({
                      title: "Delete ATM",
                      description: `Are you sure you want to delete ATM ${row.original.atm_id}? This action cannot be undone.`,
                    }).then(() => {
                      deleteAtmByIdMutation.mutate(row.original.atm_id, {
                        onSuccess: () => {
                          toast.success("ATM deleted successfully");
                        },
                        onError: (error) => {
                          toast.error(`Failed to delete ATM: ${error.message}`);
                        },
                      });
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ];
  }, [navigate, confirm]); //eslint-disable-line

  // Update URL when filters change (skip on initial mount if defaults)
  useEffect(() => {
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
    setModalMode("add");
    setEditingATMId(null);
    setModalOpen(true);
  };

  const handleEditATM = (atmId: string) => {
    setModalMode("edit");
    setEditingATMId(atmId);
    setModalOpen(true);
  };

  return (
    <PageContainer>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>ATM Management</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Monitor and manage your ATMs in real-time. View status updates, add new ATMs, and filter by region or status.</span>
            {/* Real-time connection status */}
            <div className="flex items-center gap-2">
              {realtimeState.isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Live updates</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Offline</span>
                </>
              )}
            </div>
            {realtimeState.lastUpdate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatLastUpdate(realtimeState.lastUpdate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAddATM}>
            <Plus className="h-4 w-4" />
            Add ATM
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {/* Real-time status updates indicator */}
        {realtimeState.statusUpdates.size > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-center gap-2 py-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium text-blue-800">Live Status Updates</p>
                <p className="text-sm text-blue-700">
                  {realtimeState.statusUpdates.size} ATM{realtimeState.statusUpdates.size > 1 ? "s" : ""} recently updated
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={realtimeActions.clearStatusUpdates} className="ml-auto">
                Clear
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ATMs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 md:w-[300px]" />
          </div>
          <div className="flex gap-2">
            <Button variant={showHighRisk ? "default" : "outline"} size="sm" onClick={() => setShowHighRisk(!showHighRisk)} disabled={highRiskLoading}>
              {highRiskLoading ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  High Risk {showHighRisk && `(${highRiskATMs.length})`}
                </>
              )}
            </Button>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[200px]">
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regionEnum.options.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region.charAt(0).toUpperCase() + region.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ATMs Table */}
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error Loading ATMs</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent>Please try again later or contact support if the issue persists.</CardContent>
          </Card>
        ) : (
          <KPaginatedKDataTable
            columns={atmColumns}
            data={displayATMs}
            loading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            total={atmData?.total || 0}
          />
        )}

        {/* Connection status footer */}
        {!realtimeState.isConnected && !isLoading && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-2 py-3">
              <WifiOff className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Real-time Updates Disconnected</p>
                <p className="text-sm text-yellow-700">Status updates are not live. Data will refresh when the connection is restored.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-auto">
                Reconnect
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      {/* ATM Modal */}
      <ATMModal open={modalOpen} onOpenChange={setModalOpen} mode={modalMode} atmId={editingATMId} />
    </PageContainer>
  );
}

// Main component with provider wrapper
export default function PageAtms() {
  return (
    <RealtimeATMsProvider>
      <ATMsListContent />
    </RealtimeATMsProvider>
  );
}
