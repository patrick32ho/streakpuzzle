'use client';

import { GameStatus, MAX_ATTEMPTS } from '@/lib/puzzle';
import type { SubmitResponse } from '@/lib/db';

interface ResultCardProps {
  status: GameStatus;
  result: SubmitResponse | null;
  attemptsUsed: number;
  onShare: () => void;
  onCopy: () => void;
  copied: boolean;
}

export function ResultCard({
  status,
  result,
  attemptsUsed,
  onShare,
  onCopy,
  copied,
}: ResultCardProps) {
  const isWin = status === 'won';
  
  return (
    <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-xl p-6 text-center">
      {/* Result */}
      <div className="mb-4">
        <h2 className={`text-3xl font-bold mb-2 ${isWin ? 'text-success' : 'text-error'}`}>
          {isWin ? 'You Won!' : 'Game Over'}
        </h2>
        <p className="text-lg text-gray-300">
          {isWin 
            ? `Solved in ${attemptsUsed}/${MAX_ATTEMPTS}` 
            : `Better luck tomorrow!`
          }
        </p>
      </div>
      
      {/* Stats */}
      {result && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-2xl font-bold text-white">
              {result.streak.current}
            </p>
            <p className="text-xs text-gray-400">Current Streak</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-2xl font-bold text-white">
              {result.streak.best}
            </p>
            <p className="text-xs text-gray-400">Best Streak</p>
          </div>
          {result.rank && (
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-2xl font-bold text-white">
                #{result.rank}
              </p>
              <p className="text-xs text-gray-400">Today&apos;s Rank</p>
            </div>
          )}
        </div>
      )}
      
      {/* Emoji Grid Preview */}
      {result && (
        <div className="bg-gray-900 rounded-lg p-4 mb-6 font-mono text-sm whitespace-pre-wrap">
          {result.share.emojiGridText}
        </div>
      )}
      
      {/* Share Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onShare}
          className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold
            hover:bg-primary-dark active:scale-98 transition-all"
        >
          Share
        </button>
        <button
          onClick={onCopy}
          className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold
            hover:bg-gray-600 active:scale-98 transition-all"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      
      {/* Claimable Rewards */}
      {result?.claimable && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-3">Rewards Available</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {result.claimable.dailyBadge && (
              <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-medium">
                Daily Badge
              </span>
            )}
            {result.claimable.weeklyStreakBadge && (
              <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-xs font-medium">
                {result.claimable.weeklyStreakBadge}-Day Streak
              </span>
            )}
            {result.claimable.frames?.map(frameId => (
              <span key={frameId} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                Frame #{frameId}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Connect wallet to claim on-chain
          </p>
        </div>
      )}
    </div>
  );
}
