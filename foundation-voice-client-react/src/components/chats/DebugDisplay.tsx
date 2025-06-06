"use client"

import { useRef, useCallback } from 'react';
import {
  Participant,
  RTVIEvent,
  TransportState,
  TranscriptData,
  BotLLMTextData,
} from '@think41/foundation-voice-client-js';
import { useRTVIClient, useRTVIClientEvent } from '@pipecat-ai/client-react';

export interface DebugDisplayProps {
  className?: string;
}

export function DebugDisplay({ className = "" }: DebugDisplayProps) {
  const debugLogRef = useRef<HTMLDivElement>(null);
  const client = useRTVIClient();

  const log = useCallback((message: string) => {
    if (!debugLogRef.current) return;

    const entry = document.createElement('div');
    entry.className = 'text-xs font-mono py-1 border-b border-border/50';
    entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;

    // Add styling based on message type
    if (message.startsWith('User: ')) {
      entry.className += ' text-blue-500';
    } else if (message.startsWith('Bot: ')) {
      entry.className += ' text-green-500';
    } else if (message.includes('error') || message.includes('Error')) {
      entry.className += ' text-red-500';
    } else if (message.includes('warning') || message.includes('Warning')) {
      entry.className += ' text-yellow-500';
    }

    debugLogRef.current.appendChild(entry);
    debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
  }, []);

  // Log transport state changes
  useRTVIClientEvent(
    RTVIEvent.TransportStateChanged,
    useCallback(
      (state: TransportState) => {
        log(`Transport state changed: ${state}`);
      },
      [log]
    )
  );

  // Log bot connection events
  useRTVIClientEvent(
    RTVIEvent.BotConnected,
    useCallback(
      (participant?: Participant) => {
        log(`Bot connected: ${participant?.name || 'unknown'}`);
      },
      [log]
    )
  );

  useRTVIClientEvent(
    RTVIEvent.BotDisconnected,
    useCallback(
      (participant?: Participant) => {
        log(`Bot disconnected: ${participant?.name || 'unknown'}`);
      },
      [log]
    )
  );

  // Log track events
  useRTVIClientEvent(
    RTVIEvent.TrackStarted,
    useCallback(
      (track: MediaStreamTrack, participant?: Participant) => {
        log(`${participant?.name || 'Unknown'} started ${track.kind} track`);
      },
      [log]
    )
  );

  useRTVIClientEvent(
    RTVIEvent.TrackStopped,
    useCallback(
      (track: MediaStreamTrack, participant?: Participant) => {
        log(`${participant?.name || 'Unknown'} stopped ${track.kind} track`);
      },
      [log]
    )
  );

  // Log bot ready state and check tracks
  useRTVIClientEvent(
    RTVIEvent.BotReady,
    useCallback(() => {
      log(`Bot is ready`);

      if (!client) return;

      const tracks = client.tracks();
      log(
        `Available tracks: ${JSON.stringify({
          local: {
            audio: !!tracks.local.audio,
            video: !!tracks.local.video,
          },
          bot: {
            audio: !!tracks.bot?.audio,
            video: !!tracks.bot?.video,
          },
        })}`
      );
    }, [client, log])
  );

  // Log transcripts
  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback(
      (data: TranscriptData) => {
        // Only log final transcripts
        if (data.final) {
          log(`User: ${data.text}`);
        }
      },
      [log]
    )
  );

  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
    useCallback(
      (data: BotLLMTextData) => {
        log(`Bot: ${data.text}`);
      },
      [log]
    )
  );

  return (
    <div className={`border rounded-lg overflow-hidden bg-background ${className}`}>
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-medium">Debug Console</h3>
      </div>
      <div 
        ref={debugLogRef} 
        className="h-40 overflow-y-auto p-3 text-sm bg-background"
      />
    </div>
  );
}

export default DebugDisplay;
