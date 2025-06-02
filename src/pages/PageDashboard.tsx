import { useEffect, useState } from "react";

import { useRealtimeDashboard } from "@/providers/RealtimeDashboardProvider";
import { Activity, AlertTriangle, Clock, PiggyBank, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { StatCard } from "@/components/StatCard";
import PageContainer from "@/components/layouts/PageContainer";

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, actions } = useRealtimeDashboard();
  const { stats, alerts, isConnected, isLoading, lastUpdate, lastStatsUpdate } = state;

  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  // Show connection status temporarily when connection changes
  useEffect(() => {
    setShowConnectionStatus(true);
    const timer = setTimeout(() => setShowConnectionStatus(false), 3000);
    return () => clearTimeout(timer);
  }, [isConnected]);

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

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "error":
        return "destructive";
      case "medium":
        return "secondary";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  const recentAlerts = alerts.slice(0, 5);

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Header with connection and update status */}
        <div className="flex items-center justify-between">
          <div>
            <h1>Dashboard</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Monitor and manage your ATM network</span>
              {/* Connection Status */}
              {showConnectionStatus && (
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Status updates: Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Status updates: Disconnected</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Data freshness indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <div>
                <div>Stats: {formatLastUpdate(lastStatsUpdate)}</div>
                {lastUpdate && <div>Status: {formatLastUpdate(lastUpdate)}</div>}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={actions.refreshData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && !stats && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total ATMs" value={stats.total_atms} icon={Activity} description="ATMs in your network" />
            <StatCard
              title="Online ATMs"
              value={stats.online_atms}
              icon={Activity}
              type="success"
              description={`${stats.total_atms > 0 ? Math.round((stats.online_atms / stats.total_atms) * 100) : 0}% availability`}
            />
            <StatCard
              title="ATMs with Issues"
              value={stats.error_atms + stats.offline_atms}
              icon={AlertTriangle}
              type="warning"
              description={`${stats.error_atms} errors, ${stats.offline_atms} offline`}
            />
            <StatCard title="Critical Alerts" value={stats.critical_alerts} icon={AlertTriangle} type="error" description="Require immediate attention" />
          </div>
        )}

        {/* Additional Stats Row */}
        {stats && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_transactions_today.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all ATMs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Cash Level</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avg_cash_level}%</div>
                <p className="text-xs text-muted-foreground">Network average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{formatLastUpdate(lastStatsUpdate)}</div>
                <p className="text-xs text-muted-foreground">Auto-refresh every 15s</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Latest alerts from your ATM network
                {isConnected && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-600">Live status updates</span>
                  </span>
                )}
              </CardDescription>
            </div>
            {alerts.length > 0 && (
              <Button variant="outline" size="sm" onClick={actions.clearAllAlerts}>
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">{isLoading ? "Loading alerts..." : "No recent alerts"}</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>ATM ID</TableHead>
                      <TableHead>Alert</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-mono text-sm">{new Date(alert.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/atm/${alert.atm_id}`)}>
                            {alert.atm_id}
                          </Button>
                        </TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>
                          <Badge variant={getAlertSeverityColor(alert.severity)}>{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="xs" onClick={() => actions.markAlertAsRead(alert.id)}>
                            Dismiss
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {alerts.length > 5 && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" className="text-xs" onClick={() => navigate("/alerts")}>
                  View All {alerts.length} Alerts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Status Banner */}
        {!isConnected && !isLoading && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-2 py-4">
              <WifiOff className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Status Updates Disconnected</p>
                <p className="text-sm text-yellow-700">Real-time status updates are disabled. Stats still update every 15 seconds.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-auto">
                Reconnect
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Auto-refresh Indicator */}
        <div className="fixed bottom-4 right-4 z-10">
          <Card className="border-muted bg-background/80 backdrop-blur-sm">
            <CardContent className="flex items-center gap-2 px-3 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <span className="text-xs text-muted-foreground">Auto-refreshing every 15s</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
