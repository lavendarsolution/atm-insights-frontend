import { useEffect, useState } from "react";

import { HighRiskATM, getHighRiskATMs } from "@/apis/predictions";
import { useRealtimeDashboard } from "@/providers/RealtimeDashboardProvider";
import { Activity, AlertTriangle, Brain, Clock, PiggyBank, RefreshCw, Wifi, WifiOff } from "lucide-react";
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
  const [highRiskATMs, setHighRiskATMs] = useState<HighRiskATM[]>([]);
  const [highRiskLoading, setHighRiskLoading] = useState(false);

  // Show connection status temporarily when connection changes
  useEffect(() => {
    setShowConnectionStatus(true);
    const timer = setTimeout(() => setShowConnectionStatus(false), 3000);
    return () => clearTimeout(timer);
  }, [isConnected]);

  // Fetch high-risk ATMs on component mount
  useEffect(() => {
    fetchHighRiskATMs();
  }, []);

  // Auto-refresh high-risk ATMs every 15 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchHighRiskATMs();
    }, 15000); // 15 seconds

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const fetchHighRiskATMs = async () => {
    setHighRiskLoading(true);
    try {
      const response = await getHighRiskATMs(0.7, 10, true);
      setHighRiskATMs(response.high_risk_atms);
    } catch (error) {
      console.error("Error fetching high-risk ATMs:", error);
      // Silently fail for dashboard - we don't want to show errors here
    } finally {
      setHighRiskLoading(false);
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

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "error":
        return "critical";
      case "medium":
        return "medium";
      case "warning":
        return "warning";
      case "low":
        return "low";
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
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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

            {/* High-Risk ATMs Card */}
            <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => navigate("/atms")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High-Risk ATMs</CardTitle>
                <Brain className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {highRiskLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-600">{highRiskATMs.length}</div>
                    <p className="text-xs text-muted-foreground">{highRiskATMs.length > 0 ? "Require attention" : "All ATMs healthy"}</p>
                  </>
                )}
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
                        <TableCell className="text-sm">{new Date(alert.timestamp).toLocaleTimeString()}</TableCell>
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

        {/* High-Risk ATMs Section */}
        {highRiskATMs.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-500" />
                  High-Risk ATMs
                </CardTitle>
                <CardDescription>ATMs predicted to have a higher probability of failure based on machine learning analysis</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/atms")}>
                View All ATMs
              </Button>
            </CardHeader>
            <CardContent>
              {highRiskLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading high-risk predictions...</span>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ATM ID</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Failure Probability</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Primary Risk Factor</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highRiskATMs.slice(0, 5).map((atm) => {
                        const getRiskLevelColor = (riskLevel: string) => {
                          switch (riskLevel.toLowerCase()) {
                            case "critical":
                              return "destructive";
                            case "high":
                              return "high";
                            case "medium":
                              return "warning";
                            case "low":
                              return "secondary";
                            default:
                              return "outline";
                          }
                        };

                        const formatProbability = (prob: number) => `${(prob * 100).toFixed(1)}%`;

                        const getPrimaryRiskFactor = (factors: Array<{ feature: string; importance: number; value?: string | number }>) => {
                          if (factors && factors.length > 0) {
                            const topFactor = factors[0]; // Already sorted by importance in backend
                            return `${topFactor.feature.replace("_", " ")} (${topFactor.importance.toFixed(2)})`;
                          }
                          return "Unknown";
                        };

                        return (
                          <TableRow key={atm.atm_id}>
                            <TableCell>
                              <Button variant="link" className="h-auto p-0 font-mono" onClick={() => navigate(`/atm/${atm.atm_id}`)}>
                                {atm.atm_id}
                              </Button>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{atm.location || "Unknown Location"}</TableCell>
                            <TableCell>
                              <Badge variant={getRiskLevelColor(atm.risk_level)}>{atm.risk_level.charAt(0).toUpperCase() + atm.risk_level.slice(1)}</Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              <span className="font-semibold text-orange-600">{formatProbability(atm.failure_probability)}</span>
                            </TableCell>
                            <TableCell className="font-mono">{(atm.confidence * 100).toFixed(0)}%</TableCell>
                            <TableCell className="text-sm">{getPrimaryRiskFactor(atm.top_risk_factors)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => navigate(`/atm/${atm.atm_id}`)}>
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {highRiskATMs.length > 5 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" className="text-xs" onClick={() => navigate("/atms")}>
                    View All {highRiskATMs.length} High-Risk ATMs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
