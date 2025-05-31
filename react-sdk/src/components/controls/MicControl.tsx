"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Mic } from "lucide-react";
import { cn } from "../../utils/utils";
import { useRTVIClient, useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@think41/client-js-standalone";

interface MicControlProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  isActive?: boolean;
  onChange?: (isActive: boolean) => void;
}

export function MicControl({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  isActive,
  onChange,
}: MicControlProps) {
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);

  const client = useRTVIClient();
  
  // Use external isActive if provided, otherwise use internal state
  const submitted = isActive !== undefined ? isActive : internalSubmitted;

  useEffect(() => {
    if (!client) return;

    const handleMicState = async () => {
      try {
        const isMicActive = client.isMicEnabled;
        if (isActive === undefined) {
          setInternalSubmitted(isMicActive);
        }
        onChange?.(isMicActive);
      } catch (error) {
        console.error("Error getting mic state:", error);
      }
    };

    // Initial state
    handleMicState();

    // Set up polling for mic state changes
    const intervalId = setInterval(handleMicState, 1000);

    return () => clearInterval(intervalId);
  }, [client, isActive, onChange]);

  useEffect(() => {
    setIsClient(true);
    
    // Initialize mic state from client if available
    const initMicState = async () => {
      if (client) {
        try {
         const micState = client.isMicEnabled;
          if (isActive === undefined) {
            setInternalSubmitted(micState);
          }
        } catch (error) {
          console.error("Failed to get initial mic state:", error);
        }
      }
    };
    
    initMicState();
  }, [client, isActive]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (submitted) {
      onStart?.();
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else if (time > 0) {
      onStop?.(time);
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted, time, onStart, onStop]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: ReturnType<typeof setInterval>;
    const runAnimation = () => {
      const newState = true;
      if (onChange) {
        onChange(newState);
      } else {
        setInternalSubmitted(newState);
      }
      timeoutId = setTimeout(() => {
        if (onChange) {
          onChange(false);
        } else {
          setInternalSubmitted(false);
        }
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval, onChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = useCallback(async () => {
    if (isDemo) {
      setIsDemo(false);
      if (onChange) {
        onChange(false);
      } else {
        setInternalSubmitted(false);
      }
      return;
    }

    const newState = !submitted;

    try {
      setIsConnecting(true);
      
      if (client) {
        await client.enableMic(newState);
      } else if (onChange) {
        // Fallback to onChange if client is not available
        onChange(newState);
      } else {
        setInternalSubmitted(newState);
      }
    } catch (error) {
      console.error("Error toggling mic:", error);
      // Revert the state on error
      if (onChange) {
        onChange(!newState);
      } else {
        setInternalSubmitted(!newState);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [client, isDemo, onChange, submitted]);

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            submitted
              ? "bg-none"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10",
            isConnecting ? "opacity-50 cursor-not-allowed" : ""
          )}
          type="button"
          onClick={handleClick}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : submitted ? (
            <div className="w-6 h-6 rounded-full bg-red-500 animate-pulse" />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted || isConnecting
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30",
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                (submitted || isConnecting)
                  ? "bg-black/50 dark:bg-white/50 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1",
              )}
              style={
                (submitted || isConnecting) && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {isConnecting ? "Processing..." : submitted ? "Listening..." : "Click to speak"}
        </p>
      </div>
    </div>
  );
}
