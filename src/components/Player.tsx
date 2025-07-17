import React from 'react';
import { Player as PlayerType } from '../types/game';

interface PlayerProps {
  player: PlayerType;
  isInVehicle: boolean;
}

export const Player: React.FC<PlayerProps> = ({ player, isInVehicle }) => {
  if (isInVehicle && player.currentVehicle) {
    // Player is in vehicle, render the vehicle instead
    return (
      <div
        className="absolute transition-all duration-100 ease-linear"
        style={{
          left: `${player.x}px`,
          top: `${player.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div 
          className="w-8 h-12 rounded-sm border-2 border-accent shadow-lg"
          style={{ backgroundColor: player.currentVehicle.color }}
        >
          {/* Vehicle windows */}
          <div className="w-6 h-3 bg-blue-200 opacity-60 mx-auto mt-1 rounded-sm" />
          <div className="w-6 h-3 bg-blue-200 opacity-60 mx-auto mt-1 rounded-sm" />
        </div>
        {/* Player indicator in vehicle */}
        <div className="absolute -top-2 -right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
      </div>
    );
  }

  // Player on foot
  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        left: `${player.x}px`,
        top: `${player.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Player character */}
      <div className="relative">
        {/* Body */}
        <div className="w-4 h-6 bg-blue-600 rounded-sm border border-accent">
          {/* Head */}
          <div className="w-3 h-3 bg-yellow-200 rounded-full mx-auto -mt-1 border border-accent" />
        </div>
        
        {/* Health indicator */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-1 bg-red-600 rounded">
            <div 
              className="h-full bg-green-500 rounded transition-all duration-300"
              style={{ width: `${player.health}%` }}
            />
          </div>
        </div>
        
        {/* Weapon indicator */}
        {player.weapons[player.currentWeapon] && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="text-xs text-accent font-rajdhani font-bold">
              {player.weapons[player.currentWeapon].name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};