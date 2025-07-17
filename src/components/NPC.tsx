import React from 'react';
import { NPC as NPCType } from '../types/game';

interface NPCProps {
  npc: NPCType;
}

export const NPC: React.FC<NPCProps> = ({ npc }) => {
  const getNPCColor = () => {
    switch (npc.type) {
      case 'police':
        return 'bg-blue-600';
      case 'gang':
        return 'bg-red-600';
      default:
        return 'bg-green-600';
    }
  };

  const getNPCIcon = () => {
    switch (npc.type) {
      case 'police':
        return '👮';
      case 'gang':
        return '🔫';
      default:
        return '👤';
    }
  };

  return (
    <div
      className="absolute transition-all duration-300 ease-linear"
      style={{
        left: `${npc.x}px`,
        top: `${npc.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* NPC character */}
      <div className="relative">
        {/* Body */}
        <div className={`w-3 h-5 ${getNPCColor()} rounded-sm border border-accent/30`}>
          {/* Head */}
          <div className="w-2 h-2 bg-yellow-100 rounded-full mx-auto -mt-0.5 border border-accent/30" />
        </div>
        
        {/* Type indicator */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs">
          {getNPCIcon()}
        </div>
        
        {/* Health indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-0.5 bg-red-600 rounded">
            <div 
              className="h-full bg-green-500 rounded transition-all duration-300"
              style={{ width: `${npc.health}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};