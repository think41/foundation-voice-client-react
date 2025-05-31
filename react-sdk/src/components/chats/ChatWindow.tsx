"use client"

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  RTVIEvent,
  TranscriptData,
  BotLLMTextData,
  LLMHelper,
} from '@think41/client-js-standalone';
import { useRTVIClient, useRTVIClientEvent } from '@pipecat-ai/client-react';
import { useChat } from './ChatContext'; // Import the chat context

export interface ChatWindowProps {
  className?: string;
  initialMessages?: Array<{
    type: 'user' | 'bot';
    text: string;
  }>;
}

export function ChatWindow({ 
  className = "w-full h-full",
  initialMessages = [] 
}: ChatWindowProps) {
  // Use shared chat context instead of local state
  const { messages, addMessage, clearMessages } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const client = useRTVIClient();
  const hasInitialized = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useRTVIClientEvent(
    RTVIEvent.TransportStateChanged,
    useCallback((state: string) => {
      setIsConnected(state === 'ready');
    }, [])
  );

  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback(
      (data: TranscriptData) => {
        if (data.final && data.text.trim()) {
          console.log("UserTranscript" , data);
          // In this UI, 'user' type corresponds to purple bubbles on the right
          addMessage('user', data.text);
        }
      },
      [addMessage]
    )
  );

  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
    useCallback(
      (data: BotLLMTextData) => {
        console.log("BotTranscript", data);
        if (data.text.trim()) {
          addMessage('bot', data.text);
        }
      },
      [addMessage]
    )
  );

  // Handle initial messages
  useEffect(() => {
    if (!hasInitialized.current && initialMessages.length > 0) {
      clearMessages();
      initialMessages.forEach(msg => {
        addMessage(msg.type, msg.text);
      });
      hasInitialized.current = true;
    }
  }, [initialMessages, addMessage, clearMessages]);

  const sendTextMessage = useCallback(async () => {
    if (!client || !inputValue.trim() || !isConnected) return;
  
    const messageText = inputValue.trim();
    setInputValue('');
    addMessage('user', messageText);
  
    try {
      const llmHelper = client.getHelper<LLMHelper>("llm");
      if (!llmHelper) {
        throw new Error("LLM helper is not available");
      }
      await llmHelper.appendToMessages(
        {
          role: "user",
          content: messageText,
        },
        true  
      );

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('bot', 'Sorry, I encountered an error processing your message. Please try again.');
    }
  }, [client, inputValue, isConnected, addMessage]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendTextMessage();
  }, [sendTextMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  }, [sendTextMessage]);

  return (
    <div className={`flex flex-col bg-[oklch(0.278_0.033_256.848)] overflow-hidden ${className}`}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0 w-[calc(100%+1rem)] -mr-4 pr-4 no-scrollbar">
        <style dangerouslySetInnerHTML={{ __html: `
          /* Hide scrollbar for Chrome, Safari and Opera */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}} />
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            Start a conversation by typing a message below or speaking.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.type === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Sender Name */}
              <span className={`text-xs font-medium mb-1 ${
                message.type === 'user' ? 'text-violet-300' : 'text-neutral-300'
              }`}>
                {message.type === 'user' ? 'You' : 'Assistant'}
              </span>
              
              {/* Message Bubble and Timestamp */}
              <div className="flex items-start gap-2.5">
                <div
                  className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${
                    message.type === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-violet-600 text-white rounded-l-lg rounded-br-lg'
                        : 'bg-white text-neutral-800 rounded-r-lg rounded-bl-lg'
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    }).toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-neutral-700 bg-[oklch(0.278_0.033_256.848)]">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConnected 
                ? "Type your message..." 
                : "Connecting to chat..."
            }
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border border-neutral-600 rounded-md bg-neutral-800 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputValue.trim()}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;