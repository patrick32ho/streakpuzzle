'use client';

import { GameMode, formatDayId } from '@/lib/puzzle';

interface GameHeaderProps {
  dayId: number;
  mode: GameMode;
  attemptsUsed: number;
  attemptsRemaining: number;
  canToggleMode: boolean;
  onToggleMode: () => void;
}

export function GameHeader({
  dayId,
  mode,
  attemptsUsed,
  attemptsRemaining,
  canToggleMode,
  onToggleMode,
}: GameHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <h1 className="text-xl font-bold text-white">
        Grid of the Day {formatDayId(dayId)}
      </h1>
      
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>
          {attemptsUsed > 0 
            ? `Attempt ${attemptsUsed}/${6}` 
            : `${attemptsRemaining} attempts left`
          }
        </span>
        
        <button
          onClick={onToggleMode}
          disabled={!canToggleMode}
          className={`
            px-3 py-1 rounded-full text-xs font-medium
            transition-all
            ${mode === 'hard' 
              ? 'bg-warning text-black' 
              : 'bg-gray-700 text-gray-300'
            }
            ${canToggleMode 
              ? 'hover:opacity-80' 
              : 'opacity-50 cursor-not-allowed'
            }
          `}
        >
          {mode === 'hard' ? '★ Hard Mode' : 'Normal Mode'}
        </button>
      </div>
    </div>
  );
}
