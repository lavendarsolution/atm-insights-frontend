import { useCallback, useEffect, useState } from "react";

import { alertsApi } from "@/apis/alerts";
import { WebSocketMessage, useAlertsWebSocket } from "@/hooks/useWebSocket";
import { AlertTriangle, Bell, CheckCircle, ChevronLeft, ChevronRight, Clock, Search, Settings, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertStats } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PageContainer from "@/components/layouts/PageContainer";
import AlertRulesModal from "@/components/modals/AlertRulesModal";

export default function Alerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [alertRulesModalOpen, setAlertRulesModalOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadAlerts = useCallback(
    async (page: number = 1, size: number = 25) => {
      try {
        setLoading(true);
        const skip = (page - 1) * size;
        const params = {
          skip,
          limit: size,
          ...(selectedStatus !== "all" && { status: selectedStatus }),
        };
        const alertsData = await alertsApi.getAlerts(params);
        setAlerts(alertsData);

        // Check if there are more results by requesting one extra item
        const checkParams = { ...params, limit: size + 1 };
        const checkData = await alertsApi.getAlerts(checkParams);
        setHasMore(checkData.length > size);

        // Update total count estimation
        if (page === 1) {
          setTotalAlerts(checkData.length > size ? size + 1 : alertsData.length);
        }
      } catch (error) {
        console.error("Failed to load alerts:", error);
        toast.error("Failed to load alerts");
      } finally {
        setLoading(false);
      }
    },
    [selectedStatus]
  );

  const loadAlertStats = useCallback(async () => {
    try {
      const stats = await alertsApi.getAlertStats();
      setAlertStats(stats);
    } catch (error) {
      console.error("Failed to load alert stats:", error);
      toast.error("Failed to load alert statistics");
    }
  }, []);

  // Load data on mount and when status filter changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
    loadAlerts(1, pageSize);
    loadAlertStats();
  }, [loadAlerts, loadAlertStats, selectedStatus, pageSize]);

  // Load data when page changes
  useEffect(() => {
    if (currentPage > 1) {
      loadAlerts(currentPage, pageSize);
    }
  }, [currentPage, loadAlerts, pageSize]);

  // Handle WebSocket messages for real-time updates
  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log("Alerts WebSocket message received:", message);

      switch (message.type) {
        case "alerts_initial":
          console.log("Alerts WebSocket connection established");
          setLastUpdate(new Date().toISOString());
          break;

        case "new_alert":
          if (message.data) {
            // Refresh current page to show updated data
            loadAlerts(currentPage, pageSize);

            // Refresh stats - call the API directly to avoid dependency issues
            alertsApi.getAlertStats().then(setAlertStats).catch(console.error);

            const newAlert = message.data as Alert;
            // Show notification for new alerts
            if (newAlert.severity === "critical" || newAlert.severity === "high") {
              toast.error(`New ${newAlert.severity} alert: ${newAlert.title}`, {
                description: `ATM ${newAlert.atm_id}: ${newAlert.message}`,
                duration: 5000,
              });
            } else {
              toast.warning(`New alert: ${newAlert.title}`, {
                description: `ATM ${newAlert.atm_id}`,
                duration: 3000,
              });
            }
          }
          break;

        case "alert_updated":
          if (message.data) {
            // Refresh current page to show updated data
            loadAlerts(currentPage, pageSize);
            alertsApi.getAlertStats().then(setAlertStats).catch(console.error);
          }
          break;

        case "alert_resolved":
          if (message.data) {
            // Refresh current page to show updated data
            loadAlerts(currentPage, pageSize);
            alertsApi.getAlertStats().then(setAlertStats).catch(console.error);

            const resolvedAlert = message.data as Alert;
            toast.success(`Alert resolved: ${resolvedAlert.title}`, {
              description: `ATM ${resolvedAlert.atm_id}`,
              duration: 2000,
            });
          }
          break;

        default:
          console.log("Unhandled alerts message type:", message.type);
      }

      setLastUpdate(new Date().toISOString());
    },
    [currentPage, pageSize, loadAlerts]
  );

  // Setup WebSocket connection
  const { isConnected } = useAlertsWebSocket(handleWebSocketMessage);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await alertsApi.acknowledgeAlert(alertId);
      await loadAlerts(currentPage, pageSize);
      await loadAlertStats();
      toast.success("Alert acknowledged");
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
      toast.error("Failed to acknowledge alert");
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await alertsApi.resolveAlert(alertId);
      await loadAlerts(currentPage, pageSize);
      await loadAlertStats();
      toast.success("Alert resolved");
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      toast.error("Failed to resolve alert");
    }
  };

  const formatLastUpdate = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 30) {
      return "Just now";
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  // Filter alerts based on search term
  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.atm_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
    } as const;

    return <Badge variant={variants[severity as keyof typeof variants] || "default"}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "destructive",
      acknowledged: "default",
      resolved: "secondary",
    } as const;

    const icons = {
      active: AlertTriangle,
      acknowledged: Clock,
      resolved: CheckCircle,
    };

    const Icon = icons[status as keyof typeof icons] || AlertTriangle;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Header with connection status */}
        <div className="flex items-center justify-between">
          <div>
            <h1>Alerts</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Monitor and manage alerts from your ATM network</span>
              {/* Connection Status */}
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Live updates: Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Live updates: Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Data freshness indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <div>
                <div>Last update: {formatLastUpdate(lastUpdate)}</div>
              </div>
            </div>

            {/* Alert Rules Button */}
            <Button variant="outline" onClick={() => setAlertRulesModalOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Alert Rules
            </Button>
          </div>
        </div>

        {/* Connection Status Banner */}
        {!isConnected && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-2 py-4">
              <WifiOff className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Real-time Updates Disconnected</p>
                <p className="text-sm text-yellow-700">Live alert notifications are disabled. Data still refreshes when you take actions.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-auto">
                Reconnect
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Alert Statistics */}
        {alertStats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alertStats.total_alerts}</div>
                <p className="text-xs text-muted-foreground">
                  {isConnected && (
                    <span className="inline-flex items-center gap-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      Live updates
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{alertStats.active_alerts}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{alertStats.critical_alerts}</div>
                <p className="text-xs text-muted-foreground">Immediate action needed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{alertStats.resolved_alerts}</div>
                <p className="text-xs text-muted-foreground">Successfully handled</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>
                  Search and manage alerts in your ATM network
                  {isConnected && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-600">Real-time updates active</span>
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search alerts..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading alerts...</div>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>ATM ID</TableHead>
                        <TableHead>Alert</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAlerts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                            {loading ? "Loading alerts..." : selectedStatus === "all" ? "No alerts found" : `No ${selectedStatus} alerts found`}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAlerts.map((alert) => (
                          <TableRow key={alert.alert_id} className="group hover:bg-muted/50">
                            <TableCell className="font-mono text-sm">{formatTimestamp(alert.triggered_at)}</TableCell>
                            <TableCell className="font-medium">{alert.atm_id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{alert.title}</div>
                                <div className="text-sm text-muted-foreground">{alert.message}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                            <TableCell>{getStatusBadge(alert.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {alert.status === "active" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAcknowledgeAlert(alert.alert_id)}
                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    Acknowledge
                                  </Button>
                                )}
                                {(alert.status === "active" || alert.status === "acknowledged") && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleResolveAlert(alert.alert_id)}
                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        const newPageSize = parseInt(value);
                        setPageSize(newPageSize);
                        setCurrentPage(1);
                        loadAlerts(1, newPageSize);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} {hasMore && "of many"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentPage(currentPage - 1);
                        }}
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentPage(currentPage + 1);
                        }}
                        disabled={!hasMore || loading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert Rules Modal */}
      <AlertRulesModal open={alertRulesModalOpen} onOpenChange={setAlertRulesModalOpen} />
    </PageContainer>
  );
}
