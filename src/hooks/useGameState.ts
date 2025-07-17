import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Vehicle, Mission, NPC } from '../types/game';

const initialPlayer: Player = {
  id: 'player1',
  x: 400,
  y: 300,
  health: 100,
  money: 1000,
  wantedLevel: 0,
  weapons: [
    { id: 'fists', name: 'Fists', ammo: Infinity, damage: 10 },
    { id: 'pistol', name: 'Pistol', ammo: 50, damage: 25 }
  ],
  currentWeapon: 0
};

const initialMissions: Mission[] = [
  {
    id: 'mission1',
    title: 'Welcome to Los Santos',
    description: 'Get familiar with the controls and explore the city.',
    reward: 500,
    completed: false,
    active: true,
    objectives: ['Move around using WASD', 'Find a vehicle', 'Drive around the block']
  },
  {
    id: 'mission2',
    title: 'First Score',
    description: 'Rob a convenience store to earn some quick cash.',
    reward: 1000,
    completed: false,
    active: false,
    objectives: ['Find a convenience store', 'Enter the store', 'Escape the police']
  }
];

const initialVehicles: Vehicle[] = [
  { id: 'car1', type: 'car', x: 350, y: 250, speed: 5, health: 100, color: '#ff0000' },
  { id: 'car2', type: 'car', x: 500, y: 400, speed: 4, health: 100, color: '#0000ff' },
  { id: 'bike1', type: 'motorcycle', x: 300, y: 350, speed: 7, health: 60, color: '#000000' }
];

const initialNPCs: NPC[] = [
  { id: 'npc1', type: 'civilian', x: 200, y: 200, health: 100 },
  { id: 'npc2', type: 'civilian', x: 600, y: 300, health: 100 },
  { id: 'npc3', type: 'civilian', x: 400, y: 500, health: 100 }
];

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: initialPlayer,
    vehicles: initialVehicles,
    npcs: initialNPCs,
    missions: initialMissions,
    gameTime: 0,
    isPaused: false,
    showMiniMap: true
  });

  const movePlayer = useCallback((deltaX: number, deltaY: number) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        x: Math.max(0, Math.min(800, prev.player.x + deltaX)),
        y: Math.max(0, Math.min(600, prev.player.y + deltaY))
      }
    }));
  }, []);

  const enterVehicle = useCallback((vehicleId: string) => {
    setGameState(prev => {
      const vehicle = prev.vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return prev;

      const distance = Math.sqrt(
        Math.pow(prev.player.x - vehicle.x, 2) + 
        Math.pow(prev.player.y - vehicle.y, 2)
      );

      if (distance < 30) {
        return {
          ...prev,
          player: {
            ...prev.player,
            currentVehicle: vehicle,
            x: vehicle.x,
            y: vehicle.y
          }
        };
      }
      return prev;
    });
  }, []);

  const exitVehicle = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        currentVehicle: undefined
      }
    }));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  const addMoney = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        money: prev.player.money + amount
      }
    }));
  }, []);

  const increaseWantedLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        wantedLevel: Math.min(5, prev.player.wantedLevel + 1)
      }
    }));
  }, []);

  const decreaseWantedLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        wantedLevel: Math.max(0, prev.player.wantedLevel - 1)
      }
    }));
  }, []);

  // Game loop for time progression
  useEffect(() => {
    if (gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        gameTime: prev.gameTime + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPaused]);

  return {
    gameState,
    movePlayer,
    enterVehicle,
    exitVehicle,
    togglePause,
    addMoney,
    increaseWantedLevel,
    decreaseWantedLevel
  };
};