import { useState, useEffect, useCallback } from "react";
import {
  useRTVIClient,
  useRTVIClientTransportState,
} from "@pipecat-ai/client-react";
import { RTVIEvent } from "@think41/foundation-voice-client-js";

// Connection state interface
export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastError: string | null;
  transportState: string;
}

// Configuration options
interface ConnectionManagerOptions {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectBackoffMultiplier?: number;
}

/**
 * Hook to manage connection state and automatic reconnection
 * with exponential backoff and jitter
 */
export function useConnectionManager(options: ConnectionManagerOptions = {}) {
  const client = useRTVIClient();
  const transportState = useRTVIClientTransportState();

  // Default options
  const {
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
    maxReconnectDelay = 30000,
    reconnectBackoffMultiplier = 1.5,
  } = options;

  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    lastError: null,
    transportState: transportState || "disconnected",
  });

  // Update connection state when transport state changes
  useEffect(() => {
    if (!transportState) return;

    setConnectionState((prev) => ({
      ...prev,
      transportState,
      isConnected: transportState === "connected" || transportState === "ready",
      isConnecting: transportState === "connecting",
      // Keep reconnecting flag if it's already set, otherwise false
      isReconnecting: prev.isReconnecting && transportState === "connecting",
    }));

    // Reset reconnect attempts when successfully connected
    if (transportState === "connected" || transportState === "ready") {
      setConnectionState((prev) => ({
        ...prev,
        reconnectAttempts: 0,
        isReconnecting: false,
      }));
    }
  }, [transportState]);

  // Calculate reconnect delay with exponential backoff and jitter
  const calculateReconnectDelay = useCallback(
    (attempts: number): number => {
      // Base delay with exponential backoff
      const baseDelay =
        reconnectDelay * Math.pow(reconnectBackoffMultiplier, attempts);
      // Apply jitter (random value between 0.8 and 1.2)
      const jitter = 0.8 + Math.random() * 0.4;
      // Ensure we don't exceed the maximum delay
      return Math.min(baseDelay * jitter, maxReconnectDelay);
    },
    [reconnectDelay, reconnectBackoffMultiplier, maxReconnectDelay],
  );

  // Handle connection errors and disconnections
  useEffect(() => {
    if (!client) return;

    const handleDisconnect = () => {
      // Only attempt reconnect if we were previously connected
      if (
        connectionState.isConnected &&
        connectionState.reconnectAttempts < maxReconnectAttempts
      ) {
        const nextAttempt = connectionState.reconnectAttempts + 1;
        const delay = calculateReconnectDelay(nextAttempt);

        console.log(
          `[Connection] Attempting reconnect ${nextAttempt}/${maxReconnectAttempts} in ${delay}ms`,
        );

        setConnectionState((prev) => ({
          ...prev,
          isReconnecting: true,
          reconnectAttempts: nextAttempt,
        }));

        // Attempt reconnection after delay
        setTimeout(() => {
          if (client) {
            console.log("[Connection] Executing reconnect attempt");
            client.connect().catch((error) => {
              setConnectionState((prev) => ({
                ...prev,
                lastError: `Reconnection failed: ${error.message || "Unknown error"}`,
              }));
            });
          }
        }, delay);
      } else if (connectionState.reconnectAttempts >= maxReconnectAttempts) {
        console.log("[Connection] Maximum reconnect attempts reached");
        setConnectionState((prev) => ({
          ...prev,
          isReconnecting: false,
          lastError: "Maximum reconnection attempts reached",
        }));
      }
    };

    const handleError = (error: any) => {
      console.error("[Connection] Error:", error);
      setConnectionState((prev) => ({
        ...prev,
        lastError: error?.message || "Unknown error",
      }));
    };

    // Register event listeners
    client.on(RTVIEvent.Disconnected, handleDisconnect);
    client.on(RTVIEvent.Error, handleError);

    // Cleanup when component unmounts
    return () => {
      client.off(RTVIEvent.Disconnected, handleDisconnect);
      client.off(RTVIEvent.Error, handleError);
    };
  }, [
    client,
    connectionState.isConnected,
    connectionState.reconnectAttempts,
    maxReconnectAttempts,
    calculateReconnectDelay,
  ]);

  // Connect method (with auto-reconnect disabled for manual connections)
  const connect = useCallback(async () => {
    if (!client) return;

    try {
      setConnectionState((prev) => ({
        ...prev,
        isConnecting: true,
        lastError: null,
      }));

      await client.connect();

      setConnectionState((prev) => ({
        ...prev,
        isConnecting: false,
        reconnectAttempts: 0,
      }));
    } catch (error: any) {
      console.error("[Connection] Connection failed:", error);
      setConnectionState((prev) => ({
        ...prev,
        isConnecting: false,
        lastError: error.message || "Connection failed",
      }));
    }
  }, [client]);

  // Disconnect method
  const disconnect = useCallback(async () => {
    if (!client) return;

    try {
      await client.disconnect();

      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        isReconnecting: false,
      }));
    } catch (error: any) {
      console.error("[Connection] Disconnect failed:", error);
    }
  }, [client]);

  // Manually reset the error state
  const clearError = useCallback(() => {
    setConnectionState((prev) => ({
      ...prev,
      lastError: null,
    }));
  }, []);

  return {
    ...connectionState,
    connect,
    disconnect,
    clearError,
  };
}
