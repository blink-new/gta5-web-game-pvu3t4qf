import React, { useState, useEffect } from 'react';
import { Mission, Player, GameState } from '../types/game';

interface MissionSystemProps {
  gameState: GameState;
  onMissionComplete: (missionId: string, reward: number) => void;
  onMissionStart: (missionId: string) => void;
}

export const MissionSystem: React.FC<MissionSystemProps> = ({
  gameState,
  onMissionComplete,
  onMissionStart
}) => {
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionProgress, setMissionProgress] = useState<{ [key: string]: number }>({});

  const activeMission = gameState.missions.find(m => m.active);
  const availableMissions = gameState.missions.filter(m => !m.completed && !m.active);

  // Check mission progress
  useEffect(() => {
    if (!activeMission) return;

    const checkMissionProgress = () => {
      switch (activeMission.id) {
        case 'mission1':
          // Welcome mission - check if player has moved and entered a vehicle
          const hasMovedEnough = Math.abs(gameState.player.x - 400) > 50 || Math.abs(gameState.player.y - 300) > 50;
          const hasEnteredVehicle = gameState.player.currentVehicle !== undefined;
          
          let progress = 0;
          if (hasMovedEnough) progress = 1;
          if (hasEnteredVehicle) progress = 2;
          if (hasEnteredVehicle && hasMovedEnough) progress = 3;
          
          setMissionProgress(prev => ({ ...prev, [activeMission.id]: progress }));
          
          if (progress >= 3) {
            onMissionComplete(activeMission.id, activeMission.reward);
          }
          break;

        case 'mission2':
          // Store robbery mission - check if player is near the store
          const storeDistance = Math.sqrt(
            Math.pow(gameState.player.x - 100, 2) + 
            Math.pow(gameState.player.y - 100, 2)
          );
          
          if (storeDistance < 40) {
            setMissionProgress(prev => ({ ...prev, [activeMission.id]: 1 }));
            // Simulate robbery completion after 3 seconds near store
            setTimeout(() => {
              onMissionComplete(activeMission.id, activeMission.reward);
            }, 3000);
          }
          break;

        case 'mission3':
          // Gang territory mission - check eliminated gang members
          const aliveGangMembers = gameState.npcs.filter(npc => npc.type === 'gang' && npc.health > 0);
          const eliminatedCount = 3 - aliveGangMembers.length;
          
          setMissionProgress(prev => ({ ...prev, [activeMission.id]: eliminatedCount }));
          
          if (eliminatedCount >= 3) {
            onMissionComplete(activeMission.id, activeMission.reward);
          }
          break;
      }
    };

    checkMissionProgress();
  }, [gameState.player, gameState.npcs, activeMission, onMissionComplete]);

  const startMission = (mission: Mission) => {
    onMissionStart(mission.id);
    setShowMissionDialog(false);
    setSelectedMission(null);
  };

  const getMissionProgressText = (mission: Mission) => {
    const progress = missionProgress[mission.id] || 0;
    
    switch (mission.id) {
      case 'mission1':
        const objectives = [
          'Move around using WASD ✓',
          'Find a vehicle (Press F near one) ✓',
          'Drive around for 10 seconds ✓'
        ];
        return objectives.slice(0, progress + 1);
        
      case 'mission2':
        return progress > 0 ? ['Robbing store... ⏳'] : mission.objectives;
        
      case 'mission3':
        return [`Eliminated ${progress}/3 gang members`];
        
      default:
        return mission.objectives;
    }
  };

  return (
    <>
      {/* Mission Status HUD */}
      {activeMission && (
        <div className="absolute top-20 right-4 w-80 z-40">
          <div className="gta-hud p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-orbitron text-lg text-accent">
                {activeMission.title}
              </h3>
              <div className="text-xs text-muted-foreground">
                ACTIVE
              </div>
            </div>
            
            <p className="text-sm font-rajdhani text-muted-foreground mb-3">
              {activeMission.description}
            </p>
            
            <div className="space-y-1">
              {getMissionProgressText(activeMission).map((objective, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <span className="text-accent">•</span>
                  <span className="font-rajdhani">{objective}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <span className="text-green-500 font-orbitron">
                ${activeMission.reward}
              </span>
              <div className="text-xs text-muted-foreground">
                Progress: {Math.round((missionProgress[activeMission.id] || 0) / activeMission.objectives.length * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Selection Button */}
      {!activeMission && availableMissions.length > 0 && (
        <button
          className="absolute top-4 right-4 gta-button px-4 py-2 rounded z-40"
          onClick={() => setShowMissionDialog(true)}
        >
          Available Missions ({availableMissions.length})
        </button>
      )}

      {/* Mission Selection Dialog */}
      {showMissionDialog && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="gta-hud p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="gta-title text-2xl mb-4 text-center">MISSION SELECT</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableMissions.map(mission => (
                <div 
                  key={mission.id}
                  className="border border-accent/30 rounded p-4 hover:border-accent transition-colors cursor-pointer"
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-orbitron text-lg text-accent">
                      {mission.title}
                    </h3>
                    <span className="text-green-500 font-orbitron">
                      ${mission.reward}
                    </span>
                  </div>
                  
                  <p className="text-sm font-rajdhani text-muted-foreground mb-3">
                    {mission.description}
                  </p>
                  
                  <div className="space-y-1">
                    {mission.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <span className="text-accent">•</span>
                        <span className="font-rajdhani">{objective}</span>
                      </div>
                    ))}
                  </div>
                  
                  {selectedMission?.id === mission.id && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        className="gta-button px-4 py-2 rounded text-sm flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          startMission(mission);
                        }}
                      >
                        Start Mission
                      </button>
                      <button
                        className="border border-accent/30 text-accent px-4 py-2 rounded text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMission(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button
                className="gta-button px-6 py-2 rounded"
                onClick={() => setShowMissionDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Complete Notification */}
      {/* This would be handled by a separate notification system */}
    </>
  );
};