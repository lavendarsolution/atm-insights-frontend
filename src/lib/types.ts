
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician';
}

export type ATMStatus = 'active' | 'warning' | 'error' | 'inactive';

export interface ATM {
  atm_id: string;
  name: string;
  location_address: string;
  model: string;
  manufacturer: string;
  status: ATMStatus;
  created_at: string;
  updated_at: string;
  
  // Legacy compatibility fields
  id: string; // Same as atm_id
  location: string; // Extracted from location_address
  address: string; // Same as location_address
  lastUpdated: string; // Same as updated_at
  
  // Last telemetry data for quick access
  lastTelemetry?: ATMTelemetry;
  
  // Legacy fields from last telemetry for compatibility
  cashLevel: number;
  temperature: number;
  errorCodes: string[];
}

export interface ATMTelemetry {
  time: string;
  atm_id: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  uptime_seconds?: number;
  cash_level_percent?: number;
  temperature_celsius?: number;
  cpu_usage_percent?: number;
  memory_usage_percent?: number;
  disk_usage_percent?: number;
  network_status?: 'connected' | 'disconnected' | 'unstable';
  network_latency_ms?: number;
  error_code?: string;
  error_message?: string;
}

export interface Alert {
  id: string;
  rule: string;
  atm_id: string;
  atmId: string; // Legacy compatibility - same as atm_id
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
}
