"use client";

import React from "react";
import { RTVIClientProvider } from "@pipecat-ai/client-react";
import {
  createRTVIClient,
  RTVIClientOptions,
  Client,
  RTVIEvent,
  LLMHelper,
} from "@think41/foundation-voice-client-js";
import { type PropsWithChildren, useEffect, useState, useCallback } from "react";

export interface CAIProviderProps extends PropsWithChildren {
  clientType?: 'websocket' | 'daily' | 'webrtc' | string;
  options?: Partial<RTVIClientOptions>;
  onLLMJsonCompletion?: (jsonString: string) => void;
  onLLMFunctionCall?: (func: any) => void;
}

export function CAIProvider({ 
  children, 
  clientType = 'websocket', 
  options,
  onLLMJsonCompletion,
  onLLMFunctionCall,
}: CAIProviderProps) {
  const [client, setClient] = useState<Client | undefined>();

  // Initialize LLM helper
  const initializeLLMHelper = useCallback((client: Client) => {
    if (!client.getHelper("llm")) {
      const llmHelper = new LLMHelper({
        callbacks: {
          onLLMJsonCompletion: (jsonString) => {
            console.log('LLM JSON Completion:', jsonString);
            onLLMJsonCompletion?.(jsonString);
          },
          onLLMFunctionCall: (func) => {
            console.log('LLM Function Call:', func);
            onLLMFunctionCall?.(func);
          }
        }
      });
      client.registerHelper("llm", llmHelper);
    }
  }, [onLLMJsonCompletion, onLLMFunctionCall]);

  useEffect(() => {
    const fetchClient = async () => {
      const client = await createRTVIClient(clientType, options);
      initializeLLMHelper(client);
      setClient(client);
    };
    fetchClient();
  }, [clientType, options, initializeLLMHelper]);

  if (!client) return <>{children}</>;

  return <RTVIClientProvider client={client}>{children}</RTVIClientProvider>;
}

export default CAIProvider;