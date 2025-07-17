import React, { useState } from 'react';

export const Controls: React.FC = () => {
  const [showControls, setShowControls] = useState(false);

  return (
    <>
      {/* Controls Toggle Button */}
      <button
        className="absolute top-4 left-1/2 transform -translate-x-1/2 gta-button px-4 py-2 rounded z-40"
        onClick={() => setShowControls(!showControls)}
      >
        {showControls ? 'Hide Controls' : 'Show Controls'}
      </button>

      {/* Controls Panel */}
      {showControls && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 gta-hud p-6 rounded-lg z-40 max-w-md">
          <h3 className="gta-title text-xl mb-4 text-center">GAME CONTROLS</h3>
          
          <div className="space-y-3 text-sm font-rajdhani">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-accent font-semibold mb-2">Movement</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Move Up:</span>
                    <span className="text-accent">W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Down:</span>
                    <span className="text-accent">S</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Left:</span>
                    <span className="text-accent">A</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Right:</span>
                    <span className="text-accent">D</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-accent font-semibold mb-2">Actions</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Enter/Exit Vehicle:</span>
                    <span className="text-accent">F</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pause Game:</span>
                    <span className="text-accent">ESC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add Money (Test):</span>
                    <span className="text-accent">R</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wanted Level (Test):</span>
                    <span className="text-accent">T</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle 3D/2D View:</span>
                    <span className="text-accent">V</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-accent/30 pt-3 mt-4">
              <h4 className="text-accent font-semibold mb-2">Tips</h4>
              <ul className="space-y-1 text-xs">
                <li>• Walk near vehicles and press F to enter them</li>
                <li>• Vehicles move faster than walking</li>
                <li>• Watch your health and wanted level</li>
                <li>• Complete missions to earn money</li>
                <li>• Use the minimap to navigate</li>
                <li>• Press V to switch between 2D and 3D views</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button
              className="gta-button px-4 py-2 rounded text-sm"
              onClick={() => setShowControls(false)}
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
};