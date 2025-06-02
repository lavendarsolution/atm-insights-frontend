import { useAnalyticsData } from "@/features/analytics/hooks";
import { BarChart, LineChart, PieChart } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  BarChart as RechartsBarChart,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PageContainer from "@/components/layouts/PageContainer";

export default function PageAnalytics() {
  const { data: analyticsData, isLoading, error } = useAnalyticsData();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1>Analytics</h1>
            <span className="text-muted-foreground">Analyze and visualize your ATM network data with real-time insights</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading analytics data...</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1>Analytics</h1>
            <span className="text-muted-foreground">Analyze and visualize your ATM network data with real-time insights</span>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Analytics</CardTitle>
            <CardDescription>Failed to load analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please try again later or contact support if the issue persists.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!analyticsData) {
    return (
      <PageContainer>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1>Analytics</h1>
            <span className="text-muted-foreground">Analyze and visualize your ATM network data with real-time insights</span>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>No analytics data available at this time</CardDescription>
          </CardHeader>
        </Card>
      </PageContainer>
    );
  }

  const { overview, cash_levels, status_data, region_data, weekly_trends } = analyticsData;

  // Process region data for the chart
  const regionChartData =
    region_data?.map((region) => ({
      region: region.region,
      active: region.active,
      warning: region.warning,
      error: region.error,
      inactive: region.inactive,
    })) || [];

  return (
    <PageContainer>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>Analytics</h1>
          <span className="text-muted-foreground">Analyze and visualize your ATM network data with real-time insights</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-normal">Total ATMs</CardTitle>
              <div className="h-4 w-4 rounded-full bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.total_atms}</div>
              <p className="text-xs text-muted-foreground">Across {overview.regions_count} regions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-normal">Operational Rate</CardTitle>
              <div className="h-4 w-4 rounded-full bg-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.operational_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{overview.active_atms} active ATMs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-normal">Issue Rate</CardTitle>
              <div className="h-4 w-4 rounded-full bg-error" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.issue_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{overview.atms_with_issues} ATMs with issues</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ATM Status Overview</CardTitle>
            <CardDescription>Distribution of ATMs by status and cash level</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status">
              <TabsList className="mb-4">
                <TabsTrigger value="status" className="flex items-center gap-1">
                  <PieChart className="h-4 w-4" />
                  <span>Status</span>
                </TabsTrigger>
                <TabsTrigger value="cash" className="flex items-center gap-1">
                  <PieChart className="h-4 w-4" />
                  <span>Cash Level</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="status">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={status_data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {status_data?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="cash">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={cash_levels}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {cash_levels?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ATMs by Region</CardTitle>
            <CardDescription>Distribution and status of ATMs across regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={regionChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" stackId="a" name="Active" fill="#10B981" />
                  <Bar dataKey="warning" stackId="a" name="Warning" fill="#F59E0B" />
                  <Bar dataKey="error" stackId="a" name="Error" fill="#EF4444" />
                  <Bar dataKey="inactive" stackId="a" name="Inactive" fill="#6B7280" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
            <CardDescription>Transaction count and error rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={weekly_trends}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <RechartsLine yAxisId="left" type="monotone" dataKey="transactions" stroke="#3B82F6" name="Transactions" />
                  <RechartsLine yAxisId="right" type="monotone" dataKey="errors" stroke="#EF4444" name="Errors" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
