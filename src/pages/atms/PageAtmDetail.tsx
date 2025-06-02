import { useEffect, useState } from "react";

import { useAtmById } from "@/features/atms/hooks";
import { ATM } from "@/features/atms/schema";
import { RealtimeATMProvider, useRealtimeATM } from "@/providers/RealtimeATMProvider";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Cpu,
  DollarSign,
  HardDrive,
  Minus,
  RefreshCcw,
  Settings,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StatusBadge } from "@/components/StatusBadge";
import PageContainer from "@/components/layouts/PageContainer";

// Component that uses the real-time data
function AtmDetailContent({ atmId }) {
  const navigate = useNavigate();
  const { state, actions } = useRealtimeATM();
  const { latestTelemetry, telemetryHistory, isConnected, isLoading, lastUpdate, connectionError } = state;

  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: atm } = useAtmById(atmId);

  // Update chart data when telemetry history changes
  useEffect(() => {
    if (telemetryHistory.length > 0) {
      // Convert real-time telemetry to chart format
      const chartDataFromTelemetry = telemetryHistory
        .slice(0, 24) // Last 24 data points
        .reverse() // Show chronologically
        .map((telemetry, index) => ({
          time: new Date(telemetry.time).toLocaleTimeString(),
          cashLevel: telemetry.cash_level_percent || 0,
          temperature: telemetry.temperature_celsius || 0,
          cpuUsage: telemetry.cpu_usage_percent || 0,
          memoryUsage: telemetry.memory_usage_percent || 0,
          networkLatency: telemetry.network_latency_ms || 0,
        }));
      setChartData(chartDataFromTelemetry);
    }
  }, [telemetryHistory]);

  const formatLastUpdate = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 10) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "maintenance":
        return "text-yellow-600";
      case "offline":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "unstable":
        return "text-yellow-600";
      case "disconnected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthScore = () => {
    if (!latestTelemetry) return 0;

    let score = 100;

    // Deduct for errors
    if (latestTelemetry.error_code) score -= 30;
    if (latestTelemetry.status !== "online") score -= 20;

    // Deduct for performance issues
    if (latestTelemetry.cpu_usage_percent && latestTelemetry.cpu_usage_percent > 80) score -= 15;
    if (latestTelemetry.memory_usage_percent && latestTelemetry.memory_usage_percent > 85) score -= 15;
    if (latestTelemetry.temperature_celsius && latestTelemetry.temperature_celsius > 38) score -= 10;
    if (latestTelemetry.cash_level_percent && latestTelemetry.cash_level_percent < 12) score -= 10;

    // Deduct for network issues
    if (latestTelemetry.network_status === "disconnected") score -= 25;
    if (latestTelemetry.network_status === "unstable") score -= 10;

    return Math.max(0, score);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (!atm) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">ATM not found</h2>
        <p className="mb-4 text-muted-foreground">The requested ATM could not be found.</p>
        <Button onClick={() => navigate("/atms")}>Return to ATM List</Button>
      </div>
    );
  }

  const healthScore = getHealthScore();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/atms")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1>{atm.atm_id}</h1>
            {/* Real-time connection indicator */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <div className="flex items-center gap-1">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Live</span>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Disconnected</span>
                </>
              )}
            </div>
            {/* Health Score */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Health:</span>
              <span className={`text-sm font-bold ${getHealthScoreColor(healthScore)}`}>{healthScore}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {atm.name} • {atm.model} • Last update: {formatLastUpdate(lastUpdate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={actions.requestHistoryRefresh} disabled={!isConnected}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 py-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Connection Error</p>
              <p className="text-sm text-red-700">{connectionError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-2 grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="telemetry">Live Telemetry</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {/* ATM Information Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>ATM Information</CardTitle>
                <CardDescription>Basic information and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">ATM ID</div>
                  <div className="font-base">{atm.atm_id}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div>{atm.name}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Location</div>
                  <div>{atm.location_address}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Region</div>
                  <Badge variant="outline">{atm.region}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Model</div>
                  <div>{atm.model}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Manufacturer</div>
                  <div>{atm.manufacturer}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <StatusBadge status={atm.status} />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Health Score</div>
                  <div className="flex items-center gap-2">
                    <Progress value={healthScore} className="flex-1" />
                    <span className={`text-sm font-bold ${getHealthScoreColor(healthScore)}`}>{healthScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  Current Status
                  {isConnected && (
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      Live
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Latest telemetry data from the ATM</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && !latestTelemetry ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCcw className="mr-2 h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Loading telemetry data...</span>
                  </div>
                ) : latestTelemetry ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Operational Status */}
                    <div className="space-y-2 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Operational Status</span>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className={`text-lg font-bold capitalize ${getStatusColor(latestTelemetry.status)}`}>{latestTelemetry.status}</div>
                      <div className="text-xs text-muted-foreground">{new Date(latestTelemetry.time).toLocaleString()}</div>
                    </div>

                    {/* Cash Level */}
                    <div className="space-y-2 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Cash Level</span>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-lg font-bold">{latestTelemetry.cash_level_percent || 0}%</div>
                      <Progress value={latestTelemetry.cash_level_percent || 0} className="h-2" />
                      {latestTelemetry.cash_level_percent && latestTelemetry.cash_level_percent < 12 && (
                        <Badge variant="destructive" className="text-xs">
                          Low Cash
                        </Badge>
                      )}
                    </div>

                    {/* Temperature */}
                    <div className="space-y-2 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Temperature</span>
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-lg font-bold">{latestTelemetry.temperature_celsius || 0}°C</div>
                      {latestTelemetry.temperature_celsius && latestTelemetry.temperature_celsius > 38 && (
                        <Badge variant="destructive" className="text-xs">
                          High Temperature
                        </Badge>
                      )}
                    </div>

                    {/* CPU Usage */}
                    <div className="space-y-2 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">CPU Usage</span>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-lg font-bold">{latestTelemetry.cpu_usage_percent || 0}%</div>
                      <Progress value={latestTelemetry.cpu_usage_percent || 0} className="h-2" />
                      {latestTelemetry.cpu_usage_percent && latestTelemetry.cpu_usage_percent > 85 && (
                        <Badge variant="secondary" className="text-xs">
                          High Usage
                        </Badge>
                      )}
                    </div>

                    {/* Memory Usage */}
                    <div className="space-y-2 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Memory Usage</span>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-lg font-bold">{latestTelemetry.memory_usage_percent || 0}%</div>
                      <Progress value={latestTelemetry.memory_usage_percent || 0} className="h-2" />
                    </div>

                    {/* Network Status */}
                    <div className="space-y-2 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Network</span>
                        <Wifi className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className={`text-lg font-bold capitalize ${getNetworkStatusColor(latestTelemetry.network_status || "unknown")}`}>
                        {latestTelemetry.network_status || "unknown"}
                      </div>
                      {latestTelemetry.network_latency_ms && <div className="text-sm text-muted-foreground">{latestTelemetry.network_latency_ms}ms</div>}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">No telemetry data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error Information */}
          {latestTelemetry?.error_code && (
            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <CardTitle className="text-lg">Error Information</CardTitle>
                  <CardDescription>Current system errors and alerts</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Error Code:</span>
                    <Badge variant="destructive">{latestTelemetry.error_code}</Badge>
                  </div>

                  {latestTelemetry.error_message && (
                    <div className="flex items-center justify-between">
                      <span>Error Message:</span>
                      <span className="font-medium">{latestTelemetry.error_message}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Schedule Maintenance
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Live Telemetry Tab */}
        <TabsContent value="telemetry" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                Live Telemetry Data
                <Badge variant="outline">{telemetryHistory.length} records</Badge>
              </CardTitle>
              <CardDescription>
                Real-time telemetry data stream (last 100 records)
                {isConnected && <span className="ml-2 text-green-600">• Live updates enabled</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cash Level</TableHead>
                      <TableHead>Temperature</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>Memory</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {telemetryHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          {isLoading ? "Loading telemetry data..." : "No telemetry data available"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      telemetryHistory.slice(0, 50).map((telemetry, index) => (
                        <TableRow key={`${telemetry.time}-${index}`} className={index === 0 ? "bg-green-50" : ""}>
                          <TableCell className="font-mono text-sm">
                            {new Date(telemetry.time).toLocaleString()}
                            {index === 0 && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Latest
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                telemetry.status === "online"
                                  ? "default"
                                  : telemetry.status === "error"
                                    ? "destructive"
                                    : telemetry.status === "maintenance"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="text-xs"
                            >
                              {telemetry.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{telemetry.cash_level_percent || 0}%</span>
                              {telemetry.cash_level_percent && telemetry.cash_level_percent < 12 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{telemetry.temperature_celsius || 0}°C</span>
                              {telemetry.temperature_celsius && telemetry.temperature_celsius > 38 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                            </div>
                          </TableCell>
                          <TableCell>{telemetry.cpu_usage_percent || 0}%</TableCell>
                          <TableCell>{telemetry.memory_usage_percent || 0}%</TableCell>
                          <TableCell>
                            <span className={`text-xs ${getNetworkStatusColor(telemetry.network_status || "unknown")}`}>
                              {telemetry.network_status || "unknown"}
                            </span>
                            {telemetry.network_latency_ms && <div className="text-xs text-muted-foreground">{telemetry.network_latency_ms}ms</div>}
                          </TableCell>
                          <TableCell>
                            {telemetry.error_code && (
                              <Badge variant="destructive" className="text-xs">
                                {telemetry.error_code}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {telemetryHistory.length > 50 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing 50 of {telemetryHistory.length} records •
                    <Button variant="link" className="ml-1 h-auto p-0 text-sm" onClick={actions.clearHistory}>
                      Clear history
                    </Button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-3">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Real-time metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cash" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="cash">Cash Level</TabsTrigger>
                    <TabsTrigger value="temperature">Temperature</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                  </TabsList>

                  <TabsContent value="cash" className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cashLevel" stroke="#3B82F6" strokeWidth={2} name="Cash Level (%)" activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  <TabsContent value="temperature" className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 50]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} name="Temperature (°C)" activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  <TabsContent value="performance" className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cpuUsage" stroke="#10B981" strokeWidth={2} name="CPU Usage (%)" activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="memoryUsage" stroke="#F59E0B" strokeWidth={2} name="Memory Usage (%)" activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  <TabsContent value="network" className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="networkLatency" stroke="#8B5CF6" strokeWidth={2} name="Network Latency (ms)" activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-3">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Status</CardTitle>
                <CardDescription>Current maintenance information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Last Maintenance:</span>
                  <span className="font-medium">15 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Scheduled:</span>
                  <span className="font-medium">In 15 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">
                    {latestTelemetry?.uptime_seconds ? `${Math.floor(latestTelemetry.uptime_seconds / 3600)} hours` : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Maintenance Required:</span>
                  <Badge variant={healthScore < 70 ? "destructive" : "outline"}>{healthScore < 70 ? "Yes" : "No"}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Schedule Maintenance
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Overall system health assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Overall Health Score</span>
                    <span className={`font-bold ${getHealthScoreColor(healthScore)}`}>{healthScore}%</span>
                  </div>
                  <Progress value={healthScore} className="h-3" />
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Operational Status</span>
                    <Badge variant={latestTelemetry?.status === "online" ? "active" : "critical"}>
                      {latestTelemetry?.status === "online" ? "Good" : "Issues"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance</span>
                    <Badge variant={latestTelemetry?.cpu_usage_percent && latestTelemetry.cpu_usage_percent > 85 ? "critical" : "active"}>
                      {latestTelemetry?.cpu_usage_percent && latestTelemetry.cpu_usage_percent > 85 ? "Poor" : "Good"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cash Level</span>
                    <Badge variant={latestTelemetry?.cash_level_percent && latestTelemetry.cash_level_percent < 12 ? "warning" : "active"}>
                      {latestTelemetry?.cash_level_percent && latestTelemetry.cash_level_percent < 12 ? "Low" : "Normal"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network</span>
                    <Badge
                      variant={
                        latestTelemetry?.network_status === "disconnected" ? "critical" : latestTelemetry?.network_status === "unstable" ? "warning" : "active"
                      }
                    >
                      {latestTelemetry?.network_status === "connected" ? "Good" : latestTelemetry?.network_status === "unstable" ? "Unstable" : "Poor"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Recent maintenance activities and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="font-medium">Routine Maintenance Completed</p>
                    <p className="text-sm text-muted-foreground">15 days ago • All systems checked</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <p className="font-medium">Cash Refill Required</p>
                    <p className="text-sm text-muted-foreground">2 days ago • Cash level below threshold</p>
                  </div>
                </div>

                {latestTelemetry?.error_code && (
                  <div className="flex items-center gap-4 rounded-lg border border-red-200 p-4">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">System Error Detected</p>
                      <p className="text-sm text-muted-foreground">Now • {latestTelemetry.error_message || latestTelemetry.error_code}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Floating Connection Status (when disconnected) */}
      {!isConnected && !isLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="border-yellow-200 bg-yellow-50 shadow-lg">
            <CardContent className="flex items-center gap-2 px-4 py-3">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Connection Lost</p>
                <p className="text-xs text-yellow-700">Real-time updates disabled</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-2">
                Reconnect
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Main component with provider wrapper
export default function PageAtmDetail() {
  const { atmId } = useParams<{ atmId: string }>();

  if (!atmId) {
    return (
      <PageContainer>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold">Invalid ATM ID</h2>
          <p className="mb-4 text-muted-foreground">No ATM ID provided.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <RealtimeATMProvider atmId={atmId}>
      <PageContainer>
        <AtmDetailContent atmId={atmId} />
      </PageContainer>
    </RealtimeATMProvider>
  );
}
