"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRTVIClient, useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@think41/foundation-voice-client-js";

interface ConnectionButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  className?: string;
  isConnected?: boolean;
  onChange?: (isConnected: boolean) => void;
}

export function ConnectionButton({
  onConnect,
  onDisconnect,
  className = "",
  isConnected: externalIsConnected,
  onChange,
}: ConnectionButtonProps) {
  const client = useRTVIClient();
  const [internalConnected, setInternalConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connected = externalIsConnected !== undefined ? externalIsConnected : internalConnected;

  // Listen for connection state changes
  useRTVIClientEvent(RTVIEvent.Connected, () => {
    setInternalConnected(true);
    setIsConnecting(false);
    onChange?.(true);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, () => {
    setInternalConnected(false);
    setIsConnecting(false);
    onChange?.(false);
  });

  const handleClick = useCallback(async () => {
    const newState = !connected;

    try {
      setIsConnecting(true);

      if (newState) {
        onConnect?.();
        await client?.connect();
      } else {
        onDisconnect?.();
        await client?.disconnect();
      }
    } catch (error) {
      console.error("Connection toggle error:", error);
      setIsConnecting(false);
    }
  }, [client, connected, onChange, onConnect, onDisconnect]);

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-md ${
        isConnecting
          ? "bg-gray-400 cursor-not-allowed text-white opacity-75"
          : connected
          ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
          : "bg-gray-800 hover:bg-gray-900 text-white shadow-lg"
      } ${className}`}
    >
      {isConnecting 
        ? "Connecting..." 
        : connected 
        ? "Disconnect" 
        : "Connect"
      }
    </button>
  );
}