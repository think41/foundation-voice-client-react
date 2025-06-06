import React, { useState, useEffect } from 'react';
import { useCAI } from '../providers/CAIProvider';

export interface MicControlProps {
  isActive: boolean;
  className?: string;
  demoMode?: boolean;
  onClick?: () => void;
}

export const MicControl: React.FC<MicControlProps> = ({
  isActive,
  className = '',
  demoMode = false,
  onClick
}) => {
  const { client } = useCAI();
  const [isMicEnabled, setIsMicEnabled] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setIsMicEnabled(false);
    }
  }, [isActive]);

  const handleClick = async () => {
    onClick?.();
    if (!client || !isActive) return;

    try {
      const newState = !isMicEnabled;
      await client.enableMic(newState);
      setIsMicEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isActive}
      className={`relative p-4 rounded-full transition-colors ${
        isActive
          ? isMicEnabled
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gray-500 hover:bg-gray-600'
          : 'bg-gray-300 cursor-not-allowed'
      } ${className}`}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        {isMicEnabled ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-white"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-white"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </div>
    </button>
  );
}; 