import HttpClient from "@/lib/HttpClient";
import { Alert, AlertCondition, AlertRule, AlertStats } from "@/lib/types";

export interface CreateAlertRuleRequest {
  rule_name: string;
  description?: string;
  condition_json: AlertCondition;
  severity: "critical" | "high" | "medium" | "low";
  is_active?: boolean;
  notification_channels?: string[];
  cooldown_minutes?: number;
  target_atms?: string[];
}

export interface UpdateAlertRuleRequest {
  rule_name?: string;
  description?: string;
  condition_json?: AlertCondition;
  severity?: "critical" | "high" | "medium" | "low";
  is_active?: boolean;
  notification_channels?: string[];
  cooldown_minutes?: number;
  target_atms?: string[];
}

export interface UpdateAlertRequest {
  status?: "active" | "acknowledged" | "resolved";
  resolution_notes?: string;
}

export interface TestAlertRuleRequest {
  condition_json: AlertCondition;
  atm_id: string;
  test_data?: Record<string, any>;
}

export interface TestAlertRuleResponse {
  would_trigger: boolean;
  evaluation_details: Record<string, any>;
  simulated_alert?: Record<string, any>;
}

export interface TestNotificationRequest {
  channels: string[];
  test_message?: string;
}

export interface TestNotificationResponse {
  results: Record<string, boolean>;
  details: Record<string, string>;
}

class AlertsApi {
  private httpClient = HttpClient;

  // Alert Rules
  async getAlertRules(params?: { skip?: number; limit?: number; is_active?: boolean }): Promise<AlertRule[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined) searchParams.set("skip", params.skip.toString());
    if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
    if (params?.is_active !== undefined) searchParams.set("is_active", params.is_active.toString());

    const queryString = searchParams.toString();
    const url = `/api/v1/alerts/rules${queryString ? `?${queryString}` : ""}`;

    return await this.httpClient.Get(url);
  }

  async getAlertRule(ruleId: string): Promise<AlertRule> {
    return await this.httpClient.Get(`/api/v1/alerts/rules/${ruleId}`);
  }

  async createAlertRule(data: CreateAlertRuleRequest): Promise<AlertRule> {
    return await this.httpClient.Post("/api/v1/alerts/rules", data);
  }

  async updateAlertRule(ruleId: string, data: UpdateAlertRuleRequest): Promise<AlertRule> {
    return await this.httpClient.Put(`/api/v1/alerts/rules/${ruleId}`, data);
  }

  async deleteAlertRule(ruleId: string): Promise<void> {
    return await this.httpClient.Delete(`/api/v1/alerts/rules/${ruleId}`);
  }

  async testAlertRule(data: TestAlertRuleRequest): Promise<TestAlertRuleResponse> {
    return await this.httpClient.Post("/api/v1/alerts/rules/test", data);
  }

  // Alerts
  async getAlerts(params?: { skip?: number; limit?: number; status?: string; severity?: string; atm_id?: string }): Promise<Alert[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined) searchParams.set("skip", params.skip.toString());
    if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.severity) searchParams.set("severity", params.severity);
    if (params?.atm_id) searchParams.set("atm_id", params.atm_id);

    const queryString = searchParams.toString();
    const url = `/api/v1/alerts${queryString ? `?${queryString}` : ""}`;

    const alerts = await this.httpClient.Get<Alert[]>(url);

    // Transform to ensure legacy compatibility
    return alerts.map((alert) => ({
      ...alert,
      id: alert.alert_id,
      rule: alert.title,
      atmId: alert.atm_id,
      timestamp: alert.triggered_at,
    }));
  }

  async getAlert(alertId: string): Promise<Alert> {
    const alert = await this.httpClient.Get<Alert>(`/api/v1/alerts/${alertId}`);

    // Transform to ensure legacy compatibility
    return {
      ...alert,
      id: alert.alert_id,
      rule: alert.title,
      atmId: alert.atm_id,
      timestamp: alert.triggered_at,
    };
  }

  async updateAlert(alertId: string, data: UpdateAlertRequest): Promise<Alert> {
    const alert = await this.httpClient.Put<Alert>(`/api/v1/alerts/${alertId}`, data);

    // Transform to ensure legacy compatibility
    return {
      ...alert,
      id: alert.alert_id,
      rule: alert.title,
      atmId: alert.atm_id,
      timestamp: alert.triggered_at,
    };
  }

  async getAlertStats(): Promise<AlertStats> {
    return await this.httpClient.Get("/api/v1/alerts/stats");
  }

  // Notifications
  async testNotifications(data: TestNotificationRequest): Promise<TestNotificationResponse> {
    return await this.httpClient.Post("/api/v1/alerts/notifications/test", data);
  }

  // Helper methods
  async acknowledgeAlert(alertId: string, notes?: string): Promise<Alert> {
    return this.updateAlert(alertId, {
      status: "acknowledged",
      resolution_notes: notes,
    });
  }

  async resolveAlert(alertId: string, notes?: string): Promise<Alert> {
    return this.updateAlert(alertId, {
      status: "resolved",
      resolution_notes: notes,
    });
  }
}

export const alertsApi = new AlertsApi();
