import React, { ReactNode, createContext, useCallback, useContext, useEffect, useReducer } from "react";

import { WebSocketMessage, useDashboardWebSocket } from "@/hooks/useWebSocket";
import { notification } from "sonner";

import HttpClient from "@/lib/HttpClient";

interface DashboardStats {
  total_atms: number;
  online_atms: number;
  offline_atms: number;
  error_atms: number;
  total_transactions_today: number;
  avg_cash_level: number;
  critical_alerts: number;
  last_updated: string;
}

interface Alert {
  id: string;
  atm_id: string;
  severity: "low" | "medium" | "high" | "critical" | "warning" | "error";
  type: string;
  message: string;
  timestamp: string;
}

interface RealtimeDashboardState {
  stats: DashboardStats | null;
  alerts: Alert[];
  isConnected: boolean;
  isLoading: boolean;
  lastUpdate: string | null;
  lastStatsUpdate: string | null;
}

interface RealtimeDashboardActions {
  refreshData: () => void;
  markAlertAsRead: (alertId: string) => void;
  clearAllAlerts: () => void;
}

type DashboardAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "UPDATE_STATS"; payload: DashboardStats }
  | { type: "SET_ALERTS"; payload: Alert[] }
  | { type: "ATM_STATUS_CHANGE"; payload: { atm_id: string; old_status: string; new_status: string; timestamp: string } }
  | { type: "MARK_ALERT_READ"; payload: string }
  | { type: "CLEAR_ALERTS" }
  | { type: "SET_LAST_UPDATE"; payload: string }
  | { type: "SET_LAST_STATS_UPDATE"; payload: string };

const initialState: RealtimeDashboardState = {
  stats: null,
  alerts: [],
  isConnected: false,
  isLoading: true,
  lastUpdate: null,
  lastStatsUpdate: null,
};

function dashboardReducer(state: RealtimeDashboardState, action: DashboardAction): RealtimeDashboardState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_CONNECTION_STATUS":
      return { ...state, isConnected: action.payload };

    case "UPDATE_STATS":
      return {
        ...state,
        stats: action.payload,
        lastStatsUpdate: new Date().toISOString(),
        isLoading: false,
      };

    case "SET_ALERTS":
      return {
        ...state,
        alerts: action.payload,
      };

    case "ATM_STATUS_CHANGE":
      // Update stats when ATM status changes (real-time)
      if (state.stats) {
        const { old_status, new_status } = action.payload;
        const updatedStats = { ...state.stats };

        // Decrement old status count
        if (old_status === "online") updatedStats.online_atms = Math.max(0, updatedStats.online_atms - 1);
        else if (old_status === "offline") updatedStats.offline_atms = Math.max(0, updatedStats.offline_atms - 1);
        else if (old_status === "error") updatedStats.error_atms = Math.max(0, updatedStats.error_atms - 1);

        // Increment new status count
        if (new_status === "online") updatedStats.online_atms++;
        else if (new_status === "offline") updatedStats.offline_atms++;
        else if (new_status === "error") updatedStats.error_atms++;

        updatedStats.last_updated = new Date().toISOString();

        return {
          ...state,
          stats: updatedStats,
          lastUpdate: new Date().toISOString(),
        };
      }
      return { ...state, lastUpdate: new Date().toISOString() };

    case "MARK_ALERT_READ":
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };

    case "CLEAR_ALERTS":
      return {
        ...state,
        alerts: [],
      };

    case "SET_LAST_UPDATE":
      return {
        ...state,
        lastUpdate: action.payload,
      };

    case "SET_LAST_STATS_UPDATE":
      return {
        ...state,
        lastStatsUpdate: action.payload,
      };

    default:
      return state;
  }
}

const RealtimeDashboardContext = createContext<{
  state: RealtimeDashboardState;
  actions: RealtimeDashboardActions;
} | null>(null);

interface RealtimeDashboardProviderProps {
  children: ReactNode;
}

export const RealtimeDashboardProvider: React.FC<RealtimeDashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Fetch dashboard stats from API
  const fetchDashboardStats = useCallback(async () => {
    try {
      const [statsResponse, alertsResponse] = await Promise.all([HttpClient.Get("/api/v1/dashboard/stats"), HttpClient.Get("/api/v1/telemetry/alerts/recent")]);

      dispatch({ type: "UPDATE_STATS", payload: statsResponse });

      if (alertsResponse.alerts) {
        dispatch({ type: "SET_ALERTS", payload: alertsResponse.alerts });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      // Don't show error toast on every failure, just log it
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Set up polling every 15 seconds for dashboard stats
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  // Handle WebSocket messages (status changes only)
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log("Dashboard WebSocket message received:", message);

    switch (message.type) {
      case "connection_established":
        console.log("Dashboard WebSocket connection established");
        break;

      case "atm_status_change":
        if (message.data) {
          dispatch({
            type: "ATM_STATUS_CHANGE",
            payload: {
              atm_id: message.data.atm_id,
              old_status: message.data.old_status,
              new_status: message.data.new_status,
              timestamp: message.data.timestamp,
            },
          });

          // Show status change notification
          const statusChangeMessage = `ATM ${message.data.atm_id} changed from ${message.data.old_status} to ${message.data.new_status}`;
          if (message.data.new_status === "error") {
            toast.error(statusChangeMessage, {
              description: "ATM requires attention",
              duration: 5000,
            });
          } else if (message.data.new_status === "offline") {
            toast.warning(statusChangeMessage, {
              description: "ATM went offline",
              duration: 4000,
            });
          } else if (message.data.new_status === "online" && message.data.old_status !== "online") {
            toast.success(statusChangeMessage, {
              description: "ATM is back online",
              duration: 3000,
            });
          }
        }
        break;

      default:
        console.log("Unhandled dashboard message type:", message.type);
    }
  }, []);

  const { isConnected } = useDashboardWebSocket(handleWebSocketMessage);

  // Update connection status
  useEffect(() => {
    dispatch({ type: "SET_CONNECTION_STATUS", payload: isConnected });
  }, [isConnected]);

  // Actions
  const actions: RealtimeDashboardActions = {
    refreshData: () => {
      fetchDashboardStats();
    },

    markAlertAsRead: (alertId: string) => {
      dispatch({ type: "MARK_ALERT_READ", payload: alertId });
    },

    clearAllAlerts: () => {
      dispatch({ type: "CLEAR_ALERTS" });
    },
  };

  const contextValue = {
    state,
    actions,
  };

  return <RealtimeDashboardContext.Provider value={contextValue}>{children}</RealtimeDashboardContext.Provider>;
};

export const useRealtimeDashboard = () => {
  const context = useContext(RealtimeDashboardContext);
  if (!context) {
    throw new Error("useRealtimeDashboard must be used within a RealtimeDashboardProvider");
  }
  return context;
};
