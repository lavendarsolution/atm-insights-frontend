import React, { ReactNode, createContext, useContext, useEffect, useReducer } from "react";

import { ATMTelemetry } from "@/features/atms/schema";
import { WebSocketMessage, useATMDetailWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";

interface RealtimeATMState {
  atmId: string;
  latestTelemetry: ATMTelemetry | null;
  telemetryHistory: ATMTelemetry[];
  isConnected: boolean;
  isLoading: boolean;
  lastUpdate: string | null;
  connectionError: string | null;
}

interface RealtimeATMActions {
  requestHistoryRefresh: () => void;
  clearHistory: () => void;
}

type ATMAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "SET_CONNECTION_ERROR"; payload: string | null }
  | { type: "SET_INITIAL_DATA"; payload: { latest_telemetry?: ATMTelemetry; telemetry_history?: ATMTelemetry[] } }
  | { type: "UPDATE_TELEMETRY"; payload: ATMTelemetry }
  | { type: "UPDATE_HISTORY"; payload: ATMTelemetry[] }
  | { type: "ADD_TELEMETRY_TO_HISTORY"; payload: ATMTelemetry }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_LAST_UPDATE"; payload: string };

function createInitialState(atmId: string): RealtimeATMState {
  return {
    atmId,
    latestTelemetry: null,
    telemetryHistory: [],
    isConnected: false,
    isLoading: true,
    lastUpdate: null,
    connectionError: null,
  };
}

function atmDetailReducer(state: RealtimeATMState, action: ATMAction): RealtimeATMState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_CONNECTION_STATUS":
      return {
        ...state,
        isConnected: action.payload,
        connectionError: action.payload ? null : state.connectionError,
      };

    case "SET_CONNECTION_ERROR":
      return { ...state, connectionError: action.payload };

    case "SET_INITIAL_DATA":
      return {
        ...state,
        latestTelemetry: action.payload.latest_telemetry || state.latestTelemetry,
        telemetryHistory: action.payload.telemetry_history || state.telemetryHistory,
        isLoading: false,
        lastUpdate: new Date().toISOString(),
      };

    case "UPDATE_TELEMETRY":
      return {
        ...state,
        latestTelemetry: action.payload,
        lastUpdate: new Date().toISOString(),
      };

    case "UPDATE_HISTORY":
      return {
        ...state,
        telemetryHistory: action.payload,
        lastUpdate: new Date().toISOString(),
      };

    case "ADD_TELEMETRY_TO_HISTORY": {
      // Add new telemetry to history and keep only last 100 entries
      const newHistory = [action.payload, ...state.telemetryHistory].slice(0, 100);
      return {
        ...state,
        telemetryHistory: newHistory,
        latestTelemetry: action.payload, // Also update latest
        lastUpdate: new Date().toISOString(),
      };
    }
    case "CLEAR_HISTORY":
      return {
        ...state,
        telemetryHistory: [],
      };

    case "SET_LAST_UPDATE":
      return {
        ...state,
        lastUpdate: action.payload,
      };

    default:
      return state;
  }
}

const RealtimeATMContext = createContext<{
  state: RealtimeATMState;
  actions: RealtimeATMActions;
} | null>(null);

interface RealtimeATMProviderProps {
  children: ReactNode;
  atmId: string;
}

export const RealtimeATMProvider: React.FC<RealtimeATMProviderProps> = ({ children, atmId }) => {
  const [state, dispatch] = useReducer(atmDetailReducer, createInitialState(atmId));

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log(`ATM ${atmId} WebSocket message:`, message);

    switch (message.type) {
      case "atm_initial":
        if (message.data) {
          dispatch({ type: "SET_INITIAL_DATA", payload: message.data });
        }
        break;

      case "telemetry_update":
        if (message.data && message.atm_id === atmId) {
          const telemetryData: ATMTelemetry = {
            time: message.data.timestamp || message.timestamp,
            atm_id: message.data.atm_id,
            status: message.data.status,
            uptime_seconds: message.data.uptime_seconds,
            cash_level_percent: message.data.cash_level_percent,
            temperature_celsius: message.data.temperature_celsius,
            cpu_usage_percent: message.data.cpu_usage_percent,
            memory_usage_percent: message.data.memory_usage_percent,
            disk_usage_percent: message.data.disk_usage_percent,
            network_status: message.data.network_status,
            network_latency_ms: message.data.network_latency_ms,
            error_code: message.data.error_code,
            error_message: message.data.error_message,
          };

          dispatch({ type: "ADD_TELEMETRY_TO_HISTORY", payload: telemetryData });

          // Show notification for significant changes
          if (message.data.error_code) {
            toast.error(`ATM Error: ${message.data.error_message || message.data.error_code}`, {
              description: `ATM ${atmId}`,
              duration: 5000,
            });
          } else if (message.data.cash_level_percent !== undefined && message.data.cash_level_percent < 20) {
            toast.warning(`Low cash level: ${message.data.cash_level_percent}%`, {
              description: `ATM ${atmId}`,
              duration: 4000,
            });
          }
        }
        break;

      case "atm_status_change":
        if (message.data && message.data.atm_id === atmId) {
          const statusChangeMessage = `Status changed from ${message.data.old_status} to ${message.data.new_status}`;

          if (message.data.new_status === "error") {
            toast.error(statusChangeMessage, { description: `ATM ${atmId}` });
          } else if (message.data.new_status === "offline") {
            toast.warning(statusChangeMessage, { description: `ATM ${atmId}` });
          } else if (message.data.new_status === "online" && message.data.old_status !== "online") {
            toast.success(statusChangeMessage, { description: `ATM ${atmId}` });
          }

          // Update the latest telemetry status
          if (state.latestTelemetry) {
            const updatedTelemetry = {
              ...state.latestTelemetry,
              status: message.data.new_status,
              time: message.data.timestamp,
            };
            dispatch({ type: "UPDATE_TELEMETRY", payload: updatedTelemetry });
          }
        }
        break;

      case "history_requested":
        // Handle history refresh confirmation
        toast.success("Telemetry history refreshed", {
          description: `ATM ${atmId}`,
          duration: 2000,
        });
        break;

      default:
        console.log("Unhandled ATM detail message type:", message.type);
    }
  };

  const { isConnected, isConnecting, error, sendMessage } = useATMDetailWebSocket(atmId, handleWebSocketMessage);

  // Update connection status
  useEffect(() => {
    dispatch({ type: "SET_CONNECTION_STATUS", payload: isConnected });
    dispatch({ type: "SET_CONNECTION_ERROR", payload: error });
  }, [isConnected, error]);

  // Set loading state
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: isConnecting });
  }, [isConnecting]);

  // Actions
  const actions: RealtimeATMActions = {
    requestHistoryRefresh: () => {
      sendMessage("request_history");
    },

    clearHistory: () => {
      dispatch({ type: "CLEAR_HISTORY" });
    },
  };

  const contextValue = {
    state,
    actions,
  };

  return <RealtimeATMContext.Provider value={contextValue}>{children}</RealtimeATMContext.Provider>;
};

export const useRealtimeATM = () => {
  const context = useContext(RealtimeATMContext);
  if (!context) {
    throw new Error("useRealtimeATM must be used within a RealtimeATMProvider");
  }
  return context;
};
