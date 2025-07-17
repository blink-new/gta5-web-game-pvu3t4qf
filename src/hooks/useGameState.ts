import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Vehicle, Mission, NPC, Building } from '../types/game';

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
    objectives: ['Move around using WASD', 'Find a vehicle (Press F near one)', 'Drive around for 10 seconds']
  },
  {
    id: 'mission2',
    title: 'First Score',
    description: 'Rob a convenience store to earn some quick cash.',
    reward: 1000,
    completed: false,
    active: false,
    objectives: ['Find the red convenience store', 'Enter the store (Press E)', 'Escape the police']
  },
  {
    id: 'mission3',
    title: 'Gang Territory',
    description: 'Clear out gang members from the territory.',
    reward: 1500,
    completed: false,
    active: false,
    objectives: ['Find gang members (red NPCs)', 'Eliminate 3 gang members', 'Survive the shootout']
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
  { id: 'npc3', type: 'civilian', x: 400, y: 500, health: 100 },
  { id: 'gang1', type: 'gang', x: 150, y: 450, health: 100 },
  { id: 'gang2', type: 'gang', x: 180, y: 480, health: 100 },
  { id: 'gang3', type: 'gang', x: 120, y: 420, health: 100 },
  { id: 'police1', type: 'police', x: 700, y: 100, health: 100 },
  { id: 'police2', type: 'police', x: 720, y: 120, health: 100 }
];

const initialBuildings: Building[] = [
  { id: 'store1', type: 'store', x: 100, y: 100, width: 80, height: 60, name: 'Rob\'s Liquor', interactable: true },
  { id: 'bank1', type: 'bank', x: 500, y: 150, width: 100, height: 80, name: 'Maze Bank', interactable: true },
  { id: 'hospital1', type: 'hospital', x: 300, y: 400, width: 120, height: 100, name: 'Central Medical', interactable: true },
  { id: 'police1', type: 'police_station', x: 650, y: 50, width: 100, height: 80, name: 'LSPD Station', interactable: true }
];

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: initialPlayer,
    vehicles: initialVehicles,
    npcs: initialNPCs,
    missions: initialMissions,
    buildings: initialBuildings,
    gameTime: 0,
    isPaused: false,
    showMiniMap: true,
    missionProgress: { mission1: 0 },
    policeChaseActive: false,
    lastShotTime: 0
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