import React from 'react';
import { GameWorld } from './components/GameWorld';

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {/* Game Title Screen */}
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-black animate-fade-in">
        <div className="text-center">
          <h1 className="gta-title text-6xl md:text-8xl mb-4">
            GTA 5
          </h1>
          <h2 className="gta-title text-2xl md:text-4xl mb-8 text-accent/80">
            WEB EDITION
          </h2>
          <p className="font-rajdhani text-lg text-muted-foreground mb-8">
            Welcome to Los Santos
          </p>
          <button 
            className="gta-button px-8 py-4 rounded-lg text-xl font-semibold"
            onClick={() => {
              const titleScreen = document.querySelector('.z-50');
              if (titleScreen) {
                titleScreen.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => titleScreen.remove(), 500);
              }
            }}
          >
            START GAME
          </button>
        </div>
      </div>

      {/* Main Game */}
      <GameWorld />
    </div>
  );
}

export default App;