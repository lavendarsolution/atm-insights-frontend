import { useEffect, useState } from "react";

import { Activity, AlertTriangle, ArrowDownIcon, ArrowUpIcon, Ban, DollarSign, PiggyBank, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getDashboardSummary, mockATMs, mockAlerts } from "@/lib/mock-data";
import { ATM, ATMStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import PageContainer from "@/components/layouts/PageContainer";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [atms, setAtms] = useState<ATM[]>([]);
  const [filteredAtms, setFilteredAtms] = useState<ATM[]>([]);
  const [summary, setSummary] = useState(getDashboardSummary(mockATMs));

  // Initialize ATMs and apply filtering
  useEffect(() => {
    // Simulate loading from an API
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAtms(mockATMs);
      setSummary(getDashboardSummary(mockATMs));
    };

    loadData();
  }, []);

  // Apply filters when atms, searchTerm or statusFilter changes
  useEffect(() => {
    if (!atms.length) return;

    let filtered = [...atms];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (atm) =>
          atm.id.toLowerCase().includes(term) ||
          atm.location.toLowerCase().includes(term) ||
          atm.address.toLowerCase().includes(term) ||
          atm.model.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((atm) => atm.status === statusFilter);
    }

    setFilteredAtms(filtered);
  }, [atms, searchTerm, statusFilter]);

  const handleRowClick = (atmId: string) => {
    navigate(`/atm/${atmId}`);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your ATM network</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total ATMs" value={summary.totalATMs} icon={Activity} description="ATMs in your network" />
          <StatCard
            title="Active ATMs"
            value={summary.activeATMs}
            icon={Activity}
            type="success"
            description={`${((summary.activeATMs / summary.totalATMs) * 100).toFixed(1)}% of total`}
          />
          <StatCard
            title="ATMs with Issues"
            value={summary.errorATMs + summary.warningATMs}
            icon={AlertTriangle}
            type="warning"
            description={`${(((summary.warningATMs + summary.errorATMs) / summary.totalATMs) * 100).toFixed(1)}% need attention`}
          />
          <StatCard title="Low Cash ATMs" value={summary.lowCashATMs} icon={PiggyBank} type="error" description="ATMs with cash below 20%" />
        </div>

        {/* ATM List */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>ATM Status</CardTitle>
            <CardDescription>Live status of all ATMs in your network</CardDescription>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search ATMs..."
                  className="max-w-sm pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ATM ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cash Level</TableHead>
                    <TableHead className="text-right">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAtms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {atms.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Activity className="mb-2 h-8 w-8 animate-pulse" />
                            Loading ATM data...
                          </div>
                        ) : (
                          <span>No ATMs match your filters</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAtms.slice(0, 10).map((atm) => (
                      <TableRow key={atm.id} onClick={() => handleRowClick(atm.id)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{atm.id}</TableCell>
                        <TableCell>{atm.location}</TableCell>
                        <TableCell>{atm.model}</TableCell>
                        <TableCell>
                          <StatusBadge status={atm.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full ${atm.cashLevel < 20 ? "bg-error" : atm.cashLevel < 40 ? "bg-warning" : "bg-success"}`}
                                style={{ width: `${atm.cashLevel}%` }}
                              ></div>
                            </div>
                            <span>{atm.cashLevel}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{new Date(atm.lastUpdated).toLocaleTimeString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredAtms.length > 10 && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm">
                  Load More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest alerts from your ATM network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>ATM ID</TableHead>
                    <TableHead>Alert</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAlerts
                    .filter((alert) => alert.status === "active")
                    .slice(0, 5)
                    .map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{new Date(alert.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>{alert.atmId}</TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              alert.severity === "high"
                                ? "bg-error/20 text-error"
                                : alert.severity === "medium"
                                  ? "bg-warning/20 text-warning-foreground"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" className="text-xs" onClick={() => navigate("/alerts")}>
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
