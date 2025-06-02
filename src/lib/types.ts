// Alert-related types
export interface Alert {
  alert_id: string;
  rule_id: string;
  atm_id: string;
  atmId: string; // Legacy compatibility - same as atm_id
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  status: "active" | "acknowledged" | "resolved";
  triggered_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  trigger_data?: Record<string, any>;
  resolution_notes?: string;

  // Legacy fields for backward compatibility
  id: string; // maps to alert_id
  rule: string; // maps to title
  timestamp: string; // maps to triggered_at
}

export interface AlertRule {
  rule_id: string;
  rule_name: string;
  description?: string;
  condition_json: AlertCondition;
  severity: "critical" | "high" | "medium" | "low";
  is_active: boolean;
  notification_channels?: string[];
  cooldown_minutes: number;
  target_atms?: string[];
  created_by?: string;
  last_triggered?: string;
  trigger_count: number;
}

export interface AlertCondition {
  metric: string;
  operator: "gt" | "lt" | "eq" | "ne" | "gte" | "lte";
  threshold: number;
  duration_minutes?: number;
}

export interface AlertStats {
  total_alerts: number;
  active_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
}

export interface NotificationChannel {
  type: "email" | "telegram";
  enabled: boolean;
  config?: Record<string, any>;
}
