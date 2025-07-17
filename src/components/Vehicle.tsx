import React from 'react';
import { Vehicle as VehicleType } from '../types/game';

interface VehicleProps {
  vehicle: VehicleType;
}

export const Vehicle: React.FC<VehicleProps> = ({ vehicle }) => {
  const getVehicleSize = () => {
    switch (vehicle.type) {
      case 'motorcycle':
        return { width: 'w-4', height: 'h-6' };
      case 'truck':
        return { width: 'w-10', height: 'h-16' };
      default:
        return { width: 'w-6', height: 'h-10' };
    }
  };

  const size = getVehicleSize();

  return (
    <div
      className="absolute transition-all duration-200 ease-linear cursor-pointer hover:scale-110"
      style={{
        left: `${vehicle.x}px`,
        top: `${vehicle.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div 
        className={`${size.width} ${size.height} rounded-sm border-2 border-accent/50 shadow-lg hover:border-accent transition-colors`}
        style={{ backgroundColor: vehicle.color }}
      >
        {/* Vehicle details based on type */}
        {vehicle.type === 'motorcycle' ? (
          <>
            {/* Motorcycle handlebars */}
            <div className="w-3 h-1 bg-gray-400 mx-auto mt-1" />
            {/* Wheels */}
            <div className="flex justify-between px-0.5 mt-2">
              <div className="w-1 h-1 bg-black rounded-full" />
              <div className="w-1 h-1 bg-black rounded-full" />
            </div>
          </>
        ) : (
          <>
            {/* Car windows */}
            <div className="w-4 h-2 bg-blue-200 opacity-60 mx-auto mt-1 rounded-sm" />
            <div className="w-4 h-2 bg-blue-200 opacity-60 mx-auto mt-1 rounded-sm" />
            {/* Wheels */}
            <div className="flex justify-between px-0.5 mt-1">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
          </>
        )}
        
        {/* Health indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-0.5 bg-red-600 rounded">
            <div 
              className="h-full bg-green-500 rounded transition-all duration-300"
              style={{ width: `${vehicle.health}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Interaction hint */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/80 text-accent text-xs px-2 py-1 rounded font-rajdhani">
          Press F
        </div>
      </div>
    </div>
  );
};