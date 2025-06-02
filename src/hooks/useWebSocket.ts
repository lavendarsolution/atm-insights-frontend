import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "sonner";

import env from "@/lib/env";

export interface WebSocketMessage {
  type: string;
  data?: any;
  atm_id?: string;
  timestamp: string;
}

export interface WebSocketHookOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface WebSocketHookReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useWebSocket = (options: WebSocketHookOptions): WebSocketHookReturn => {
  const { url, onMessage, onConnect, onDisconnect, onError, autoReconnect = true, reconnectInterval = 3000, maxReconnectAttempts = 10 } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const websocket = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef<number | null>(null);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const clearPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      try {
        const messageStr = typeof message === "string" ? message : JSON.stringify(message);
        websocket.current.send(messageStr);
      } catch (err) {
        console.error("Failed to send WebSocket message:", err);
        setError("Failed to send message");
      }
    } else {
      console.warn("WebSocket is not connected. Cannot send message.");
    }
  }, []);

  const startPingInterval = useCallback(() => {
    clearPingInterval();
    pingIntervalRef.current = setInterval(() => {
      sendMessage("ping");
    }, 30000); // Ping every 30 seconds
  }, [sendMessage, clearPingInterval]);

  const connect = useCallback(() => {
    if (websocket.current && websocket.current.readyState === WebSocket.CONNECTING) {
      return; // Already connecting
    }

    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Convert HTTP URL to WebSocket URL if needed
      const wsUrl = url.replace(/^http/, "ws");
      websocket.current = new WebSocket(wsUrl);

      websocket.current.onopen = () => {
        console.log(`WebSocket connected to ${wsUrl}`);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        clearReconnectTimeout();
        startPingInterval();
        onConnect?.();
      };

      websocket.current.onmessage = (event) => {
        try {
          // Handle pong messages
          if (event.data === "pong") {
            return;
          }

          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      websocket.current.onclose = (event) => {
        console.log(`WebSocket disconnected from ${wsUrl}:`, event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        clearPingInterval();
        onDisconnect?.();

        // Auto-reconnect if enabled and not a clean close
        if (autoReconnect && event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const attemptNumber = reconnectAttemptsRef.current + 1;
          console.log(`Attempting to reconnect (${attemptNumber}/${maxReconnectAttempts})...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current = attemptNumber;
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError("Maximum reconnection attempts reached");
          toast.error("Connection lost. Please refresh the page.");
        }
      };

      websocket.current.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("WebSocket connection error");
        setIsConnecting(false);
        onError?.(event);
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to create connection");
      setIsConnecting(false);
    }
  }, [
    url,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    clearReconnectTimeout,
    startPingInterval,
    clearPingInterval,
  ]);

  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    clearPingInterval();

    if (websocket.current) {
      websocket.current.close(1000, "User disconnected");
      websocket.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
  }, [clearReconnectTimeout, clearPingInterval]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      reconnectAttemptsRef.current = 0;
      connect();
    }, 100);
  }, [disconnect, connect]);

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]); // Include connect and disconnect dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearReconnectTimeout();
      clearPingInterval();
      if (websocket.current) {
        websocket.current.close(1000, "Component unmounted");
      }
    };
  }, [clearReconnectTimeout, clearPingInterval]);

  return {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    connect,
    disconnect,
    reconnect,
  };
};

// Specialized hooks for different WebSocket endpoints
export const useDashboardWebSocket = (onMessage?: (message: WebSocketMessage) => void) => {
  const baseUrl = env.BACKEND_URL;
  const wsUrl = `${baseUrl.replace(/^http/, "ws")}/api/v1/ws/dashboard`;

  return useWebSocket({
    url: wsUrl,
    onMessage,
    onConnect: () => {
      console.log("Dashboard WebSocket connected");
    },
    onDisconnect: () => {
      console.log("Dashboard WebSocket disconnected");
    },
    onError: (error) => {
      console.error("Dashboard WebSocket error:", error);
    },
  });
};

export const useATMDetailWebSocket = (atmId: string, onMessage?: (message: WebSocketMessage) => void) => {
  const baseUrl = env.BACKEND_URL;
  const wsUrl = `${baseUrl.replace(/^http/, "ws")}/api/v1/ws/atm/${atmId}`;

  return useWebSocket({
    url: wsUrl,
    onMessage,
    onConnect: () => {
      console.log(`ATM detail WebSocket connected for ${atmId}`);
    },
    onDisconnect: () => {
      console.log(`ATM detail WebSocket disconnected for ${atmId}`);
    },
    onError: (error) => {
      console.error(`ATM detail WebSocket error for ${atmId}:`, error);
    },
  });
};

export const useAlertsWebSocket = (onMessage?: (message: WebSocketMessage) => void) => {
  const baseUrl = env.BACKEND_URL;
  const wsUrl = `${baseUrl.replace(/^http/, "ws")}/api/v1/ws/alerts`;

  return useWebSocket({
    url: wsUrl,
    onMessage,
    onConnect: () => {
      console.log("Alerts WebSocket connected");
    },
    onDisconnect: () => {
      console.log("Alerts WebSocket disconnected");
    },
    onError: (error) => {
      console.error("Alerts WebSocket error:", error);
    },
  });
};
