import { useState, useEffect } from "react";
import { useRTVIClient, useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@think41/client-js-standalone";
import { log } from "../utils/logger";

// Define transcript structure
export interface Transcript {
  text: string;
  speaker: "user" | "bot";
  timestamp: number;
  final?: boolean;
}

// Interface for the transcript update from our server
export interface TranscriptUpdate {
  type: "transcript_update";
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Define conversation states
export enum ConversationState {
  IDLE = "idle",
  USER_SPEAKING = "user_speaking",
  BOT_PROCESSING = "bot_processing",
  BOT_SPEAKING = "bot_speaking",
}

// Define the return type for the hook
export interface ConversationContext {
  state: ConversationState;
  isBotSpeaking: boolean;
  isUserSpeaking: boolean;
  isBotProcessing: boolean;
  transcripts: Transcript[];
  lastUserTranscript: string | null;
  lastBotTranscript: string | null;
  clearTranscripts: () => void;
  addTranscript: (transcript: Transcript) => void;
  handleTranscriptUpdate: (update: TranscriptUpdate) => void;
}

/**
 * A custom hook for managing conversation state
 * Tracks user/bot speaking states, processes transcripts,
 * and manages a state machine for the conversation flow.
 */
export function useConversationState(): ConversationContext {
  // Internal state
  const client = useRTVIClient();
  const [currentState, setCurrentState] = useState<ConversationState>(
    ConversationState.IDLE,
  );
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isBotProcessing, setIsBotProcessing] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [lastUserTranscript, setLastUserTranscript] = useState<string | null>(
    null,
  );
  const [lastBotTranscript, setLastBotTranscript] = useState<string | null>(
    null,
  );

  // State machine transitions
  const transitionTo = (newState: ConversationState) => {
    // Only log state transitions for speech events
    setCurrentState(newState);
  };

  // Handle bot started speaking
  useRTVIClientEvent(RTVIEvent.BotStartedSpeaking, () => {
    setIsBotSpeaking(true);
    log.conversation.info("Bot started speaking (RTVIEvent)");
    transitionTo(ConversationState.BOT_SPEAKING);
  });

  // Handle bot stopped speaking
  useRTVIClientEvent(RTVIEvent.BotStoppedSpeaking, () => {
    setIsBotSpeaking(false);
    log.conversation.info("Bot stopped speaking (RTVIEvent)");
    transitionTo(ConversationState.IDLE);
  });

  // Also listen for our custom bot speaking events (from audio frame detection)
  useEffect(() => {
    const handleBotStartedSpeaking = () => {
      setIsBotSpeaking(true);
      log.conversation.info("Bot started speaking (custom event)");
      transitionTo(ConversationState.BOT_SPEAKING);
    };

    const handleBotStoppedSpeaking = () => {
      setIsBotSpeaking(false);
      log.conversation.info("Bot stopped speaking (custom event)");
      transitionTo(ConversationState.IDLE);
    };

    window.addEventListener("bot-started-speaking", handleBotStartedSpeaking);
    window.addEventListener("bot-stopped-speaking", handleBotStoppedSpeaking);

    return () => {
      window.removeEventListener(
        "bot-started-speaking",
        handleBotStartedSpeaking,
      );
      window.removeEventListener(
        "bot-stopped-speaking",
        handleBotStoppedSpeaking,
      );
    };
  }, []);

  // Handle user started speaking
  useRTVIClientEvent(RTVIEvent.UserStartedSpeaking, () => {
    setIsUserSpeaking(true);
    log.conversation.info("User started speaking");
    transitionTo(ConversationState.USER_SPEAKING);
  });

  // Handle user stopped speaking
  useRTVIClientEvent(RTVIEvent.UserStoppedSpeaking, () => {
    setIsUserSpeaking(false);
    log.conversation.info("User stopped speaking");
    transitionTo(ConversationState.BOT_PROCESSING);
    setIsBotProcessing(true);
  });

  // Handle LLM started/stopped events
  useRTVIClientEvent(RTVIEvent.BotLlmStarted, () => {
    setIsBotProcessing(true);
  });

  useRTVIClientEvent(RTVIEvent.BotLlmStopped, () => {
    setIsBotProcessing(false);
  });

  // Handle user transcripts
  useRTVIClientEvent(RTVIEvent.UserTranscript, (data: any) => {
    if (data?.text) {
      const transcript: Transcript = {
        text: data.text,
        speaker: "user",
        timestamp: Date.now(),
        final: data.final || false,
      };

      if (data.final) {
        setLastUserTranscript(data.text);
        setTranscripts((prev) => [...prev, transcript]);
      }
    }
  });

  // Handle bot transcripts
  useRTVIClientEvent(RTVIEvent.BotTranscript, (data: any) => {
    if (data?.text) {
      const transcript: Transcript = {
        text: data.text,
        speaker: "bot",
        timestamp: Date.now(),
        final: true,
      };

      setLastBotTranscript(data.text);
      setTranscripts((prev) => [...prev, transcript]);
    }
  });

  // Utility functions
  const clearTranscripts = () => {
    setTranscripts([]);
    setLastUserTranscript(null);
    setLastBotTranscript(null);
  };

  const addTranscript = (transcript: Transcript) => {
    setTranscripts((prev) => [...prev, transcript]);
    if (transcript.speaker === "user") {
      setLastUserTranscript(transcript.text);
    } else {
      setLastBotTranscript(transcript.text);
    }
  };

  // New handler for server transcript updates from raw WebSocket messages
  const handleTranscriptUpdate = (update: TranscriptUpdate) => {
    const timestamp = new Date(update.timestamp).getTime();
    const isAssistant = update.role === "assistant";

    // Create a transcript object from the update
    const transcript: Transcript = {
      text: update.content,
      speaker: isAssistant ? "bot" : "user",
      timestamp,
      final: true,
    };

    // Update state
    if (isAssistant) {
      setLastBotTranscript(update.content);
    } else {
      setLastUserTranscript(update.content);
    }

    // Add to transcript list, avoiding duplicates
    setTranscripts((prev) => {
      // Check if we already have this exact transcript
      const exists = prev.some(
        (t) =>
          t.text === update.content &&
          t.speaker === (isAssistant ? "bot" : "user") &&
          Math.abs(t.timestamp - timestamp) < 1000, // Allow 1 second tolerance
      );

      if (exists) {
        return prev;
      }

      return [...prev, transcript];
    });

    log.conversation.info(
      `Received transcript update - ${update.role}: ${update.content}`,
    );
  };

  return {
    state: currentState,
    isBotSpeaking,
    isUserSpeaking,
    isBotProcessing,
    transcripts,
    lastUserTranscript,
    lastBotTranscript,
    clearTranscripts,
    addTranscript,
    handleTranscriptUpdate,
  };
}
