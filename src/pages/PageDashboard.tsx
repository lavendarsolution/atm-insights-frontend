import { useState } from "react";

import { Activity, AlertTriangle, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getDashboardSummary, mockATMs, mockAlerts } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { StatCard } from "@/components/StatCard";
import PageContainer from "@/components/layouts/PageContainer";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(getDashboardSummary(mockATMs));

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
