import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client, RTVIMessage, RTVIEvent, TransportState, TransportManager } from '@think41/client-js-standalone';
import { logger } from '@think41/client-js-standalone';

interface CAIContextType {
  client: Client | null;
  isConnected: boolean;
  isUserSpeaking: boolean;
  isBotSpeaking: boolean;
  sendMessage: (text: string) => Promise<void>;
}

const CAIContext = createContext<CAIContextType | null>(null);

export const useCAI = () => {
  const context = useContext(CAIContext);
  if (!context) {
    throw new Error('useCAI must be used within a CAIProvider');
  }
  return context;
};

interface CAIProviderProps {
  serverUrl: string;
  apiKey?: string;
  children: React.ReactNode;
}

export const CAIProvider: React.FC<CAIProviderProps> = ({ serverUrl, apiKey, children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const transportManagerRef = useRef<TransportManager | null>(null);

  const handleMessage = (message: RTVIMessage) => {
    logger.info('Received message:', message);
    
    // Handle RTVI messages
    if (message.label === 'rtvi-ai') {
      switch (message.type) {
        case 'rtvi:user:started_speaking':
          setIsUserSpeaking(true);
          break;
        case 'rtvi:user:stopped_speaking':
          setIsUserSpeaking(false);
          break;
        case 'rtvi:bot:started_speaking':
          setIsBotSpeaking(true);
          break;
        case 'rtvi:bot:stopped_speaking':
          setIsBotSpeaking(false);
          break;
        case 'rtvi:bot:ready':
          logger.info('Bot is ready');
          break;
        default:
          logger.info('Unhandled RTVI message type:', message.type);
      }
    }
  };

  const initializeClient = async () => {
    if (clientRef.current) {
      logger.info('Client already initialized');
      return;
    }

    try {
      // Create transport manager with proper configuration
      const transportManager = new TransportManager('websocket', { 
        url: serverUrl, 
        apiKey,
        params: {
          baseUrl: serverUrl.replace('ws://', 'http://').replace('/ws', ''),
          endpoints: {
            connect: '/connect'
          },
          audio: {
            sampleRate: 16000,
            numChannels: 1,
            encoding: 'raw',
            format: 'protobuf',
            outputSampleRate: 16000,
            outputChannels: 1
          }
        }
      });
      transportManagerRef.current = transportManager;

      // Initialize transport with proper callbacks
      await transportManager.initialize({
        transport: transportManager.instance,
        params: {
          baseUrl: serverUrl.replace('ws://', 'http://').replace('/ws', ''),
          endpoints: {
            connect: '/connect'
          },
          audio: {
            sampleRate: 16000,
            numChannels: 1,
            encoding: 'raw',
            format: 'protobuf',
            outputSampleRate: 16000,
            outputChannels: 1
          }
        },
        enableMic: true,
        enableCam: false,
        callbacks: {
          onConnected: () => {
            logger.info('Connected to server');
            setIsConnected(true);
          },
          onDisconnected: () => {
            logger.info('Disconnected from server');
            setIsConnected(false);
          },
          onUserStartedSpeaking: () => {
            logger.info('User started speaking');
            setIsUserSpeaking(true);
          },
          onUserStoppedSpeaking: () => {
            logger.info('User stopped speaking');
            setIsUserSpeaking(false);
          },
          onBotStartedSpeaking: () => {
            logger.info('Bot started speaking');
            setIsBotSpeaking(true);
          },
          onBotStoppedSpeaking: () => {
            logger.info('Bot stopped speaking');
            setIsBotSpeaking(false);
          },
          onTransportStateChanged: (state: TransportState) => {
            logger.info('Transport state changed:', state);
            if (state === 'ready') {
              setIsConnected(true);
            } else if (state === 'disconnected' || state === 'error') {
              setIsConnected(false);
            }
          },
          onError: (error: RTVIMessage) => {
            logger.error('Transport error:', error);
          }
        }
      }, handleMessage);

      // Create client with transport
      const newClient = new Client({
        transport: transportManager.instance,
        params: {
          baseUrl: serverUrl.replace('ws://', 'http://').replace('/ws', ''),
          endpoints: {
            connect: '/connect'
          },
          audio: {
            sampleRate: 16000,
            numChannels: 1,
            encoding: 'raw',
            format: 'protobuf',
            outputSampleRate: 16000,
            outputChannels: 1
          }
        },
        enableMic: true,
        enableCam: false
      });

      // Connect to server
      await transportManager.connect({}, new AbortController());

      clientRef.current = newClient;
      setClient(newClient);
      logger.info('Client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize client:', error);
      throw error;
    }
  };

  const sendMessage = async (text: string) => {
    if (!clientRef.current) {
      throw new Error('Client not initialized');
    }
    await clientRef.current.sendTextMessage(text);
  };

  useEffect(() => {
    initializeClient().catch(error => {
      logger.error('Error initializing client:', error);
    });

    return () => {
      if (transportManagerRef.current) {
        transportManagerRef.current.disconnect();
      }
      clientRef.current = null;
      setClient(null);
    };
  }, [serverUrl, apiKey]);

  return (
    <CAIContext.Provider value={{
      client,
      isConnected,
      isUserSpeaking,
      isBotSpeaking,
      sendMessage
    }}>
      {children}
    </CAIContext.Provider>
  );
}; 