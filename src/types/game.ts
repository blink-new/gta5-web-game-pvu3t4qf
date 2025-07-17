export interface Player {
  id: string;
  x: number;
  y: number;
  health: number;
  money: number;
  wantedLevel: number;
  currentVehicle?: Vehicle;
  weapons: Weapon[];
  currentWeapon: number;
}

export interface Vehicle {
  id: string;
  type: 'car' | 'motorcycle' | 'truck';
  x: number;
  y: number;
  speed: number;
  health: number;
  color: string;
}

export interface Weapon {
  id: string;
  name: string;
  ammo: number;
  damage: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  active: boolean;
  objectives: string[];
}

export interface NPC {
  id: string;
  x: number;
  y: number;
  type: 'civilian' | 'police' | 'gang';
  health: number;
}

export interface Building {
  id: string;
  type: 'store' | 'bank' | 'police_station' | 'hospital';
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  interactable: boolean;
}

export interface GameState {
  player: Player;
  vehicles: Vehicle[];
  npcs: NPC[];
  missions: Mission[];
  buildings: Building[];
  gameTime: number;
  isPaused: boolean;
  showMiniMap: boolean;
  missionProgress: { [missionId: string]: number };
  policeChaseActive: boolean;
  lastShotTime: number;
}