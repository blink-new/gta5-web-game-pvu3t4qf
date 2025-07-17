import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemove
}) => {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-900/80 text-green-100';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/80 text-yellow-100';
      case 'error':
        return 'border-red-500 bg-red-900/80 text-red-100';
      default:
        return 'border-accent bg-accent/20 text-accent';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`border-2 rounded-lg p-4 backdrop-blur-sm animate-slide-down ${getNotificationStyle(notification.type)}`}
          style={{ minWidth: '300px' }}
        >
          <div className="flex items-start space-x-3">
            <span className="text-xl">{getNotificationIcon(notification.type)}</span>
            <div className="flex-1">
              <h4 className="font-orbitron font-bold text-lg">
                {notification.title}
              </h4>
              <p className="font-rajdhani text-sm mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-xl hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Play sound effect based on type
    playNotificationSound(notification.type);
    
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};

// Simple sound effects using Web Audio API
const playNotificationSound = (type: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different notification types
    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        break;
      case 'warning':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
        break;
      default:
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
    }

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    // Fallback for browsers that don't support Web Audio API
    console.log('Sound effect not available');
  }
};

// Game-specific notification helpers
export const createGameNotifications = (addNotification: (notification: Omit<Notification, 'id'>) => string) => ({
  missionComplete: (title: string, reward: number) => {
    addNotification({
      type: 'success',
      title: 'Mission Complete!',
      message: `${title} - Earned $${reward}`,
      duration: 4000
    });
  },

  missionFailed: (title: string) => {
    addNotification({
      type: 'error',
      title: 'Mission Failed',
      message: title,
      duration: 4000
    });
  },

  wantedLevelIncrease: (level: number) => {
    addNotification({
      type: 'warning',
      title: 'Wanted Level Increased!',
      message: `Police are now hunting you - ${level} star${level > 1 ? 's' : ''}`,
      duration: 3000
    });
  },

  wantedLevelCleared: () => {
    addNotification({
      type: 'success',
      title: 'Heat Cleared',
      message: 'You are no longer wanted by police',
      duration: 3000
    });
  },

  moneyEarned: (amount: number, source: string) => {
    addNotification({
      type: 'success',
      title: 'Money Earned',
      message: `+$${amount} from ${source}`,
      duration: 2000
    });
  },

  healthLow: () => {
    addNotification({
      type: 'error',
      title: 'Critical Health!',
      message: 'Find medical attention immediately',
      duration: 5000
    });
  },

  vehicleEntered: (vehicleType: string) => {
    addNotification({
      type: 'info',
      title: 'Vehicle Acquired',
      message: `Entered ${vehicleType}`,
      duration: 2000
    });
  },

  weaponPickup: (weaponName: string) => {
    addNotification({
      type: 'info',
      title: 'Weapon Acquired',
      message: `Picked up ${weaponName}`,
      duration: 2000
    });
  }
});