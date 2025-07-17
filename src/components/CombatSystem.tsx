import React, { useState, useEffect, useCallback } from 'react';
import { Player, NPC, GameState } from '../types/game';

interface CombatSystemProps {
  gameState: GameState;
  onNPCDamage: (npcId: string, damage: number) => void;
  onPlayerDamage: (damage: number) => void;
  onWantedLevelChange: (change: number) => void;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  fromPlayer: boolean;
}

export const CombatSystem: React.FC<CombatSystemProps> = ({
  gameState,
  onNPCDamage,
  onPlayerDamage,
  onWantedLevelChange
}) => {
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [lastShotTime, setLastShotTime] = useState(0);
  const [isAiming, setIsAiming] = useState(false);
  const [aimTarget, setAimTarget] = useState<{ x: number; y: number } | null>(null);

  // Handle mouse click for shooting
  const handleMouseClick = useCallback((event: MouseEvent) => {
    if (gameState.isPaused) return;
    
    const currentTime = Date.now();
    const weapon = gameState.player.weapons[gameState.player.currentWeapon];
    
    if (!weapon || weapon.ammo <= 0) return;
    if (currentTime - lastShotTime < 500) return; // Rate limit
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const targetX = event.clientX - rect.left;
    const targetY = event.clientY - rect.top;
    
    // Create bullet
    const bullet: Bullet = {
      id: `bullet_${currentTime}`,
      x: gameState.player.x,
      y: gameState.player.y,
      targetX,
      targetY,
      speed: 10,
      damage: weapon.damage,
      fromPlayer: true
    };
    
    setBullets(prev => [...prev, bullet]);
    setLastShotTime(currentTime);
    
    // Increase wanted level for shooting
    onWantedLevelChange(1);
    
    // Reduce ammo (if not infinite)
    if (weapon.ammo !== Infinity) {
      // This would be handled by the parent component
    }
  }, [gameState, lastShotTime, onWantedLevelChange]);

  // Handle right-click for aiming
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (event.button === 2) { // Right click
      event.preventDefault();
      setIsAiming(true);
      
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setAimTarget({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }, []);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (event.button === 2) { // Right click
      setIsAiming(false);
      setAimTarget(null);
    }
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isAiming) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setAimTarget({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }, [isAiming]);

  // Add event listeners
  useEffect(() => {
    const gameElement = document.querySelector('.game-world');
    if (!gameElement) return;

    gameElement.addEventListener('click', handleMouseClick);
    gameElement.addEventListener('mousedown', handleMouseDown);
    gameElement.addEventListener('mouseup', handleMouseUp);
    gameElement.addEventListener('mousemove', handleMouseMove);
    gameElement.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      gameElement.removeEventListener('click', handleMouseClick);
      gameElement.removeEventListener('mousedown', handleMouseDown);
      gameElement.removeEventListener('mouseup', handleMouseUp);
      gameElement.removeEventListener('mousemove', handleMouseMove);
      gameElement.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [handleMouseClick, handleMouseDown, handleMouseUp, handleMouseMove]);

  // NPC AI - Police and gang behavior
  useEffect(() => {
    if (gameState.isPaused) return;

    const interval = setInterval(() => {
      // Police chase behavior
      if (gameState.player.wantedLevel > 0) {
        gameState.npcs.forEach(npc => {
          if (npc.type === 'police' && npc.health > 0) {
            const distanceToPlayer = Math.sqrt(
              Math.pow(gameState.player.x - npc.x, 2) + 
              Math.pow(gameState.player.y - npc.y, 2)
            );

            // Police shoot at player if close enough
            if (distanceToPlayer < 150 && Math.random() < 0.3) {
              const bullet: Bullet = {
                id: `police_bullet_${Date.now()}_${npc.id}`,
                x: npc.x,
                y: npc.y,
                targetX: gameState.player.x,
                targetY: gameState.player.y,
                speed: 8,
                damage: 15,
                fromPlayer: false
              };
              
              setBullets(prev => [...prev, bullet]);
            }
          }
        });
      }

      // Gang behavior - shoot at player if wanted level is high
      if (gameState.player.wantedLevel >= 3) {
        gameState.npcs.forEach(npc => {
          if (npc.type === 'gang' && npc.health > 0) {
            const distanceToPlayer = Math.sqrt(
              Math.pow(gameState.player.x - npc.x, 2) + 
              Math.pow(gameState.player.y - npc.y, 2)
            );

            if (distanceToPlayer < 120 && Math.random() < 0.2) {
              const bullet: Bullet = {
                id: `gang_bullet_${Date.now()}_${npc.id}`,
                x: npc.x,
                y: npc.y,
                targetX: gameState.player.x,
                targetY: gameState.player.y,
                speed: 6,
                damage: 20,
                fromPlayer: false
              };
              
              setBullets(prev => [...prev, bullet]);
            }
          }
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Bullet physics and collision detection
  useEffect(() => {
    if (gameState.isPaused) return;

    const interval = setInterval(() => {
      setBullets(prev => {
        return prev.map(bullet => {
          const dx = bullet.targetX - bullet.x;
          const dy = bullet.targetY - bullet.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < bullet.speed) {
            // Bullet reached target, check for hits
            if (bullet.fromPlayer) {
              // Check if bullet hit any NPC
              gameState.npcs.forEach(npc => {
                const npcDistance = Math.sqrt(
                  Math.pow(bullet.targetX - npc.x, 2) + 
                  Math.pow(bullet.targetY - npc.y, 2)
                );
                
                if (npcDistance < 20 && npc.health > 0) {
                  onNPCDamage(npc.id, bullet.damage);
                }
              });
            } else {
              // Check if bullet hit player
              const playerDistance = Math.sqrt(
                Math.pow(bullet.targetX - gameState.player.x, 2) + 
                Math.pow(bullet.targetY - gameState.player.y, 2)
              );
              
              if (playerDistance < 20) {
                onPlayerDamage(bullet.damage);
              }
            }
            
            return null; // Remove bullet
          }
          
          // Move bullet towards target
          const moveX = (dx / distance) * bullet.speed;
          const moveY = (dy / distance) * bullet.speed;
          
          return {
            ...bullet,
            x: bullet.x + moveX,
            y: bullet.y + moveY
          };
        }).filter(Boolean) as Bullet[];
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, onNPCDamage, onPlayerDamage]);

  return (
    <>
      {/* Bullets */}
      {bullets.map(bullet => (
        <div
          key={bullet.id}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full shadow-lg"
          style={{
            left: `${bullet.x}px`,
            top: `${bullet.y}px`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 4px rgba(255, 255, 0, 0.8)'
          }}
        />
      ))}

      {/* Aiming crosshair */}
      {isAiming && aimTarget && (
        <div
          className="absolute pointer-events-none z-30"
          style={{
            left: `${aimTarget.x}px`,
            top: `${aimTarget.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-6 h-6 border-2 border-red-500 rounded-full">
            <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-red-500 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}

      {/* Aiming line */}
      {isAiming && aimTarget && (
        <svg
          className="absolute inset-0 pointer-events-none z-20"
          style={{ width: '100%', height: '100%' }}
        >
          <line
            x1={gameState.player.x}
            y1={gameState.player.y}
            x2={aimTarget.x}
            y2={aimTarget.y}
            stroke="rgba(255, 0, 0, 0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      )}

      {/* Combat Instructions */}
      <div className="absolute bottom-20 left-4 gta-hud p-3 rounded z-40">
        <div className="text-xs font-rajdhani space-y-1">
          <div>Left Click: Shoot</div>
          <div>Right Click: Aim</div>
          <div className="text-accent">
            Ammo: {gameState.player.weapons[gameState.player.currentWeapon]?.ammo === Infinity 
              ? '∞' 
              : gameState.player.weapons[gameState.player.currentWeapon]?.ammo || 0}
          </div>
        </div>
      </div>
    </>
  );
};