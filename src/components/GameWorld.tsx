import React, { useEffect, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Player } from './Player';
import { Vehicle } from './Vehicle';
import { NPC } from './NPC';
import { HUD } from './HUD';
import { MiniMap } from './MiniMap';
import { Controls } from './Controls';

export const GameWorld: React.FC = () => {
  const {
    gameState,
    movePlayer,
    enterVehicle,
    exitVehicle,
    togglePause,
    addMoney,
    increaseWantedLevel
  } = useGameState();

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState.isPaused) return;

    const speed = gameState.player.currentVehicle ? 8 : 4;
    
    switch (event.key.toLowerCase()) {
      case 'w':
        movePlayer(0, -speed);
        break;
      case 's':
        movePlayer(0, speed);
        break;
      case 'a':
        movePlayer(-speed, 0);
        break;
      case 'd':
        movePlayer(speed, 0);
        break;
      case 'f':
        // Enter/Exit vehicle
        if (gameState.player.currentVehicle) {
          exitVehicle();
        } else {
          const nearbyVehicle = gameState.vehicles.find(vehicle => {
            const distance = Math.sqrt(
              Math.pow(gameState.player.x - vehicle.x, 2) + 
              Math.pow(gameState.player.y - vehicle.y, 2)
            );
            return distance < 30;
          });
          if (nearbyVehicle) {
            enterVehicle(nearbyVehicle.id);
          }
        }
        break;
      case 'escape':
        togglePause();
        break;
      case 'r':
        // Test: Add money
        addMoney(100);
        break;
      case 't':
        // Test: Increase wanted level
        increaseWantedLevel();
        break;
    }
  }, [gameState, movePlayer, enterVehicle, exitVehicle, togglePause, addMoney, increaseWantedLevel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="game-world h-screen w-screen relative overflow-hidden">
      {/* Game Canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {/* City Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Buildings/Environment */}
        <div className="absolute top-20 left-20 w-32 h-24 bg-gray-700 border border-accent/30" />
        <div className="absolute top-40 right-32 w-28 h-32 bg-gray-600 border border-accent/30" />
        <div className="absolute bottom-32 left-40 w-36 h-20 bg-gray-800 border border-accent/30" />
        <div className="absolute bottom-20 right-20 w-24 h-28 bg-gray-700 border border-accent/30" />
        
        {/* Roads */}
        <div className="absolute top-0 left-1/2 w-2 h-full bg-yellow-400 opacity-50" />
        <div className="absolute left-0 top-1/2 w-full h-2 bg-yellow-400 opacity-50" />
        
        {/* Vehicles */}
        {gameState.vehicles.map(vehicle => (
          <Vehicle key={vehicle.id} vehicle={vehicle} />
        ))}
        
        {/* NPCs */}
        {gameState.npcs.map(npc => (
          <NPC key={npc.id} npc={npc} />
        ))}
        
        {/* Player */}
        <Player 
          player={gameState.player} 
          isInVehicle={!!gameState.player.currentVehicle}
        />
      </div>

      {/* UI Overlay */}
      <HUD 
        player={gameState.player}
        gameTime={gameState.gameTime}
        isPaused={gameState.isPaused}
        currentMission={gameState.missions.find(m => m.active)}
      />
      
      {gameState.showMiniMap && (
        <MiniMap 
          player={gameState.player}
          vehicles={gameState.vehicles}
          npcs={gameState.npcs}
        />
      )}
      
      <Controls />
      
      {/* Pause Menu */}
      {gameState.isPaused && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="gta-hud p-8 rounded-lg">
            <h2 className="gta-title text-4xl mb-6 text-center">GAME PAUSED</h2>
            <div className="space-y-4 text-center">
              <button 
                className="gta-button px-6 py-3 rounded block mx-auto"
                onClick={togglePause}
              >
                Resume Game
              </button>
              <button className="gta-button px-6 py-3 rounded block mx-auto">
                Settings
              </button>
              <button className="gta-button px-6 py-3 rounded block mx-auto">
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};