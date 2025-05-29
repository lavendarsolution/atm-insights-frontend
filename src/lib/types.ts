export interface Alert {
  id: string;
  rule: string;
  atm_id: string;
  atmId: string; // Legacy compatibility - same as atm_id
  timestamp: string;
  severity: "low" | "medium" | "high";
  message: string;
  status: "active" | "acknowledged" | "resolved";
}
