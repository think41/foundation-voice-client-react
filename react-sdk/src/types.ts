import { RTVIClientHelper } from '@think41/client-js-standalone';

/**
 * Extended helper interface for CAI-specific functionality
 * Extends the base RTVIClientHelper interface from PipeCat
 */
export interface CAIClientHelper extends RTVIClientHelper {
  // Add CAI-specific helper methods here
  handleLLMResponse: (response: any) => void;
  generatePrompt: (input: string) => string;
}

/**
 * Configuration options for the CAI client
 */
export interface CAIClientConfig {
  // Add CAI-specific configuration options here
  llmModel?: string;
  maxTokens?: number;
  temperature?: number;
  apiKey?: string;
}

/**
 * Props for the CAI Provider component
 */
export interface CAIProviderProps {
  children: React.ReactNode;
  config?: CAIClientConfig;
}

/**
 * CAI Chat Message interface
 */
export interface CAIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * CAI Chat Session interface
 */
export interface CAISession {
  id: string;
  messages: CAIMessage[];
  createdAt: number;
  updatedAt: number;
}