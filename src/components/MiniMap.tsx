import React from 'react';
import { Player, Vehicle, NPC } from '../types/game';

interface MiniMapProps {
  player: Player;
  vehicles: Vehicle[];
  npcs: NPC[];
}

export const MiniMap: React.FC<MiniMapProps> = ({ player, vehicles, npcs }) => {
  const mapScale = 0.15; // Scale factor for the minimap
  const mapSize = 120; // Size of the minimap in pixels

  const scalePosition = (x: number, y: number) => ({
    x: (x * mapScale),
    y: (y * mapScale)
  });

  return (
    <div className="absolute bottom-4 right-4 z-40">
      <div className="gta-hud rounded-lg overflow-hidden">
        {/* Minimap Header */}
        <div className="bg-accent/20 px-3 py-1 text-center">
          <span className="font-orbitron text-xs text-accent">RADAR</span>
        </div>
        
        {/* Minimap Canvas */}
        <div 
          className="relative bg-black/60"
          style={{ width: `${mapSize}px`, height: `${mapSize}px` }}
        >
          {/* Grid lines */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-1 h-1 bg-accent rounded-full" />
            <div className="absolute -top-2 -left-2 w-5 h-5 border border-accent/50 rounded-full" />
          </div>
          
          {/* Vehicles */}
          {vehicles.map(vehicle => {
            const pos = scalePosition(
              vehicle.x - player.x + mapSize/2, 
              vehicle.y - player.y + mapSize/2
            );
            
            // Only show if within minimap bounds
            if (pos.x < 0 || pos.x > mapSize || pos.y < 0 || pos.y > mapSize) return null;
            
            return (
              <div
                key={vehicle.id}
                className="absolute w-1.5 h-1.5 bg-blue-400 rounded-sm transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`
                }}
              />
            );
          })}
          
          {/* NPCs */}
          {npcs.map(npc => {
            const pos = scalePosition(
              npc.x - player.x + mapSize/2, 
              npc.y - player.y + mapSize/2
            );
            
            // Only show if within minimap bounds
            if (pos.x < 0 || pos.x > mapSize || pos.y < 0 || pos.y > mapSize) return null;
            
            const npcColor = npc.type === 'police' ? 'bg-red-500' : 
                           npc.type === 'gang' ? 'bg-orange-500' : 'bg-white';
            
            return (
              <div
                key={npc.id}
                className={`absolute w-1 h-1 ${npcColor} rounded-full transform -translate-x-1/2 -translate-y-1/2`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`
                }}
              />
            );
          })}
          
          {/* Player indicator (always in center) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            {/* Direction indicator */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-accent" />
          </div>
          
          {/* Compass */}
          <div className="absolute top-1 right-1 text-xs font-orbitron text-accent">
            N
          </div>
          <div className="absolute bottom-1 right-1 text-xs font-orbitron text-accent/60">
            S
          </div>
          <div className="absolute top-1/2 left-1 transform -translate-y-1/2 text-xs font-orbitron text-accent/60">
            W
          </div>
          <div className="absolute top-1/2 right-1 transform -translate-y-1/2 text-xs font-orbitron text-accent/60">
            E
          </div>
        </div>
        
        {/* Legend */}
        <div className="bg-accent/10 px-2 py-1 text-xs font-rajdhani">
          <div className="flex justify-between items-center">
            <span className="text-accent">●</span>
            <span>You</span>
            <span className="text-blue-400">■</span>
            <span>Cars</span>
            <span className="text-white">●</span>
            <span>NPCs</span>
          </div>
        </div>
      </div>
    </div>
  );
};