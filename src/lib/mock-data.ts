
import { ATM, ATMTelemetry, Alert } from "./types";

// Helper function to generate a random date within the last 24 hours
const randomRecentDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440)); // Random minutes ago within 24h
  return date.toISOString();
};

// Helper to generate a random integer between min and max
const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ATM locations
const locations = [
  { city: "New York", address: "123 Broadway, New York, NY 10001" },
  { city: "Los Angeles", address: "456 Hollywood Blvd, Los Angeles, CA 90028" },
  { city: "Chicago", address: "789 Michigan Ave, Chicago, IL 60611" },
  { city: "Houston", address: "101 Texas St, Houston, TX 77002" },
  { city: "Phoenix", address: "202 Desert Rd, Phoenix, AZ 85001" },
  { city: "Philadelphia", address: "303 Liberty Way, Philadelphia, PA 19106" },
  { city: "San Antonio", address: "404 Alamo Dr, San Antonio, TX 78205" },
  { city: "San Diego", address: "505 Ocean Ave, San Diego, CA 92101" },
  { city: "Dallas", address: "606 Cowboy St, Dallas, TX 75201" },
  { city: "San Jose", address: "707 Silicon Valley Blvd, San Jose, CA 95110" }
];

// ATM models
const models = ["NCR SelfServ 80", "Diebold 429", "Hyosung 7800", "Triton ARGO", "GRGBanking H68N"];

// Error codes
const errorCodes = ["E001", "E002", "E003", "E004", "E005", "E006", "E007", "E008", "E009", "E010"];

// Generate telemetry data for an ATM
const generateTelemetryForATM = (atmId: string, count: number = 10): ATMTelemetry[] => {
  const telemetries: ATMTelemetry[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const time = new Date(now);
    time.setMinutes(time.getMinutes() - (i * 30)); // Every 30 minutes
    
    const telemetryStatus = Math.random() > 0.8 ? 'error' : Math.random() > 0.9 ? 'maintenance' : 'online';
    
    telemetries.push({
      time: time.toISOString(),
      atm_id: atmId,
      status: telemetryStatus,
      uptime_seconds: telemetryStatus === 'online' ? randomInt(3600, 86400) : 0,
      cash_level_percent: randomInt(0, 100),
      temperature_celsius: randomInt(20, 45),
      cpu_usage_percent: randomInt(10, 90),
      memory_usage_percent: randomInt(20, 80),
      disk_usage_percent: randomInt(30, 70),
      network_status: Math.random() > 0.1 ? 'connected' : 'unstable',
      network_latency_ms: randomInt(10, 200),
      error_code: telemetryStatus === 'error' ? errorCodes[Math.floor(Math.random() * errorCodes.length)] : undefined,
      error_message: telemetryStatus === 'error' ? 'System error detected' : undefined
    });
  }
  
  return telemetries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

// Generate mock ATMs
export const generateMockATMs = (count: number): ATM[] => {
  const atms: ATM[] = [];
  
  for (let i = 1; i <= count; i++) {
    const location = locations[i % locations.length];
    const atmId = `ATM-${i.toString().padStart(4, '0')}`;
    const lastUpdated = randomRecentDate();
    
    // Generate telemetry data for this ATM
    const telemetries = generateTelemetryForATM(atmId, 10);
    const lastTelemetry = telemetries[0]; // Most recent
    
    // Determine ATM status based on telemetry
    let status: 'active' | 'warning' | 'error' | 'inactive' = 'active';
    if (lastTelemetry.status === 'error') {
      status = 'error';
    } else if (lastTelemetry.status === 'maintenance' || (lastTelemetry.cash_level_percent && lastTelemetry.cash_level_percent < 20)) {
      status = 'warning';
    } else if (lastTelemetry.status === 'offline') {
      status = 'inactive';
    }
    
    atms.push({
      atm_id: atmId,
      id: atmId, // Legacy compatibility
      name: `${location.city} Branch ATM`,
      location_address: location.address,
      location: location.city, // Legacy compatibility
      address: location.address, // Legacy compatibility
      model: models[i % models.length],
      manufacturer: models[i % models.length].split(' ')[0],
      status: status,
      created_at: randomRecentDate(),
      updated_at: lastUpdated,
      lastUpdated: lastUpdated, // Legacy compatibility
      lastTelemetry: lastTelemetry,
      
      // Legacy fields for compatibility
      cashLevel: lastTelemetry.cash_level_percent || 0,
      temperature: lastTelemetry.temperature_celsius || 0,
      errorCodes: lastTelemetry.error_code ? [lastTelemetry.error_code] : []
    });
  }
  
  return atms;
};

// Store telemetry data for each ATM
const atmTelemetryMap = new Map<string, ATMTelemetry[]>();

// Generate and store telemetry data for all ATMs
export const generateATMTelemetryData = (atms: ATM[]) => {
  atms.forEach(atm => {
    const telemetries = generateTelemetryForATM(atm.atm_id, 10);
    atmTelemetryMap.set(atm.atm_id, telemetries);
  });
};

// Get telemetry data for a specific ATM
export const getATMTelemetry = (atmId: string): ATMTelemetry[] => {
  return atmTelemetryMap.get(atmId) || [];
};

// Generate mock ATM telemetry data for charts (legacy function)
export const generateATMTelemetry = (atm: ATM, days: number = 7) => {
  const now = new Date();
  const data = [];
  
  // Generate data points for each day
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Cash level trend - gradually decreasing
    const baseCashLevel = (atm.lastTelemetry?.cash_level_percent || atm.cashLevel) + i * 10;
    const actualCashLevel = Math.min(100, Math.max(0, baseCashLevel));
    
    // Temperature fluctuation
    const baseTemp = atm.status === 'inactive' ? 0 : 25;
    const tempVariation = atm.status === 'error' ? 10 : 5;
    const actualTemp = baseTemp + (Math.random() * tempVariation - tempVariation/2);
    
    // Transaction count - random daily variation
    const transactionCount = atm.status === 'inactive' ? 0 : Math.floor(Math.random() * 100) + 50;
    
    data.push({
      date: date.toISOString().split('T')[0],
      cashLevel: actualCashLevel,
      temperature: actualTemp.toFixed(1),
      transactions: transactionCount
    });
  }
  
  return data;
};

