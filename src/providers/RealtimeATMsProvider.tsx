import React, { ReactNode, createContext, useCallback, useContext, useEffect, useReducer } from "react";

import { ATM } from "@/features/atms/schema";
import { WebSocketMessage, useDashboardWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";

interface RealtimeATMsState {
  atms: ATM[];
  isConnected: boolean;
  lastUpdate: string | null;
  statusUpdates: Map<string, { old_status: string; new_status: string; timestamp: string }>; // Track recent updates
}

interface RealtimeATMsActions {
  updateATMs: (atms: ATM[]) => void;
  clearStatusUpdates: () => void;
}

type ATMsAction =
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "UPDATE_ATMS"; payload: ATM[] }
  | { type: "ATM_STATUS_CHANGE"; payload: { atm_id: string; old_status: string; new_status: string; timestamp: string } }
  | { type: "CLEAR_STATUS_UPDATES" }
  | { type: "SET_LAST_UPDATE"; payload: string };

const initialState: RealtimeATMsState = {
  atms: [],
  isConnected: false,
  lastUpdate: null,
  statusUpdates: new Map(),
};

function atmsReducer(state: RealtimeATMsState, action: ATMsAction): RealtimeATMsState {
  switch (action.type) {
    case "SET_CONNECTION_STATUS":
      return { ...state, isConnected: action.payload };

    case "UPDATE_ATMS":
      return {
        ...state,
        atms: action.payload,
        lastUpdate: new Date().toISOString(),
      };

    case "ATM_STATUS_CHANGE": {
      const { atm_id, old_status, new_status, timestamp } = action.payload;

      // Update the ATM status in the list
      const updatedATMs = state.atms.map((atm) => (atm.atm_id === atm_id ? { ...atm, status: new_status as any, updated_at: timestamp } : atm));

      // Track the status update for visual feedback
      const newStatusUpdates = new Map(state.statusUpdates);
      newStatusUpdates.set(atm_id, { old_status, new_status, timestamp });

      // Clear old status updates (older than 30 seconds)
      const thirtySecondsAgo = Date.now() - 30000;
      for (const [key, update] of newStatusUpdates.entries()) {
        if (new Date(update.timestamp).getTime() < thirtySecondsAgo) {
          newStatusUpdates.delete(key);
        }
      }

      return {
        ...state,
        atms: updatedATMs,
        statusUpdates: newStatusUpdates,
        lastUpdate: new Date().toISOString(),
      };
    }
    case "CLEAR_STATUS_UPDATES":
      return {
        ...state,
        statusUpdates: new Map(),
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

const RealtimeATMsContext = createContext<{
  state: RealtimeATMsState;
  actions: RealtimeATMsActions;
} | null>(null);

interface RealtimeATMsProviderProps {
  children: ReactNode;
}

export const RealtimeATMsProvider: React.FC<RealtimeATMsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(atmsReducer, initialState);

  // Handle WebSocket messages (status changes only)
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log("ATMs list WebSocket message received:", message);

    switch (message.type) {
      case "connection_established":
        console.log("ATMs list WebSocket connection established");
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

          // Show status change notification with more context
          const statusChangeMessage = `${message.data.atm_id} changed from ${message.data.old_status} to ${message.data.new_status}`;

          if (message.data.new_status === "error") {
            toast.error(`🔴 ${statusChangeMessage}`, {
              description: "ATM requires attention",
              duration: 4000,
            });
          } else if (message.data.new_status === "offline") {
            toast.warning(`⚠️ ${statusChangeMessage}`, {
              description: "ATM went offline",
              duration: 3000,
            });
          } else if (message.data.new_status === "online" && message.data.old_status !== "online") {
            toast.success(`🟢 ${statusChangeMessage}`, {
              description: "ATM is back online",
              duration: 2000,
            });
          } else if (message.data.new_status === "maintenance") {
            toast.info(`🔧 ${statusChangeMessage}`, {
              description: "ATM is under maintenance",
              duration: 3000,
            });
          }
        }
        break;

      default:
        console.log("Unhandled ATMs list message type:", message.type);
    }
  }, []);

  const { isConnected } = useDashboardWebSocket(handleWebSocketMessage);

  // Update connection status
  useEffect(() => {
    dispatch({ type: "SET_CONNECTION_STATUS", payload: isConnected });
  }, [isConnected]);

  // Clear old status updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "CLEAR_STATUS_UPDATES" });
    }, 60000); // Clear every minute

    return () => clearInterval(interval);
  }, []);

  // Actions
  const actions: RealtimeATMsActions = {
    updateATMs: (atms: ATM[]) => {
      dispatch({ type: "UPDATE_ATMS", payload: atms });
    },

    clearStatusUpdates: () => {
      dispatch({ type: "CLEAR_STATUS_UPDATES" });
    },
  };

  const contextValue = {
    state,
    actions,
  };

  return <RealtimeATMsContext.Provider value={contextValue}>{children}</RealtimeATMsContext.Provider>;
};

export const useRealtimeATMs = () => {
  const context = useContext(RealtimeATMsContext);
  if (!context) {
    throw new Error("useRealtimeATMs must be used within a RealtimeATMsProvider");
  }
  return context;
};
