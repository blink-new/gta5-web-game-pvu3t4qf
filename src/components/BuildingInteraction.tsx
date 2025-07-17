import React, { useState, useEffect } from 'react';
import { Building, Player, GameState } from '../types/game';

interface BuildingInteractionProps {
  gameState: GameState;
  onMoneyChange: (amount: number) => void;
  onHealthChange: (amount: number) => void;
  onWantedLevelChange: (change: number) => void;
}

interface InteractionDialog {
  building: Building;
  type: 'store' | 'bank' | 'hospital' | 'police_station';
}

export const BuildingInteraction: React.FC<BuildingInteractionProps> = ({
  gameState,
  onMoneyChange,
  onHealthChange,
  onWantedLevelChange
}) => {
  const [nearbyBuilding, setNearbyBuilding] = useState<Building | null>(null);
  const [showInteraction, setShowInteraction] = useState<InteractionDialog | null>(null);
  const [isRobbing, setIsRobbing] = useState(false);
  const [robberyProgress, setRobberyProgress] = useState(0);

  // Check for nearby buildings
  useEffect(() => {
    const checkNearbyBuildings = () => {
      let closest: Building | null = null;
      let closestDistance = Infinity;

      gameState.buildings.forEach(building => {
        if (!building.interactable) return;

        const distance = Math.sqrt(
          Math.pow(gameState.player.x - (building.x + building.width / 2), 2) + 
          Math.pow(gameState.player.y - (building.y + building.height / 2), 2)
        );

        if (distance < 50 && distance < closestDistance) {
          closest = building;
          closestDistance = distance;
        }
      });

      setNearbyBuilding(closest);
    };

    checkNearbyBuildings();
  }, [gameState.player.x, gameState.player.y, gameState.buildings]);

  // Handle E key for interaction
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'e' && nearbyBuilding && !showInteraction) {
        setShowInteraction({
          building: nearbyBuilding,
          type: nearbyBuilding.type
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nearbyBuilding, showInteraction]);

  // Robbery progress
  useEffect(() => {
    if (!isRobbing) return;

    const interval = setInterval(() => {
      setRobberyProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          setIsRobbing(false);
          setShowInteraction(null);
          
          // Complete robbery
          const robbedAmount = Math.floor(Math.random() * 500) + 200;
          onMoneyChange(robbedAmount);
          onWantedLevelChange(2); // Increase wanted level significantly
          
          return 0;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isRobbing, onMoneyChange, onWantedLevelChange]);

  const handleStoreInteraction = (action: string) => {
    switch (action) {
      case 'buy_health':
        if (gameState.player.money >= 100) {
          onMoneyChange(-100);
          onHealthChange(50);
          setShowInteraction(null);
        }
        break;
      case 'buy_ammo':
        if (gameState.player.money >= 50) {
          onMoneyChange(-50);
          // Add ammo logic here
          setShowInteraction(null);
        }
        break;
      case 'rob':
        setIsRobbing(true);
        setRobberyProgress(0);
        break;
    }
  };

  const handleBankInteraction = (action: string) => {
    switch (action) {
      case 'deposit':
        // Bank deposit logic
        setShowInteraction(null);
        break;
      case 'withdraw':
        // Bank withdrawal logic
        setShowInteraction(null);
        break;
      case 'rob':
        if (gameState.player.wantedLevel < 3) {
          setIsRobbing(true);
          setRobberyProgress(0);
        }
        break;
    }
  };

  const handleHospitalInteraction = (action: string) => {
    switch (action) {
      case 'heal':
        if (gameState.player.money >= 200) {
          onMoneyChange(-200);
          onHealthChange(100 - gameState.player.health); // Full heal
          setShowInteraction(null);
        }
        break;
      case 'emergency':
        // Free emergency heal if health is very low
        if (gameState.player.health <= 20) {
          onHealthChange(50);
          setShowInteraction(null);
        }
        break;
    }
  };

  const handlePoliceStationInteraction = (action: string) => {
    switch (action) {
      case 'surrender':
        if (gameState.player.wantedLevel > 0) {
          onWantedLevelChange(-gameState.player.wantedLevel); // Clear wanted level
          onMoneyChange(-Math.min(gameState.player.money * 0.1, 500)); // Fine
          setShowInteraction(null);
        }
        break;
      case 'leave':
        setShowInteraction(null);
        break;
    }
  };

  const renderStoreDialog = (building: Building) => (
    <div className="gta-hud p-6 rounded-lg max-w-md">
      <h3 className="gta-title text-xl mb-4">{building.name}</h3>
      <p className="text-sm font-rajdhani text-muted-foreground mb-4">
        Welcome to {building.name}! What can we do for you?
      </p>
      
      <div className="space-y-3">
        <button
          className="gta-button w-full p-3 rounded text-left"
          onClick={() => handleStoreInteraction('buy_health')}
          disabled={gameState.player.money < 100}
        >
          <div className="flex justify-between">
            <span>Buy Health Pack</span>
            <span className="text-green-500">$100</span>
          </div>
          <div className="text-xs text-muted-foreground">Restore 50 health</div>
        </button>
        
        <button
          className="gta-button w-full p-3 rounded text-left"
          onClick={() => handleStoreInteraction('buy_ammo')}
          disabled={gameState.player.money < 50}
        >
          <div className="flex justify-between">
            <span>Buy Ammo</span>
            <span className="text-green-500">$50</span>
          </div>
          <div className="text-xs text-muted-foreground">Refill current weapon</div>
        </button>
        
        <button
          className="bg-red-600 hover:bg-red-700 text-white w-full p-3 rounded text-left transition-colors"
          onClick={() => handleStoreInteraction('rob')}
        >
          <div className="flex justify-between">
            <span>🔫 Rob Store</span>
            <span className="text-red-300">+Wanted</span>
          </div>
          <div className="text-xs text-red-300">Illegal action - increases wanted level</div>
        </button>
      </div>
      
      <button
        className="mt-4 border border-accent/30 text-accent w-full p-2 rounded"
        onClick={() => setShowInteraction(null)}
      >
        Leave
      </button>
    </div>
  );

  const renderBankDialog = (building: Building) => (
    <div className="gta-hud p-6 rounded-lg max-w-md">
      <h3 className="gta-title text-xl mb-4">{building.name}</h3>
      <p className="text-sm font-rajdhani text-muted-foreground mb-4">
        Welcome to {building.name}. How can we assist you today?
      </p>
      
      <div className="space-y-3">
        <button
          className="gta-button w-full p-3 rounded text-left"
          onClick={() => handleBankInteraction('deposit')}
        >
          <span>💰 Deposit Money</span>
          <div className="text-xs text-muted-foreground">Secure your earnings</div>
        </button>
        
        <button
          className="gta-button w-full p-3 rounded text-left"
          onClick={() => handleBankInteraction('withdraw')}
        >
          <span>💳 Withdraw Money</span>
          <div className="text-xs text-muted-foreground">Access your funds</div>
        </button>
        
        <button
          className="bg-red-600 hover:bg-red-700 text-white w-full p-3 rounded text-left transition-colors"
          onClick={() => handleBankInteraction('rob')}
          disabled={gameState.player.wantedLevel >= 3}
        >
          <div className="flex justify-between">
            <span>🔫 Rob Bank</span>
            <span className="text-red-300">High Risk</span>
          </div>
          <div className="text-xs text-red-300">
            {gameState.player.wantedLevel >= 3 ? 'Too much heat!' : 'Massive wanted level increase'}
          </div>
        </button>
      </div>
      
      <button
        className="mt-4 border border-accent/30 text-accent w-full p-2 rounded"
        onClick={() => setShowInteraction(null)}
      >
        Leave
      </button>
    </div>
  );

  const renderHospitalDialog = (building: Building) => (
    <div className="gta-hud p-6 rounded-lg max-w-md">
      <h3 className="gta-title text-xl mb-4">{building.name}</h3>
      <p className="text-sm font-rajdhani text-muted-foreground mb-4">
        Medical assistance available. Current health: {gameState.player.health}%
      </p>
      
      <div className="space-y-3">
        <button
          className="gta-button w-full p-3 rounded text-left"
          onClick={() => handleHospitalInteraction('heal')}
          disabled={gameState.player.money < 200 || gameState.player.health >= 100}
        >
          <div className="flex justify-between">
            <span>🏥 Full Medical Treatment</span>
            <span className="text-green-500">$200</span>
          </div>
          <div className="text-xs text-muted-foreground">Restore to 100% health</div>
        </button>
        
        {gameState.player.health <= 20 && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white w-full p-3 rounded text-left transition-colors"
            onClick={() => handleHospitalInteraction('emergency')}
          >
            <span>🚑 Emergency Treatment</span>
            <div className="text-xs text-green-300">Free emergency care (critical condition)</div>
          </button>
        )}
      </div>
      
      <button
        className="mt-4 border border-accent/30 text-accent w-full p-2 rounded"
        onClick={() => setShowInteraction(null)}
      >
        Leave
      </button>
    </div>
  );

  const renderPoliceStationDialog = (building: Building) => (
    <div className="gta-hud p-6 rounded-lg max-w-md">
      <h3 className="gta-title text-xl mb-4">{building.name}</h3>
      <p className="text-sm font-rajdhani text-muted-foreground mb-4">
        Los Santos Police Department. Current wanted level: {gameState.player.wantedLevel} stars
      </p>
      
      <div className="space-y-3">
        {gameState.player.wantedLevel > 0 ? (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white w-full p-3 rounded text-left transition-colors"
            onClick={() => handlePoliceStationInteraction('surrender')}
          >
            <div className="flex justify-between">
              <span>🚔 Turn Yourself In</span>
              <span className="text-blue-300">-${Math.min(gameState.player.money * 0.1, 500)}</span>
            </div>
            <div className="text-xs text-blue-300">Clear wanted level, pay fine</div>
          </button>
        ) : (
          <div className="text-center text-green-500 p-3">
            ✅ No outstanding warrants
          </div>
        )}
      </div>
      
      <button
        className="mt-4 border border-accent/30 text-accent w-full p-2 rounded"
        onClick={() => handlePoliceStationInteraction('leave')}
      >
        Leave
      </button>
    </div>
  );

  return (
    <>
      {/* Building interaction prompt */}
      {nearbyBuilding && !showInteraction && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40">
          <div className="gta-hud px-4 py-2 rounded-lg text-center">
            <div className="font-rajdhani text-accent">
              Press E to enter {nearbyBuilding.name}
            </div>
          </div>
        </div>
      )}

      {/* Interaction dialog */}
      {showInteraction && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          {showInteraction.type === 'store' && renderStoreDialog(showInteraction.building)}
          {showInteraction.type === 'bank' && renderBankDialog(showInteraction.building)}
          {showInteraction.type === 'hospital' && renderHospitalDialog(showInteraction.building)}
          {showInteraction.type === 'police_station' && renderPoliceStationDialog(showInteraction.building)}
        </div>
      )}

      {/* Robbery progress */}
      {isRobbing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="gta-hud p-6 rounded-lg text-center">
            <h3 className="gta-title text-xl mb-4 text-red-500">ROBBERY IN PROGRESS</h3>
            <div className="w-64 h-4 bg-red-900 rounded mb-4">
              <div 
                className="h-full bg-red-500 rounded transition-all duration-200"
                style={{ width: `${robberyProgress}%` }}
              />
            </div>
            <div className="text-sm font-rajdhani text-muted-foreground">
              {robberyProgress < 100 ? 'Collecting money...' : 'Escape!'}
            </div>
          </div>
        </div>
      )}

      {/* Buildings on map */}
      {gameState.buildings.map(building => (
        <div
          key={building.id}
          className={`absolute border-2 transition-colors ${
            nearbyBuilding?.id === building.id 
              ? 'border-accent bg-accent/20' 
              : 'border-accent/30 bg-gray-800/50'
          }`}
          style={{
            left: `${building.x}px`,
            top: `${building.y}px`,
            width: `${building.width}px`,
            height: `${building.height}px`
          }}
        >
          {/* Building label */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-rajdhani text-accent text-center whitespace-nowrap">
            {building.name}
          </div>
          
          {/* Building type icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
            {building.type === 'store' && '🏪'}
            {building.type === 'bank' && '🏦'}
            {building.type === 'hospital' && '🏥'}
            {building.type === 'police_station' && '🚔'}
          </div>
        </div>
      ))}
    </>
  );
};