// Generate mock alerts
export const generateMockAlerts = (atms: ATM[], count: number): Alert[] => {
  const alerts: Alert[] = [];
  const severities: ["low", "medium", "high"] = ["low", "medium", "high"];
  const statuses: ["active", "acknowledged", "resolved"] = ["active", "acknowledged", "resolved"];
  
  const ruleTemplates = [
    "Cash level below 20%",
    "Temperature above 35°C",
    "Offline for more than 30 minutes",
    "Error code detected",
    "Multiple transaction failures"
  ];
  
  for (let i = 1; i <= count; i++) {
    const atm = atms[Math.floor(Math.random() * atms.length)];
    const rule = ruleTemplates[i % ruleTemplates.length];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    // More active alerts for realism
    const status = Math.random() > 0.6 ? "active" : statuses[Math.floor(Math.random() * statuses.length)];
    
    alerts.push({
      id: `ALERT-${i.toString().padStart(4, '0')}`,
      rule: rule,
      atm_id: atm.atm_id,
      atmId: atm.atm_id, // Legacy compatibility
      timestamp: randomRecentDate(),
      severity: severity,
      message: `${rule} for ${atm.atm_id} at ${atm.location}`,
      status: status
    });
  }
  
  return alerts;
};

// Dashboard summary stats
export const getDashboardSummary = (atms: ATM[]) => {
  return {
    totalATMs: atms.length,
    activeATMs: atms.filter(atm => atm.status === 'active').length,
    warningATMs: atms.filter(atm => atm.status === 'warning').length,
    errorATMs: atms.filter(atm => atm.status === 'error').length,
    inactiveATMs: atms.filter(atm => atm.status === 'inactive').length,
    lowCashATMs: atms.filter(atm => (atm.lastTelemetry?.cash_level_percent || atm.cashLevel) < 20).length
  };
};

// Initial data
export const mockATMs = generateMockATMs(50);
generateATMTelemetryData(mockATMs); // Generate telemetry data for all ATMs
export const mockAlerts = generateMockAlerts(mockATMs, 30);
