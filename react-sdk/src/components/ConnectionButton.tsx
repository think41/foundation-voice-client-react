import React from 'react';
import { useCAI } from '../providers/CAIProvider';

export interface ConnectionButtonProps {
  onClick?: () => void;
  className?: string;
}

export const ConnectionButton: React.FC<ConnectionButtonProps> = ({ 
  onClick,
  className = ''
}) => {
  const { client, isConnected, connect, disconnect } = useCAI();

  const handleClick = async () => {
    onClick?.();
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isConnected 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-green-500 hover:bg-green-600 text-white'
      } ${className}`}
    >
      {isConnected ? 'Disconnect' : 'Connect'}
    </button>
  );
}; 