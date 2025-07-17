import React, { useEffect, useCallback, useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Player } from './Player';
import { Vehicle } from './Vehicle';
import { NPC } from './NPC';
import { HUD } from './HUD';
import { MiniMap } from './MiniMap';
import { Controls } from './Controls';
import { Game3D } from './Game3D';
import { MissionSystem } from './MissionSystem';
import { CombatSystem } from './CombatSystem';
import { BuildingInteraction } from './BuildingInteraction';
import { NotificationSystem, useNotifications, createGameNotifications } from './NotificationSystem';

export const GameWorld: React.FC = () => {
  const {
    gameState,
    movePlayer,
    enterVehicle,
    exitVehicle,
    togglePause,
    addMoney,
    increaseWantedLevel,
    decreaseWantedLevel,
    damageNPC,
    damagePlayer,
    healPlayer,
    completeMission,
    startMission
  } = useGameState();

  const [is3DMode, setIs3DMode] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotifications();
  const gameNotifications = createGameNotifications(addNotification);

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
            handleVehicleEnter(nearbyVehicle.id);
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
      case 'v':
        // Toggle 3D/2D view
        setIs3DMode(prev => !prev);
        break;
    }
  }, [gameState, movePlayer, handleVehicleEnter, exitVehicle, togglePause, addMoney, increaseWantedLevel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Monitor game events for notifications
  useEffect(() => {
    // Check for low health
    if (gameState.player.health <= 20 && gameState.player.health > 0) {
      gameNotifications.healthLow();
    }
  }, [gameState.player.health, gameNotifications]);

  // Enhanced mission completion with notifications
  const handleMissionComplete = useCallback((missionId: string, reward: number) => {
    const mission = gameState.missions.find(m => m.id === missionId);
    if (mission) {
      gameNotifications.missionComplete(mission.title, reward);
    }
    completeMission(missionId, reward);
  }, [gameState.missions, gameNotifications, completeMission]);

  // Enhanced wanted level changes with notifications
  const handleWantedLevelIncrease = useCallback(() => {
    const newLevel = gameState.player.wantedLevel + 1;
    increaseWantedLevel();
    gameNotifications.wantedLevelIncrease(newLevel);
  }, [gameState.player.wantedLevel, increaseWantedLevel, gameNotifications]);

  const handleWantedLevelDecrease = useCallback(() => {
    if (gameState.player.wantedLevel === 1) {
      gameNotifications.wantedLevelCleared();
    }
    decreaseWantedLevel();
  }, [gameState.player.wantedLevel, decreaseWantedLevel, gameNotifications]);

  // Enhanced vehicle interaction with notifications
  const handleVehicleEnter = useCallback((vehicleId: string) => {
    const vehicle = gameState.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      gameNotifications.vehicleEntered(vehicle.type);
    }
    enterVehicle(vehicleId);
  }, [gameState.vehicles, gameNotifications, enterVehicle]);

  return (
    <div className="game-world h-screen w-screen relative overflow-hidden">
      {/* 3D Mode */}
      {is3DMode ? (
        <Game3D 
          gameState={gameState}
          onPlayerMove={movePlayer}
          onVehicleInteraction={enterVehicle}
        />
      ) : (
        /* 2D Mode - Game Canvas */
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
      )}

      {/* UI Overlay */}
      <HUD 
        player={gameState.player}
        gameTime={gameState.gameTime}
        isPaused={gameState.isPaused}
        currentMission={gameState.missions.find(m => m.active)}
      />
      
      {/* 3D Mode Indicator */}
      <div className="absolute top-4 right-4 z-50">
        <div className="gta-hud px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${is3DMode ? 'bg-accent' : 'bg-gray-500'}`} />
            <span className="font-rajdhani text-sm font-bold">
              {is3DMode ? '3D MODE' : '2D MODE'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Press V to toggle
          </div>
        </div>
      </div>
      
      {gameState.showMiniMap && (
        <MiniMap 
          player={gameState.player}
          vehicles={gameState.vehicles}
          npcs={gameState.npcs}
        />
      )}
      
      <Controls />
      
      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      {/* Mission System */}
      <MissionSystem
        gameState={gameState}
        onMissionComplete={handleMissionComplete}
        onMissionStart={startMission}
      />
      
      {/* Combat System */}
      <CombatSystem
        gameState={gameState}
        onNPCDamage={damageNPC}
        onPlayerDamage={damagePlayer}
        onWantedLevelChange={handleWantedLevelIncrease}
      />
      
      {/* Building Interaction */}
      <BuildingInteraction
        gameState={gameState}
        onMoneyChange={(amount) => {
          addMoney(amount);
          if (amount > 0) {
            gameNotifications.moneyEarned(amount, 'transaction');
          }
        }}
        onHealthChange={healPlayer}
        onWantedLevelChange={(change) => {
          if (change > 0) {
            handleWantedLevelIncrease();
          } else {
            handleWantedLevelDecrease();
          }
        }}
      />
      
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