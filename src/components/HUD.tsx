import React from 'react';
import { Player, Mission } from '../types/game';

interface HUDProps {
  player: Player;
  gameTime: number;
  isPaused: boolean;
  currentMission?: Mission;
}

export const HUD: React.FC<HUDProps> = ({ player, gameTime, isPaused, currentMission }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600) % 24;
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getWantedStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`text-lg ${i < player.wantedLevel ? 'text-red-500' : 'text-gray-600'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40">
        {/* Player Stats */}
        <div className="gta-hud p-4 rounded-lg">
          <div className="space-y-2">
            {/* Health */}
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-lg">❤️</span>
              <div className="w-24 h-3 bg-red-900 rounded">
                <div 
                  className="h-full bg-red-500 rounded transition-all duration-300"
                  style={{ width: `${player.health}%` }}
                />
              </div>
              <span className="text-sm font-rajdhani">{player.health}</span>
            </div>
            
            {/* Money */}
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-lg">💰</span>
              <span className="font-orbitron text-lg text-accent">
                ${player.money.toLocaleString()}
              </span>
            </div>
            
            {/* Wanted Level */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-rajdhani">WANTED:</span>
              <div className="flex">
                {getWantedStars()}
              </div>
            </div>
          </div>
        </div>

        {/* Game Time */}
        <div className="gta-hud p-4 rounded-lg">
          <div className="text-center">
            <div className="font-orbitron text-2xl text-accent">
              {formatTime(gameTime)}
            </div>
            <div className="text-xs font-rajdhani text-muted-foreground">
              LOS SANTOS TIME
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-40">
        {/* Weapon Info */}
        <div className="gta-hud p-4 rounded-lg">
          <div className="text-center">
            <div className="font-rajdhani text-lg text-accent">
              {player.weapons[player.currentWeapon]?.name || 'Unarmed'}
            </div>
            <div className="text-sm text-muted-foreground">
              {player.weapons[player.currentWeapon]?.ammo === Infinity 
                ? '∞' 
                : player.weapons[player.currentWeapon]?.ammo || 0
              }
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        {player.currentVehicle && (
          <div className="gta-hud p-4 rounded-lg">
            <div className="text-center">
              <div className="font-rajdhani text-lg text-accent capitalize">
                {player.currentVehicle.type}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm">Health:</span>
                <div className="w-16 h-2 bg-red-900 rounded">
                  <div 
                    className="h-full bg-green-500 rounded transition-all duration-300"
                    style={{ width: `${player.currentVehicle.health}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mission Info */}
      {currentMission && (
        <div className="absolute top-4 right-4 w-80 z-40">
          <div className="gta-hud p-4 rounded-lg">
            <h3 className="font-orbitron text-lg text-accent mb-2">
              {currentMission.title}
            </h3>
            <p className="text-sm font-rajdhani text-muted-foreground mb-3">
              {currentMission.description}
            </p>
            <div className="space-y-1">
              {currentMission.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <span className="text-accent">•</span>
                  <span className="font-rajdhani">{objective}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <span className="text-green-500 font-orbitron">
                ${currentMission.reward}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pause Indicator */}
      {isPaused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="gta-title text-6xl animate-pulse">
            PAUSED
          </div>
        </div>
      )}
    </>
  );
};